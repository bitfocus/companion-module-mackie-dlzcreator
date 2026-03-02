import type { InstanceBase } from '@companion-module/base'
import { ModelType, MODEL_CONFIGS } from './constants.js'
import type { ModuleConfig, ModelSelection } from './config.js'

/**
 * Flat key-value state store mirroring the DLZ Creator's internal state.
 */
export class DlzState {
	private state: Map<string, any> = new Map()
	private instance: InstanceBase<ModuleConfig>
	private _model: ModelType = ModelType.DlzCreator
	private _initialized = false
	private _modelOverride: ModelSelection = 'auto'

	constructor(instance: InstanceBase<ModuleConfig>) {
		this.instance = instance
	}

	/**
	 * Set the model selection from the module config.
	 * When set to a specific model, auto-detection is skipped.
	 */
	setModelOverride(selection: ModelSelection): void {
		this._modelOverride = selection
		if (selection === 'dlz-creator') {
			this._model = ModelType.DlzCreator
			this.instance.log('info', 'Model manually set: DLZ Creator')
		} else if (selection === 'dlz-creator-xs') {
			this._model = ModelType.DlzCreatorXS
			this.instance.log('info', 'Model manually set: DLZ Creator XS')
		}
	}

	get model(): ModelType {
		return this._model
	}

	get config() {
		return MODEL_CONFIGS[this._model]
	}

	get initialized(): boolean {
		return this._initialized
	}

	/**
	 * Process an incoming state update from the mixer.
	 * Returns the list of changed keys.
	 */
	update(data: Record<string, any>): string[] {
		const changedKeys: string[] = []

		// Handle INIT response: the server sends { cmd: "INIT", data: { ...3796 keys } }
		if ('cmd' in data) {
			if (data.cmd === 'INIT' && data.data && typeof data.data === 'object') {
				return this.update(data.data as Record<string, any>)
			}
			return changedKeys
		}

		for (const [key, rawValue] of Object.entries(data)) {
			// Coerce booleans to 0/1 (matches mixer reference app behavior)
			const value = typeof rawValue === 'boolean' ? (rawValue ? 1 : 0) : rawValue
			const current = this.state.get(key)
			if (current !== value) {
				this.state.set(key, value)
				changedKeys.push(key)
			}
		}

		// Detect model from device name on first full state load
		if (!this._initialized && changedKeys.length > 10) {
			this._initialized = true
			this.detectModel()
		}

		return changedKeys
	}

	private detectModel(): void {
		// Skip auto-detection if a specific model is configured
		if (this._modelOverride !== 'auto') {
			this.instance.log('info', `Using configured model: ${this._model}`)
			return
		}

		const deviceName = this.get('settings.ndi.devicename')
		if (typeof deviceName === 'string' && deviceName.includes('XS')) {
			this._model = ModelType.DlzCreatorXS
			this.instance.log('info', 'Auto-detected DLZ Creator XS')
		} else {
			this._model = ModelType.DlzCreator
			this.instance.log('info', 'Auto-detected DLZ Creator')
		}
	}

	get(key: string): any {
		return this.state.get(key)
	}

	getNumber(key: string, defaultValue = 0): number {
		const v = this.state.get(key)
		return typeof v === 'number' ? v : defaultValue
	}

	getString(key: string, defaultValue = ''): string {
		const v = this.state.get(key)
		return typeof v === 'string' ? v : defaultValue
	}

	/**
	 * Get a boolean value. Uses Number() coercion so that string "0"
	 * is treated as falsy (off), avoiding the JS quirk where "0" is truthy.
	 */
	getBool(key: string): boolean {
		const v = this.state.get(key)
		if (v === undefined || v === null) return false
		return !!Number(v)
	}

	clear(): void {
		this.state.clear()
		this._initialized = false
		// Preserve manual model override on clear; only reset if auto
		if (this._modelOverride === 'auto') {
			this._model = ModelType.DlzCreator
		}
	}
}
