import type { CompanionVariableDefinition, CompanionVariableValues } from '@companion-module/base'
import type { DlzState } from './state.js'
import { ModelType, MODEL_CONFIGS, RecState, PlayerState, BtStatus, getAvailableChannels, ChannelType, COLOR_LABELS } from './constants.js'
import { formatDb, formatTime } from './utils.js'

/**
 * Build all variable definitions for the current model.
 */
export function GetVariableDefinitions(model: ModelType): CompanionVariableDefinition[] {
	const cfg = MODEL_CONFIGS[model]
	const vars: CompanionVariableDefinition[] = []

	// ── Per-channel variables ─────────────────────────────────────────
	const channels = getAvailableChannels(model)
	for (const ch of channels) {
		const p = ch.prefix.replace(/\./g, '_').replace(/_$/, '')
		const label = ch.label

		vars.push({ variableId: `${p}_name`, name: `${label}: Name` })
		vars.push({ variableId: `${p}_fader_db`, name: `${label}: Fader (dB)` })
		vars.push({ variableId: `${p}_mute`, name: `${label}: Mute` })
		vars.push({ variableId: `${p}_solo`, name: `${label}: Solo` })
		vars.push({ variableId: `${p}_color`, name: `${label}: Color` })
		vars.push({ variableId: `${p}_proc_bypass`, name: `${label}: Processing Bypass` })

		if (ch.type === ChannelType.Input) {
			vars.push({ variableId: `${p}_gain_db`, name: `${label}: Gain (dB)` })
			vars.push({ variableId: `${p}_phantom`, name: `${label}: Phantom (48V)` })
			vars.push({ variableId: `${p}_automix`, name: `${label}: AutoMix` })
		}
	}

	// ── Global variables ──────────────────────────────────────────────
	vars.push({ variableId: 'model', name: 'Detected Model' })
	vars.push({ variableId: 'automix_global', name: 'AutoMix: Global' })
	vars.push({ variableId: 'auto_ducking', name: 'Auto-Ducking' })
	vars.push({ variableId: 'censor_bleep', name: 'Censor Bleep' })

	// ── Recording ─────────────────────────────────────────────────────
	vars.push({ variableId: 'rec_state', name: 'Recording: State' })
	vars.push({ variableId: 'rec_state_text', name: 'Recording: State (Text)' })
	vars.push({ variableId: 'rec_time', name: 'Recording: Time' })
	vars.push({ variableId: 'rec_file', name: 'Recording: Filename' })
	vars.push({ variableId: 'rec_multitrack', name: 'Recording: Multitrack' })

	// ── Media Player ──────────────────────────────────────────────────
	vars.push({ variableId: 'player_state', name: 'Player: State' })
	vars.push({ variableId: 'player_state_text', name: 'Player: State (Text)' })
	vars.push({ variableId: 'player_name', name: 'Player: Track Name' })
	vars.push({ variableId: 'player_pos', name: 'Player: Position' })
	vars.push({ variableId: 'player_length', name: 'Player: Length' })
	vars.push({ variableId: 'player_remaining', name: 'Player: Remaining' })

	// ── Bluetooth ─────────────────────────────────────────────────────
	vars.push({ variableId: 'bt_status', name: 'Bluetooth: Status' })
	vars.push({ variableId: 'bt_status_text', name: 'Bluetooth: Status (Text)' })
	vars.push({ variableId: 'bt_paired_name', name: 'Bluetooth: Paired Device' })

	// ── USB / SD ──────────────────────────────────────────────────────
	vars.push({ variableId: 'usb_status', name: 'USB: Status' })
	vars.push({ variableId: 'sd_status', name: 'SD: Status' })
	vars.push({ variableId: 'usb_time_left', name: 'USB: Time Left' })
	vars.push({ variableId: 'sd_time_left', name: 'SD: Time Left' })

	// ── System ────────────────────────────────────────────────────────
	vars.push({ variableId: 'ip', name: 'Device IP' })
	vars.push({ variableId: 'version', name: 'Firmware Version' })
	vars.push({ variableId: 'snapshot', name: 'Current Snapshot' })
	vars.push({ variableId: 'bank', name: 'Sample: Current Bank' })

	// ── Sample Pads (current bank) ────────────────────────────────────
	for (let i = 0; i < cfg.sample; i++) {
		vars.push({ variableId: `pad_${i}_name`, name: `Pad ${i + 1}: Name` })
		vars.push({ variableId: `pad_${i}_active`, name: `Pad ${i + 1}: Active` })
	}

	// ── FX Buses ──────────────────────────────────────────────────────
	for (let i = 0; i < cfg.fx; i++) {
		vars.push({ variableId: `fx_${i}_type`, name: `FX ${i + 1}: Type` })
		vars.push({ variableId: `fx_${i}_bypass`, name: `FX ${i + 1}: Bypass` })
	}

	// ── Fade control ──────────────────────────────────────────────────
	vars.push({ variableId: 'fade_enabled', name: 'Fade Control: Enabled' })

	return vars
}

// ── State text look-ups ───────────────────────────────────────────────

const REC_STATE_TEXT: Record<number, string> = {
	[RecState.READY]: 'Ready',
	[RecState.ACTIVE]: 'Recording',
	[RecState.PAUSED]: 'Paused',
	[RecState.SAVING]: 'Saving',
	[RecState.SAVED]: 'Saved',
	[RecState.FULL]: 'Full',
}

const PLAYER_STATE_TEXT: Record<number, string> = {
	[PlayerState.CLOSED]: 'Closed',
	[PlayerState.ERROR]: 'Error',
	[PlayerState.STOP]: 'Stopped',
	[PlayerState.PLAY]: 'Playing',
	[PlayerState.LOOP]: 'Looping',
	[PlayerState.PAUSE]: 'Paused',
}

const BT_STATUS_TEXT: Record<number, string> = {
	[BtStatus.DISABLED]: 'Disabled',
	[BtStatus.UNPAIRED]: 'Unpaired',
	[BtStatus.PAIRED]: 'Paired',
	[BtStatus.CONNECTED]: 'Connected',
}

const FX_TYPE_TEXT: Record<number, string> = {
	0: 'Reverb',
	1: 'Delay',
	2: 'Telephone',
	3: 'Voice FX',
}

/**
 * Compute all variable values from current state.
 */
export function GetVariableValues(state: DlzState): CompanionVariableValues {
	const model = state.model
	const cfg = MODEL_CONFIGS[model]
	const values: CompanionVariableValues = {}

	// ── Per-channel variables ─────────────────────────────────────────
	const channels = getAvailableChannels(model)
	for (const ch of channels) {
		const p = ch.prefix.replace(/\./g, '_').replace(/_$/, '')

		values[`${p}_name`] = state.getString(ch.prefix + 'name', '') || ch.label
		// State stores dB directly (wire format)
		values[`${p}_fader_db`] = formatDb(state.getNumber(ch.prefix + 'mix', -200))
		values[`${p}_mute`] = state.getBool(ch.prefix + 'mute') ? 'ON' : 'OFF'
		values[`${p}_solo`] = state.getBool(ch.prefix + 'solo') ? 'ON' : 'OFF'
		const ci = state.getNumber(ch.prefix + 'color', 0)
		values[`${p}_color`] = COLOR_LABELS[ci] ?? String(ci)
		values[`${p}_proc_bypass`] = state.getBool(ch.prefix + 'procBypass') ? 'ON' : 'OFF'

		if (ch.type === ChannelType.Input) {
			// State stores gain in dB directly (wire format, 0-80)
			values[`${p}_gain_db`] = formatDb(state.getNumber(ch.prefix + 'gain', 0))
			values[`${p}_phantom`] = state.getBool(ch.prefix + 'phantom') ? 'ON' : 'OFF'
			values[`${p}_automix`] = state.getBool(ch.prefix + 'amix') ? 'ON' : 'OFF'
		}
	}

	// ── Global ────────────────────────────────────────────────────────
	values['model'] = model
	values['automix_global'] = state.getBool('amix') ? 'ON' : 'OFF'
	values['auto_ducking'] = state.getBool('autoDucking') ? 'ON' : 'OFF'
	values['censor_bleep'] = state.getBool('censorBleep') ? 'ON' : 'OFF'

	// ── Recording ─────────────────────────────────────────────────────
	const recState = state.getNumber('recState', 0)
	values['rec_state'] = recState
	values['rec_state_text'] = REC_STATE_TEXT[recState] ?? 'Unknown'
	values['rec_time'] = formatTime(state.getNumber('recTime', 0))
	values['rec_file'] = state.getString('recFile', '')
	values['rec_multitrack'] = state.getBool('settings.rec.mtk') ? 'ON' : 'OFF'

	// ── Media Player ──────────────────────────────────────────────────
	const playerState = state.getNumber('player.state', 0)
	values['player_state'] = playerState
	values['player_state_text'] = PLAYER_STATE_TEXT[playerState] ?? 'Unknown'
	values['player_name'] = state.getString('player.name', '')
	values['player_pos'] = formatTime(state.getNumber('player.pos', 0))
	values['player_length'] = formatTime(state.getNumber('player.length', 0))
	const remaining = Math.max(0, state.getNumber('player.length', 0) - state.getNumber('player.pos', 0))
	values['player_remaining'] = formatTime(remaining)

	// ── Bluetooth ─────────────────────────────────────────────────────
	const btStatus = state.getNumber('btStatus', 0)
	values['bt_status'] = btStatus
	values['bt_status_text'] = BT_STATUS_TEXT[btStatus] ?? 'Unknown'
	values['bt_paired_name'] = state.getString('btPairedName', '')

	// ── USB / SD ──────────────────────────────────────────────────────
	values['usb_status'] = state.getNumber('usb', 0)
	values['sd_status'] = state.getNumber('sd', 0)
	values['usb_time_left'] = formatTime(state.getNumber('usbTimeLeft', 0))
	values['sd_time_left'] = formatTime(state.getNumber('sdTimeLeft', 0))

	// ── System ────────────────────────────────────────────────────────
	values['ip'] = state.getString('ip', '')
	values['version'] = state.getString('version', '')
	values['snapshot'] = state.getString('snapshot', '')
	values['bank'] = state.getNumber('bank', 0) + 1

	// ── Sample Pads ───────────────────────────────────────────────────
	const bank = state.getNumber('bank', 0)
	for (let i = 0; i < cfg.sample; i++) {
		values[`pad_${i}_name`] = state.getString(`B.${bank}.${i}.name`, `Pad ${i + 1}`)
		values[`pad_${i}_active`] = state.getBool(`B.${bank}.${i}.active`) ? 'ON' : 'OFF'
	}

	// ── FX Buses ──────────────────────────────────────────────────────
	for (let i = 0; i < cfg.fx; i++) {
		values[`fx_${i}_type`] = FX_TYPE_TEXT[state.getNumber(`f.${i}.fxtype`, 0)] ?? 'Unknown'
		values[`fx_${i}_bypass`] = state.getBool(`f.${i}.bypass`) ? 'ON' : 'OFF'
	}

	// ── Fade control ──────────────────────────────────────────────────
	values['fade_enabled'] = state.getBool('ctrl.fade.enable') ? 'ON' : 'OFF'

	return values
}
