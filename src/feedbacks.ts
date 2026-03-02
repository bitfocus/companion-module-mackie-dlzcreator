import { combineRgb, type CompanionFeedbackDefinitions } from '@companion-module/base'
import type { DlzState } from './state.js'
import { RecState, PlayerState, BtStatus, SAMPLE_COLORS } from './constants.js'
import { formatDb } from './utils.js'
import {
	getAllChannelChoices,
	getInputChannelChoices,
	getEqChannelChoices,
	getCompChannelChoices,
	getGateChannelChoices,
	getDsChannelChoices,
	getAuxSendChannelChoices,
	getAuxBusChoices,
	getFxBusChoices,
	getBankChoices,
	getPadChoices,
} from './choices.js'

// ── Shared color constants ────────────────────────────────────────────

const COLOR_WHITE = combineRgb(255, 255, 255)
const COLOR_BLACK = combineRgb(0, 0, 0)
const COLOR_RED = combineRgb(255, 0, 0)
const COLOR_GREEN = combineRgb(0, 204, 0)
const COLOR_YELLOW = combineRgb(255, 204, 0)
const COLOR_ORANGE = combineRgb(255, 128, 0)
const COLOR_BLUE = combineRgb(0, 128, 255)
const COLOR_GRAY = combineRgb(128, 128, 128)

export function GetFeedbacks(state: DlzState): CompanionFeedbackDefinitions {
	const model = state.model

	return {
		// ── Channel Mute ──────────────────────────────────────────────
		channel_mute: {
			type: 'boolean',
			name: 'Channel: Mute State',
			description: 'Change button style when a channel is muted',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
			],
			defaultStyle: {
				bgcolor: COLOR_RED,
				color: COLOR_WHITE,
			},
			callback: (feedback) => {
				const ch = feedback.options.channel as string
				return state.getBool(ch + 'mute')
			},
		},

		// ── Channel Solo ──────────────────────────────────────────────
		channel_solo: {
			type: 'boolean',
			name: 'Channel: Solo State',
			description: 'Change button style when a channel has solo active',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
			],
			defaultStyle: {
				bgcolor: COLOR_YELLOW,
				color: COLOR_BLACK,
			},
			callback: (feedback) => {
				const ch = feedback.options.channel as string
				return state.getBool(ch + 'solo')
			},
		},

		// ── Channel Processing Bypass ─────────────────────────────────
		channel_proc_bypass: {
			type: 'boolean',
			name: 'Channel: Processing Bypass',
			description: 'Change button style when channel processing is bypassed',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
			],
			defaultStyle: {
				bgcolor: COLOR_ORANGE,
				color: COLOR_BLACK,
			},
			callback: (feedback) => {
				const ch = feedback.options.channel as string
				return state.getBool(ch + 'procBypass')
			},
		},

		// ── Phantom Power ─────────────────────────────────────────────
		input_phantom: {
			type: 'boolean',
			name: 'Input: Phantom Power (48V)',
			description: 'Change button style when phantom power is on',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Input Channel',
					choices: getInputChannelChoices(model),
					default: 'i.0.',
				},
			],
			defaultStyle: {
				bgcolor: COLOR_RED,
				color: COLOR_WHITE,
			},
			callback: (feedback) => {
				const ch = feedback.options.channel as string
				return state.getBool(ch + 'phantom')
			},
		},

		// ── AutoMix ───────────────────────────────────────────────────
		input_automix: {
			type: 'boolean',
			name: 'Input: AutoMix Active',
			description: 'Change button style when AutoMix is enabled for this input',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Input Channel',
					choices: getInputChannelChoices(model),
					default: 'i.0.',
				},
			],
			defaultStyle: {
				bgcolor: COLOR_GREEN,
				color: COLOR_BLACK,
			},
			callback: (feedback) => {
				const ch = feedback.options.channel as string
				return state.getBool(ch + 'amix')
			},
		},

		automix_global: {
			type: 'boolean',
			name: 'AutoMix: Global Active',
			description: 'Change button style when global AutoMix is enabled',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_GREEN,
				color: COLOR_BLACK,
			},
			callback: () => {
				return state.getBool('amix')
			},
		},

		// ── EQ Bypass ─────────────────────────────────────────────────
		eq_bypass: {
			type: 'boolean',
			name: 'EQ: Bypass Active',
			description: 'Change button style when EQ is bypassed',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getEqChannelChoices(model),
					default: 'i.0.',
				},
			],
			defaultStyle: {
				bgcolor: COLOR_ORANGE,
				color: COLOR_BLACK,
			},
			callback: (feedback) => {
				const ch = feedback.options.channel as string
				return state.getBool(ch + 'eq.bypass')
			},
		},

		// ── Compressor Bypass ─────────────────────────────────────────
		comp_bypass: {
			type: 'boolean',
			name: 'Compressor: Bypass Active',
			description: 'Change button style when compressor is bypassed',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getCompChannelChoices(model),
					default: 'i.0.',
				},
			],
			defaultStyle: {
				bgcolor: COLOR_ORANGE,
				color: COLOR_BLACK,
			},
			callback: (feedback) => {
				const ch = feedback.options.channel as string
				return state.getBool(ch + 'comp.bypass')
			},
		},

		// ── Gate Bypass ───────────────────────────────────────────────
		gate_bypass: {
			type: 'boolean',
			name: 'Gate: Bypass Active',
			description: 'Change button style when gate is bypassed',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getGateChannelChoices(model),
					default: 'i.0.',
				},
			],
			defaultStyle: {
				bgcolor: COLOR_ORANGE,
				color: COLOR_BLACK,
			},
			callback: (feedback) => {
				const ch = feedback.options.channel as string
				return state.getBool(ch + 'gate.bypass')
			},
		},

		// ── De-esser Bypass ───────────────────────────────────────────
		ds_bypass: {
			type: 'boolean',
			name: 'De-esser: Bypass Active',
			description: 'Change button style when de-esser is bypassed',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getDsChannelChoices(model),
					default: 'i.0.',
				},
			],
			defaultStyle: {
				bgcolor: COLOR_ORANGE,
				color: COLOR_BLACK,
			},
			callback: (feedback) => {
				const ch = feedback.options.channel as string
				return state.getBool(ch + 'ds.bypass')
			},
		},

		// ── Aux Send Mute ─────────────────────────────────────────────
		aux_send_mute: {
			type: 'boolean',
			name: 'Aux Send: Mute State',
			description: 'Change button style when an aux send is muted',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Source Channel',
					choices: getAuxSendChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'aux',
					label: 'Aux Bus',
					choices: getAuxBusChoices(model),
					default: '0',
				},
			],
			defaultStyle: {
				bgcolor: COLOR_RED,
				color: COLOR_WHITE,
			},
			callback: (feedback) => {
				const ch = feedback.options.channel as string
				const aux = feedback.options.aux as string
				return state.getBool(ch + `aux.${aux}.mute`)
			},
		},

		// ── FX Bus Bypass ─────────────────────────────────────────────
		fx_bus_bypass: {
			type: 'boolean',
			name: 'FX Bus: Bypass Active',
			description: 'Change button style when FX bus is bypassed',
			options: [
				{
					type: 'dropdown',
					id: 'bus',
					label: 'FX Bus',
					choices: getFxBusChoices(model),
					default: '0',
				},
			],
			defaultStyle: {
				bgcolor: COLOR_ORANGE,
				color: COLOR_BLACK,
			},
			callback: (feedback) => {
				const bus = feedback.options.bus as string
				return state.getBool(`f.${bus}.bypass`)
			},
		},

		// ── Recording State ───────────────────────────────────────────
		rec_active: {
			type: 'boolean',
			name: 'Recording: Active',
			description: 'Change button style when recording is active',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_RED,
				color: COLOR_WHITE,
			},
			callback: () => {
				return state.getNumber('recState', 0) === RecState.ACTIVE
			},
		},

		rec_paused: {
			type: 'boolean',
			name: 'Recording: Paused',
			description: 'Change button style when recording is paused',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_YELLOW,
				color: COLOR_BLACK,
			},
			callback: () => {
				return state.getNumber('recState', 0) === RecState.PAUSED
			},
		},

		rec_any: {
			type: 'boolean',
			name: 'Recording: Active or Paused',
			description: 'Change button style when recording is active or paused',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_RED,
				color: COLOR_WHITE,
			},
			callback: () => {
				const rs = state.getNumber('recState', 0)
				return rs === RecState.ACTIVE || rs === RecState.PAUSED
			},
		},

		// ── Player State ──────────────────────────────────────────────
		player_playing: {
			type: 'boolean',
			name: 'Player: Playing',
			description: 'Change button style when media player is playing',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_GREEN,
				color: COLOR_BLACK,
			},
			callback: () => {
				const ps = state.getNumber('player.state', 0)
				return ps === PlayerState.PLAY || ps === PlayerState.LOOP
			},
		},

		player_paused: {
			type: 'boolean',
			name: 'Player: Paused',
			description: 'Change button style when media player is paused',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_YELLOW,
				color: COLOR_BLACK,
			},
			callback: () => {
				return state.getNumber('player.state', 0) === PlayerState.PAUSE
			},
		},

		player_stopped: {
			type: 'boolean',
			name: 'Player: Stopped',
			description: 'Change button style when media player is stopped',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_GRAY,
				color: COLOR_WHITE,
			},
			callback: () => {
				return state.getNumber('player.state', 0) === PlayerState.STOP
			},
		},

		// ── Bluetooth ─────────────────────────────────────────────────
		bt_connected: {
			type: 'boolean',
			name: 'Bluetooth: Connected',
			description: 'Change button style when Bluetooth device is connected',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_BLUE,
				color: COLOR_WHITE,
			},
			callback: () => {
				return state.getNumber('btStatus', 0) === BtStatus.CONNECTED
			},
		},

		bt_paired: {
			type: 'boolean',
			name: 'Bluetooth: Paired',
			description: 'Change button style when Bluetooth device is paired (or connected)',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_BLUE,
				color: COLOR_WHITE,
			},
			callback: () => {
				const bt = state.getNumber('btStatus', 0)
				return bt === BtStatus.PAIRED || bt === BtStatus.CONNECTED
			},
		},

		bt_enabled: {
			type: 'boolean',
			name: 'Bluetooth: Enabled',
			description: 'Change button style when Bluetooth is enabled on the mixer',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_BLUE,
				color: COLOR_WHITE,
			},
			callback: () => {
				return state.getBool('settings.bt.enabled')
			},
		},

		// ── Sample Pad ────────────────────────────────────────────────
		pad_active: {
			type: 'boolean',
			name: 'Sample Pad: Active',
			description: 'Change button style when a sample pad is active (playing)',
			options: [
				{
					type: 'dropdown',
					id: 'bank',
					label: 'Bank',
					choices: [{ id: 'current', label: 'Current Bank' }, ...getBankChoices()],
					default: 'current',
				},
				{
					type: 'dropdown',
					id: 'pad',
					label: 'Pad',
					choices: getPadChoices(),
					default: '0',
				},
			],
			defaultStyle: {
				bgcolor: COLOR_GREEN,
				color: COLOR_BLACK,
			},
			callback: (feedback) => {
				let bank = feedback.options.bank as string
				const pad = feedback.options.pad as string
				if (bank === 'current') {
					bank = String(state.getNumber('bank', 0))
				}
				return state.getBool(`B.${bank}.${pad}.active`)
			},
		},

		// ── Censor Bleep ──────────────────────────────────────────────
		censor_active: {
			type: 'boolean',
			name: 'Censor: Bleep Active',
			description: 'Change button style when censor bleep is active',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_RED,
				color: COLOR_WHITE,
			},
			callback: () => {
				return state.getBool('censorBleep')
			},
		},

		// ── Auto-ducking ──────────────────────────────────────────────
		auto_ducking: {
			type: 'boolean',
			name: 'Auto-Ducking: Active',
			description: 'Change button style when auto-ducking is enabled',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_GREEN,
				color: COLOR_BLACK,
			},
			callback: () => {
				return state.getBool('autoDucking')
			},
		},

		// ── Fade Control ──────────────────────────────────────────────
		fade_enabled: {
			type: 'boolean',
			name: 'Fade Control: Enabled',
			description: 'Change button style when fade control is enabled',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_GREEN,
				color: COLOR_BLACK,
			},
			callback: () => {
				return state.getBool('ctrl.fade.enable')
			},
		},

		// ── Channel Color ─────────────────────────────────────────────
		channel_color: {
			type: 'advanced',
			name: 'Channel: Show Color',
			description: 'Set button background to the channel color',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
			],
			callback: (feedback) => {
				const ch = feedback.options.channel as string
				const colorIdx = state.getNumber(ch + 'color', 0)
				const hex = SAMPLE_COLORS[colorIdx] || SAMPLE_COLORS[0]
				const r = parseInt(hex.slice(1, 3), 16)
				const g = parseInt(hex.slice(3, 5), 16)
				const b = parseInt(hex.slice(5, 7), 16)
				// Choose text color for contrast
				const lum = 0.299 * r + 0.587 * g + 0.114 * b
				return {
					bgcolor: combineRgb(r, g, b),
					color: lum > 128 ? COLOR_BLACK : COLOR_WHITE,
				}
			},
		},

		// ── Channel Fader Level Text ──────────────────────────────────
		channel_fader_level: {
			type: 'advanced',
			name: 'Channel: Fader Level Display',
			description: 'Show the current fader level in dB as button text',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
			],
			callback: (feedback) => {
				const ch = feedback.options.channel as string
				// State stores dB directly (wire format)
				const db = state.getNumber(ch + 'mix', -200)
				return { text: formatDb(db) }
			},
		},

		// ── Input Gain Display ────────────────────────────────────────
		input_gain_level: {
			type: 'advanced',
			name: 'Input: Gain Level Display',
			description: 'Show the current input gain in dB as button text',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Input Channel',
					choices: getInputChannelChoices(model),
					default: 'i.0.',
				},
			],
			callback: (feedback) => {
				const ch = feedback.options.channel as string
				// State stores gain in dB directly (wire format, 0-80)
				const db = state.getNumber(ch + 'gain', 0)
				return { text: formatDb(db) }
			},
		},

		// ── Recording Multitrack ──────────────────────────────────────
		rec_multitrack: {
			type: 'boolean',
			name: 'Recording: Multitrack Mode',
			description: 'Change button style when multitrack recording is enabled',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_GREEN,
				color: COLOR_BLACK,
			},
			callback: () => {
				return state.getBool('settings.rec.mtk')
			},
		},

		// ── FX Enabled States ─────────────────────────────────────────
		fx_reverb_enabled: {
			type: 'boolean',
			name: 'FX Channel: Reverb Enabled',
			description: 'Change button style when channel reverb FX is enabled',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_GREEN,
				color: COLOR_BLACK,
			},
			callback: () => {
				return state.getBool('fx.rev.enabled')
			},
		},

		fx_delay_enabled: {
			type: 'boolean',
			name: 'FX Channel: Delay Enabled',
			description: 'Change button style when channel delay FX is enabled',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_GREEN,
				color: COLOR_BLACK,
			},
			callback: () => {
				return state.getBool('fx.del.enabled')
			},
		},

		fx_phone_enabled: {
			type: 'boolean',
			name: 'FX Channel: Telephone Enabled',
			description: 'Change button style when telephone FX is enabled',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_GREEN,
				color: COLOR_BLACK,
			},
			callback: () => {
				return state.getBool('fx.phone.enabled')
			},
		},

		fx_voice_enabled: {
			type: 'boolean',
			name: 'FX Channel: Voice FX Enabled',
			description: 'Change button style when voice FX is enabled',
			options: [],
			defaultStyle: {
				bgcolor: COLOR_GREEN,
				color: COLOR_BLACK,
			},
			callback: () => {
				return state.getBool('fx.voice.enabled')
			},
		},

		// ── Selected Bank ─────────────────────────────────────────────
		bank_selected: {
			type: 'boolean',
			name: 'Sample: Bank Selected',
			description: 'Change button style when the specified bank is selected',
			options: [
				{
					type: 'dropdown',
					id: 'bank',
					label: 'Bank',
					choices: getBankChoices(),
					default: '0',
				},
			],
			defaultStyle: {
				bgcolor: COLOR_GREEN,
				color: COLOR_BLACK,
			},
			callback: (feedback) => {
				return state.getNumber('bank', 0) === parseInt(feedback.options.bank as string, 10)
			},
		},
	}
}
