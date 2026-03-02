import {
	InstanceBase,
	InstanceStatus,
	runEntrypoint,
	type SomeCompanionConfigField,
} from '@companion-module/base'
import { GetConfigFields, type ModuleConfig } from './config.js'
import { DlzConnection } from './connection.js'
import { DlzState } from './state.js'
import { GetActions } from './actions.js'
import { GetFeedbacks } from './feedbacks.js'
import { GetVariableDefinitions, GetVariableValues } from './variables.js'
import { GetPresets } from './presets.js'
import { UpgradeScripts } from './upgrades.js'
import { DEFAULT_PORT } from './constants.js'

class DlzCreatorInstance extends InstanceBase<ModuleConfig> {
	private connection!: DlzConnection
	private state!: DlzState
	private variableUpdateTimer: ReturnType<typeof setInterval> | null = null

	async init(config: ModuleConfig): Promise<void> {
		this.state = new DlzState(this)
		this.state.setModelOverride(config.model ?? 'auto')
		this.connection = new DlzConnection(this, (data) => this.onStateUpdate(data))

		this.updateStatus(InstanceStatus.Disconnected)
		this.setupModuleDefinitions()

		if (config.bonjourHost || config.host) {
			this.connect(config)
		} else {
			this.updateStatus(InstanceStatus.BadConfig, 'No host configured')
		}
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.connection.disconnect()
		this.state.setModelOverride(config.model ?? 'auto')
		this.state.clear()
		this.setupModuleDefinitions()

		if (config.bonjourHost || config.host) {
			this.connect(config)
		} else {
			this.updateStatus(InstanceStatus.BadConfig, 'No host configured')
		}
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	async destroy(): Promise<void> {
		this.stopVariableUpdates()
		this.connection.destroy()
	}

	// ── Private Helpers ───────────────────────────────────────────────

	private connect(config: ModuleConfig): void {
		let host: string
		let port: number

		if (config.bonjourHost) {
			// Bonjour device selected — value is "ip:port"
			const parts = config.bonjourHost.split(':')
			host = parts[0]
			port = parts.length > 1 ? Number(parts[1]) : DEFAULT_PORT
		} else {
			host = config.host
			port = config.port || DEFAULT_PORT
		}

		if (!host) {
			this.updateStatus(InstanceStatus.BadConfig, 'No host configured')
			return
		}

		this.updateStatus(InstanceStatus.Connecting)
		this.connection.connect(host, port)
	}

	private onStateUpdate(data: Record<string, any>): void {
		const changedKeys = this.state.update(data)

		if (changedKeys.length === 0) return

		// On first big state load, re-configure definitions for detected model
		if (this.state.initialized && changedKeys.length > 10) {
			this.log('info', `Model detected: ${this.state.model}`)
			this.setupModuleDefinitions()
		}

		// Check feedbacks for relevant changes
		this.checkFeedbacks(...this.getAffectedFeedbacks(changedKeys))

		// Update variables
		this.updateVariableValues()
	}

	private setupModuleDefinitions(): void {
		const model = this.state.model

		this.setActionDefinitions(GetActions(this.connection, this.state, this))
		this.setFeedbackDefinitions(GetFeedbacks(this.state))
		this.setVariableDefinitions(GetVariableDefinitions(model))
		this.setPresetDefinitions(GetPresets(model))

		this.updateVariableValues()
	}

	private updateVariableValues(): void {
		try {
			this.setVariableValues(GetVariableValues(this.state))
		} catch {
			// Ignore errors during variable update (may happen during init)
		}
	}

	private stopVariableUpdates(): void {
		if (this.variableUpdateTimer) {
			clearInterval(this.variableUpdateTimer)
			this.variableUpdateTimer = null
		}
	}

	/**
	 * Map changed state keys to feedback IDs that need to be rechecked.
	 */
	private getAffectedFeedbacks(changedKeys: string[]): string[] {
		const feedbacks = new Set<string>()

		for (const key of changedKeys) {
			if (key.endsWith('.mute')) feedbacks.add('channel_mute').add('aux_send_mute')
			if (key.endsWith('.solo')) feedbacks.add('channel_solo')
			if (key.endsWith('.procBypass')) feedbacks.add('channel_proc_bypass')
			if (key.endsWith('.phantom')) feedbacks.add('input_phantom')
			if (key.endsWith('.amix')) feedbacks.add('input_automix')
			if (key === 'amix') feedbacks.add('automix_global')
			if (key.includes('eq.bypass')) feedbacks.add('eq_bypass')
			if (key.includes('comp.bypass')) feedbacks.add('comp_bypass')
			if (key.includes('gate.bypass')) feedbacks.add('gate_bypass')
			if (key.includes('ds.bypass')) feedbacks.add('ds_bypass')
			if (key.endsWith('.bypass') && key.startsWith('f.')) feedbacks.add('fx_bus_bypass')
			if (key === 'recState') feedbacks.add('rec_active').add('rec_paused').add('rec_any')
			if (key === 'player.state')
				feedbacks.add('player_playing').add('player_paused').add('player_stopped')
			if (key === 'btStatus') feedbacks.add('bt_connected').add('bt_paired')
			if (key === 'settings.bt.enabled') feedbacks.add('bt_enabled')
			if (key.includes('.active') && key.startsWith('B.')) feedbacks.add('pad_active')
			if (key === 'censorBleep') feedbacks.add('censor_active')
			if (key === 'autoDucking') feedbacks.add('auto_ducking')
			if (key === 'ctrl.fade.enable') feedbacks.add('fade_enabled')
			if (key.endsWith('.color')) feedbacks.add('channel_color')
			if (key.endsWith('.mix')) feedbacks.add('channel_fader_level')
			if (key.endsWith('.gain') && !key.includes('comp.') && !key.includes('eq.'))
				feedbacks.add('input_gain_level')
			if (key === 'settings.rec.mtk') feedbacks.add('rec_multitrack')
			if (key === 'fx.rev.enabled') feedbacks.add('fx_reverb_enabled')
			if (key === 'fx.del.enabled') feedbacks.add('fx_delay_enabled')
			if (key === 'fx.phone.enabled') feedbacks.add('fx_phone_enabled')
			if (key === 'fx.voice.enabled') feedbacks.add('fx_voice_enabled')
			if (key === 'bank') feedbacks.add('bank_selected').add('pad_active')
		}

		return Array.from(feedbacks)
	}
}

runEntrypoint(DlzCreatorInstance, UpgradeScripts)
