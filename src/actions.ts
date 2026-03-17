import type { CompanionActionDefinitions, InstanceBase } from '@companion-module/base'
import type { DlzConnection } from './connection.js'
import type { DlzState } from './state.js'
import type { ModuleConfig } from './config.js'
import { clamp, VtoMix, MixToV, dbToTrim, dbToEqGain, hzToEqFreq, valToEqQ } from './utils.js'
import { dbToCompThresh, dbToCompGain, valToCompRatio, msToCompAttack, msToCompRelease, msToCompHold } from './utils.js'
import { dbToGateThresh, dbToGateDepth, msToGateAttack, msToGateRelease, msToGateHold } from './utils.js'
import { dbToDsThresh, hzToDsFreq, dbToDsRange } from './utils.js'
import {
	msToRevPredelay,
	msToRevTime,
	hzToRevLpf,
	msToDelTime,
	pctToDelFeedback,
	hzToDelLpf,
	msToDelay,
} from './utils.js'
import {
	getAllChannelChoices,
	getInputChannelChoices,
	getEqChannelChoices,
	getCompChannelChoices,
	getGateChannelChoices,
	getDsChannelChoices,
	getAuxSendChannelChoices,
	getFxSendChannelChoices,
	getAuxBusChoices,
	getFxBusChoices,
	getColorChoices,
	getEqBandChoices,
	getMuteToggleChoices,
	getOnOffToggleChoices,
	getBankChoices,
	getPadChoices,
	getFxTypeChoices,
	getFxVoiceChoices,
	getFxRobotSizeChoices,
	getEqHpSlopeChoices,
} from './choices.js'

/**
 * Resolve a toggle value: returns the new numeric state.
 * Uses Number() coercion so that string "0" and boolean false
 * are both treated as falsy (off), avoiding the JS quirk where
 * the string "0" is truthy.
 */
function resolveToggle(actionValue: string, currentState: any): number {
	if (actionValue === 'toggle') return Number(currentState) ? 0 : 1
	return parseInt(actionValue, 10)
}

export function GetActions(
	connection: DlzConnection,
	state: DlzState,
	instance: InstanceBase<ModuleConfig>,
): CompanionActionDefinitions {
	const model = state.model

	return {
		// ── Channel Fader ─────────────────────────────────────────────
		channel_fader: {
			name: 'Channel: Set Fader Level (dB)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'level',
					label: 'Level (dB)',
					default: 0,
					min: -96,
					max: 10,
					step: 0.5,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const db = action.options.level as number
				// Wire format for mix is dB (convOut = VtoMix)
				connection.setState(ch + 'mix', db)
			},
		},

		channel_fader_norm: {
			name: 'Channel: Set Fader Level (Normalized 0–100%)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'level',
					label: 'Level (%)',
					default: 75,
					min: 0,
					max: 100,
					step: 1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const v = (action.options.level as number) / 100
				// Convert 0-1 position to dB for wire format
				connection.setState(ch + 'mix', VtoMix(clamp(v)))
			},
		},

		channel_fader_adjust: {
			name: 'Channel: Adjust Fader Level',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'delta',
					label: 'Adjustment (%)',
					default: 5,
					min: -100,
					max: 100,
					step: 1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				// State stores dB; convert to 0-1, adjust, convert back
				const currentV = MixToV(state.getNumber(ch + 'mix', -200))
				const delta = (action.options.delta as number) / 100
				connection.setState(ch + 'mix', VtoMix(clamp(currentV + delta)))
			},
		},

		// ── Channel Mute ──────────────────────────────────────────────
		channel_mute: {
			name: 'Channel: Mute',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getMuteToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const key = ch + 'mute'
				const raw = state.get(key)
				const newVal = resolveToggle(action.options.value as string, raw)
				instance.log(
					'debug',
					`Mute toggle: key=${key} rawState=${JSON.stringify(raw)} (type=${typeof raw}) -> sending ${newVal}`,
				)
				connection.setState(key, newVal)
			},
		},

		// ── Channel Solo ──────────────────────────────────────────────
		channel_solo: {
			name: 'Channel: Solo',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const key = ch + 'solo'
				const raw = state.get(key)
				const newVal = resolveToggle(action.options.value as string, raw)
				instance.log(
					'debug',
					`Solo toggle: key=${key} rawState=${JSON.stringify(raw)} (type=${typeof raw}) -> sending ${newVal}`,
				)
				connection.setState(key, newVal)
			},
		},

		// ── Channel Pan ───────────────────────────────────────────────
		channel_pan: {
			name: 'Channel: Set Pan',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'pan',
					label: 'Pan (0=Left, 50=Center, 100=Right)',
					default: 50,
					min: 0,
					max: 100,
					step: 1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'pan', clamp((action.options.pan as number) / 100))
			},
		},

		// ── Channel Color ─────────────────────────────────────────────
		channel_color: {
			name: 'Channel: Set Color',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'color',
					label: 'Color',
					choices: getColorChoices(),
					default: '0',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'color', parseInt(action.options.color as string, 10))
			},
		},

		// ── Channel Name ──────────────────────────────────────────────
		channel_name: {
			name: 'Channel: Set Name',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'textinput',
					id: 'name',
					label: 'Name',
					default: '',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'name', action.options.name as string)
			},
		},

		// ── Channel Processing Bypass ─────────────────────────────────
		channel_proc_bypass: {
			name: 'Channel: Processing Bypass',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const key = ch + 'procBypass'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		// ── Input Gain ────────────────────────────────────────────────
		input_gain: {
			name: 'Input: Set Gain (dB)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Input Channel',
					choices: getInputChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'gain',
					label: 'Gain (dB)',
					default: 0,
					min: 0,
					max: 80,
					step: 1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				// Wire format for gain is raw dB (0-80, integer)
				connection.setState(ch + 'gain', Math.round(action.options.gain as number))
			},
		},

		input_gain_adjust: {
			name: 'Input: Adjust Gain',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Input Channel',
					choices: getInputChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'delta',
					label: 'Adjustment (dB)',
					default: 1,
					min: -80,
					max: 80,
					step: 1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				// State stores raw dB (0-80)
				const currentDb = state.getNumber(ch + 'gain', 0)
				const newDb = Math.max(0, Math.min(80, currentDb + (action.options.delta as number)))
				connection.setState(ch + 'gain', Math.round(newDb))
			},
		},

		// ── Input Phantom Power ───────────────────────────────────────
		input_phantom: {
			name: 'Input: Phantom Power (48V)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Input Channel',
					choices: getInputChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const key = ch + 'phantom'
				const raw = state.get(key)
				const newVal = resolveToggle(action.options.value as string, raw)
				instance.log(
					'debug',
					`Phantom toggle: key=${key} rawState=${JSON.stringify(raw)} (type=${typeof raw}) -> sending ${newVal}`,
				)
				connection.setState(key, newVal)
			},
		},

		// ── AutoMix ───────────────────────────────────────────────────
		input_automix: {
			name: 'Input: AutoMix',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Input Channel',
					choices: getInputChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const key = ch + 'amix'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		automix_global: {
			name: 'AutoMix: Global Enable',
			options: [
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const key = 'amix'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		// ── Player Trim ───────────────────────────────────────────────
		player_trim: {
			name: 'Player/Virtual: Set Trim (dB)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getAllChannelChoices(model).filter(
						(c) => c.id.toString().startsWith('p.') || c.id.toString().startsWith('v.'),
					),
					default: 'p.0.',
				},
				{
					type: 'number',
					id: 'trim',
					label: 'Trim (dB)',
					default: 0,
					min: -20,
					max: 40,
					step: 1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'trim', clamp(dbToTrim(action.options.trim as number)))
			},
		},

		// ── EQ ────────────────────────────────────────────────────────
		eq_bypass: {
			name: 'EQ: Bypass',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getEqChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const key = ch + 'eq.bypass'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		eq_band_bypass: {
			name: 'EQ: Band Bypass',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getEqChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'band',
					label: 'Band',
					choices: getEqBandChoices(),
					default: 'b1',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const band = action.options.band as string
				const key = ch + 'eq.' + band + '.bypass'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		eq_band_gain: {
			name: 'EQ: Set Band Gain (dB)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getEqChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'band',
					label: 'Band',
					choices: getEqBandChoices().filter((b) => b.id !== 'hp'),
					default: 'b1',
				},
				{
					type: 'number',
					id: 'gain',
					label: 'Gain (dB)',
					default: 0,
					min: -15,
					max: 15,
					step: 0.5,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const band = action.options.band as string
				connection.setState(ch + 'eq.' + band + '.gain', clamp(dbToEqGain(action.options.gain as number)))
			},
		},

		eq_band_freq: {
			name: 'EQ: Set Band Frequency (Hz)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getEqChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'band',
					label: 'Band',
					choices: getEqBandChoices(),
					default: 'b1',
				},
				{
					type: 'number',
					id: 'freq',
					label: 'Frequency (Hz)',
					default: 1000,
					min: 20,
					max: 20000,
					step: 1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const band = action.options.band as string
				connection.setState(ch + 'eq.' + band + '.freq', clamp(hzToEqFreq(action.options.freq as number)))
			},
		},

		eq_band_q: {
			name: 'EQ: Set Band Q',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getEqChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'band',
					label: 'Band',
					choices: getEqBandChoices().filter((b) => b.id !== 'hp'),
					default: 'b1',
				},
				{
					type: 'number',
					id: 'q',
					label: 'Q',
					default: 1.89,
					min: 0.1,
					max: 15,
					step: 0.01,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const band = action.options.band as string
				connection.setState(ch + 'eq.' + band + '.q', clamp(valToEqQ(action.options.q as number)))
			},
		},

		eq_hp_slope: {
			name: 'EQ: Set HP Slope',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getEqChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'slope',
					label: 'Slope',
					choices: getEqHpSlopeChoices(),
					default: '1',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'eq.hp.slope', parseInt(action.options.slope as string, 10))
			},
		},

		// ── Compressor ────────────────────────────────────────────────
		comp_bypass: {
			name: 'Compressor: Bypass',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getCompChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const key = ch + 'comp.bypass'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		comp_thresh: {
			name: 'Compressor: Set Threshold (dB)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getCompChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'thresh',
					label: 'Threshold (dB)',
					default: -30,
					min: -60,
					max: 0,
					step: 0.5,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'comp.thresh', clamp(dbToCompThresh(action.options.thresh as number)))
			},
		},

		comp_ratio: {
			name: 'Compressor: Set Ratio',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getCompChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'ratio',
					label: 'Ratio',
					default: 2,
					min: 1,
					max: 20,
					step: 0.1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'comp.ratio', clamp(valToCompRatio(action.options.ratio as number)))
			},
		},

		comp_gain: {
			name: 'Compressor: Set Makeup Gain (dB)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getCompChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'gain',
					label: 'Gain (dB)',
					default: 0,
					min: 0,
					max: 24,
					step: 0.5,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'comp.gain', clamp(dbToCompGain(action.options.gain as number)))
			},
		},

		comp_attack: {
			name: 'Compressor: Set Attack (ms)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getCompChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'attack',
					label: 'Attack (ms)',
					default: 42,
					min: 0.5,
					max: 500,
					step: 0.5,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'comp.attack', clamp(msToCompAttack(action.options.attack as number)))
			},
		},

		comp_release: {
			name: 'Compressor: Set Release (ms)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getCompChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'release',
					label: 'Release (ms)',
					default: 500,
					min: 10,
					max: 2000,
					step: 1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'comp.release', clamp(msToCompRelease(action.options.release as number)))
			},
		},

		comp_hold: {
			name: 'Compressor: Set Hold (ms)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getCompChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'hold',
					label: 'Hold (ms)',
					default: 0,
					min: 0,
					max: 500,
					step: 1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'comp.hold', clamp(msToCompHold(action.options.hold as number)))
			},
		},

		comp_knee: {
			name: 'Compressor: Set Knee (Soft/Hard)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getCompChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Knee',
					choices: [
						{ id: '0', label: 'Hard' },
						{ id: '1', label: 'Soft' },
					],
					default: '1',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'comp.knee', parseInt(action.options.value as string, 10))
			},
		},

		// ── Gate ──────────────────────────────────────────────────────
		gate_bypass: {
			name: 'Gate: Bypass',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getGateChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const key = ch + 'gate.bypass'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		gate_thresh: {
			name: 'Gate: Set Threshold (dB)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getGateChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'thresh',
					label: 'Threshold (dB)',
					default: -45,
					min: -60,
					max: 0,
					step: 0.5,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'gate.thresh', clamp(dbToGateThresh(action.options.thresh as number)))
			},
		},

		gate_depth: {
			name: 'Gate: Set Depth (dB)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getGateChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'depth',
					label: 'Depth (dB)',
					default: -19,
					min: -80,
					max: 0,
					step: 1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'gate.depth', clamp(dbToGateDepth(action.options.depth as number)))
			},
		},

		gate_attack: {
			name: 'Gate: Set Attack (ms)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getGateChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'attack',
					label: 'Attack (ms)',
					default: 19,
					min: 0.5,
					max: 500,
					step: 0.5,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'gate.attack', clamp(msToGateAttack(action.options.attack as number)))
			},
		},

		gate_release: {
			name: 'Gate: Set Release (ms)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getGateChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'release',
					label: 'Release (ms)',
					default: 92,
					min: 10,
					max: 2000,
					step: 1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'gate.release', clamp(msToGateRelease(action.options.release as number)))
			},
		},

		gate_hold: {
			name: 'Gate: Set Hold (ms)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getGateChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'hold',
					label: 'Hold (ms)',
					default: 50,
					min: 0,
					max: 500,
					step: 1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'gate.hold', clamp(msToGateHold(action.options.hold as number)))
			},
		},

		// ── De-esser ──────────────────────────────────────────────────
		ds_bypass: {
			name: 'De-esser: Bypass',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getDsChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const key = ch + 'ds.bypass'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		ds_thresh: {
			name: 'De-esser: Set Threshold (dB)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getDsChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'thresh',
					label: 'Threshold (dB)',
					default: -48,
					min: -96,
					max: 0,
					step: 0.5,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'ds.thresh', clamp(dbToDsThresh(action.options.thresh as number)))
			},
		},

		ds_freq: {
			name: 'De-esser: Set Frequency (Hz)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getDsChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'freq',
					label: 'Frequency (Hz)',
					default: 6445,
					min: 20,
					max: 20000,
					step: 1,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'ds.freq', clamp(hzToDsFreq(action.options.freq as number)))
			},
		},

		ds_range: {
			name: 'De-esser: Set Range (dB)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Channel',
					choices: getDsChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'number',
					id: 'range',
					label: 'Range (dB)',
					default: -11,
					min: -15,
					max: 0,
					step: 0.5,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				connection.setState(ch + 'ds.range', clamp(dbToDsRange(action.options.range as number)))
			},
		},

		// ── Aux Sends ─────────────────────────────────────────────────
		aux_send_level: {
			name: 'Aux Send: Set Level (dB)',
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
				{
					type: 'number',
					id: 'level',
					label: 'Level (dB)',
					default: 0,
					min: -96,
					max: 10,
					step: 0.5,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const aux = action.options.aux as string
				connection.setState(ch + `aux.${aux}.value`, clamp(MixToV(action.options.level as number)))
			},
		},

		aux_send_mute: {
			name: 'Aux Send: Mute',
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
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getMuteToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const aux = action.options.aux as string
				const key = ch + `aux.${aux}.mute`
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		// ── FX Sends ──────────────────────────────────────────────────
		fx_send_level: {
			name: 'FX Send: Set Level (dB)',
			options: [
				{
					type: 'dropdown',
					id: 'channel',
					label: 'Source Channel',
					choices: getFxSendChannelChoices(model),
					default: 'i.0.',
				},
				{
					type: 'dropdown',
					id: 'fx',
					label: 'FX Bus',
					choices: getFxBusChoices(model),
					default: '0',
				},
				{
					type: 'number',
					id: 'level',
					label: 'Level (dB)',
					default: 0,
					min: -96,
					max: 10,
					step: 0.5,
				},
			],
			callback: async (action) => {
				const ch = action.options.channel as string
				const fx = action.options.fx as string
				connection.setState(ch + `fx.${fx}.value`, clamp(MixToV(action.options.level as number)))
			},
		},

		// ── FX Bus ────────────────────────────────────────────────────
		fx_bus_type: {
			name: 'FX Bus: Set Type',
			options: [
				{
					type: 'dropdown',
					id: 'bus',
					label: 'FX Bus',
					choices: getFxBusChoices(model),
					default: '0',
				},
				{
					type: 'dropdown',
					id: 'type',
					label: 'FX Type',
					choices: getFxTypeChoices(),
					default: '0',
				},
			],
			callback: async (action) => {
				const bus = action.options.bus as string
				connection.setState(`f.${bus}.fxtype`, parseInt(action.options.type as string, 10))
			},
		},

		fx_bus_bypass: {
			name: 'FX Bus: Bypass',
			options: [
				{
					type: 'dropdown',
					id: 'bus',
					label: 'FX Bus',
					choices: getFxBusChoices(model),
					default: '0',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const bus = action.options.bus as string
				const key = `f.${bus}.bypass`
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		// ── FX Channel Effects ────────────────────────────────────────
		fx_reverb_enable: {
			name: 'FX Channel: Reverb Enable',
			options: [
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const key = 'fx.rev.enabled'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		fx_delay_enable: {
			name: 'FX Channel: Delay Enable',
			options: [
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const key = 'fx.del.enabled'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		fx_phone_enable: {
			name: 'FX Channel: Telephone Enable',
			options: [
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const key = 'fx.phone.enabled'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		fx_voice_enable: {
			name: 'FX Channel: Voice FX Enable',
			options: [
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const key = 'fx.voice.enabled'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		fx_voice_mode: {
			name: 'FX Channel: Voice FX Mode',
			options: [
				{
					type: 'dropdown',
					id: 'mode',
					label: 'Mode',
					choices: getFxVoiceChoices(),
					default: 'pitch',
				},
			],
			callback: async (action) => {
				connection.setState('fx.voice.mode', action.options.mode as string)
			},
		},

		fx_voice_pitch: {
			name: 'FX Channel: Voice Pitch',
			options: [
				{
					type: 'number',
					id: 'pitch',
					label: 'Pitch (0–100)',
					default: 50,
					min: 0,
					max: 100,
					step: 1,
				},
			],
			callback: async (action) => {
				connection.setState('fx.voice.ch.pitch', clamp((action.options.pitch as number) / 100))
			},
		},

		fx_voice_robot_size: {
			name: 'FX Channel: Robot Size',
			options: [
				{
					type: 'dropdown',
					id: 'size',
					label: 'Size',
					choices: getFxRobotSizeChoices(),
					default: '1',
				},
			],
			callback: async (action) => {
				connection.setState('fx.voice.robotSize', parseInt(action.options.size as string, 10))
			},
		},

		// ── Reverb Bus Parameters ─────────────────────────────────────
		rev_predelay: {
			name: 'Reverb Bus: Set Pre-delay (ms)',
			options: [
				{
					type: 'dropdown',
					id: 'bus',
					label: 'FX Bus',
					choices: [{ id: '1', label: 'FX 2 (Reverb)' }],
					default: '1',
				},
				{
					type: 'number',
					id: 'predelay',
					label: 'Pre-delay (ms)',
					default: 0,
					min: 0,
					max: 50,
					step: 1,
				},
			],
			callback: async (action) => {
				const bus = action.options.bus as string
				connection.setState(`f.${bus}.predelay`, clamp(msToRevPredelay(action.options.predelay as number)))
			},
		},

		rev_time: {
			name: 'Reverb Bus: Set Decay Time (ms)',
			options: [
				{
					type: 'dropdown',
					id: 'bus',
					label: 'FX Bus',
					choices: [{ id: '1', label: 'FX 2 (Reverb)' }],
					default: '1',
				},
				{
					type: 'number',
					id: 'time',
					label: 'Decay Time (ms)',
					default: 200,
					min: 200,
					max: 8000,
					step: 10,
				},
			],
			callback: async (action) => {
				const bus = action.options.bus as string
				connection.setState(`f.${bus}.time`, clamp(msToRevTime(action.options.time as number)))
			},
		},

		rev_lpf: {
			name: 'Reverb Bus: Set LPF (Hz)',
			options: [
				{
					type: 'dropdown',
					id: 'bus',
					label: 'FX Bus',
					choices: [{ id: '1', label: 'FX 2 (Reverb)' }],
					default: '1',
				},
				{
					type: 'number',
					id: 'lpf',
					label: 'LPF Frequency (Hz)',
					default: 20000,
					min: 400,
					max: 20000,
					step: 100,
				},
			],
			callback: async (action) => {
				const bus = action.options.bus as string
				connection.setState(`f.${bus}.lpf`, clamp(hzToRevLpf(action.options.lpf as number)))
			},
		},

		// ── Delay Bus Parameters ──────────────────────────────────────
		del_time: {
			name: 'Delay Bus: Set Time (ms)',
			options: [
				{
					type: 'dropdown',
					id: 'bus',
					label: 'FX Bus',
					choices: [{ id: '0', label: 'FX 1 (Delay)' }],
					default: '0',
				},
				{
					type: 'number',
					id: 'time',
					label: 'Delay Time (ms)',
					default: 500,
					min: 100,
					max: 2000,
					step: 1,
				},
			],
			callback: async (action) => {
				const bus = action.options.bus as string
				connection.setState(`f.${bus}.time`, clamp(msToDelTime(action.options.time as number)))
			},
		},

		del_feedback: {
			name: 'Delay Bus: Set Feedback (%)',
			options: [
				{
					type: 'dropdown',
					id: 'bus',
					label: 'FX Bus',
					choices: [{ id: '0', label: 'FX 1 (Delay)' }],
					default: '0',
				},
				{
					type: 'number',
					id: 'feedback',
					label: 'Feedback (%)',
					default: 50,
					min: 0,
					max: 100,
					step: 1,
				},
			],
			callback: async (action) => {
				const bus = action.options.bus as string
				connection.setState(`f.${bus}.feedback`, clamp(pctToDelFeedback(action.options.feedback as number)))
			},
		},

		del_lpf: {
			name: 'Delay Bus: Set LPF (Hz)',
			options: [
				{
					type: 'dropdown',
					id: 'bus',
					label: 'FX Bus',
					choices: [{ id: '0', label: 'FX 1 (Delay)' }],
					default: '0',
				},
				{
					type: 'number',
					id: 'lpf',
					label: 'LPF Frequency (Hz)',
					default: 8000,
					min: 20,
					max: 20000,
					step: 100,
				},
			],
			callback: async (action) => {
				const bus = action.options.bus as string
				connection.setState(`f.${bus}.lpf`, clamp(hzToDelLpf(action.options.lpf as number)))
			},
		},

		// ── Master Delay ──────────────────────────────────────────────
		master_delay: {
			name: 'Master: Set Output Delay (ms)',
			options: [
				{
					type: 'number',
					id: 'delay',
					label: 'Delay (ms)',
					default: 0,
					min: 0,
					max: 250,
					step: 1,
				},
			],
			callback: async (action) => {
				connection.setState('m.delay', clamp(msToDelay(action.options.delay as number)))
			},
		},

		// ── Aux Bus Options ───────────────────────────────────────────
		aux_send_to_usb: {
			name: 'Aux Bus: Send to USB',
			options: [
				{
					type: 'dropdown',
					id: 'aux',
					label: 'Aux Bus',
					choices: getAuxBusChoices(model),
					default: '0',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const aux = action.options.aux as string
				const key = `a.${aux}.send2usb`
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		aux_include_fx: {
			name: 'Aux Bus: Include FX',
			options: [
				{
					type: 'dropdown',
					id: 'aux',
					label: 'Aux Bus',
					choices: getAuxBusChoices(model),
					default: '0',
				},
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const aux = action.options.aux as string
				const key = `a.${aux}.includeFx`
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		// ── Recording ─────────────────────────────────────────────────
		rec_start: {
			name: 'Recording: Start',
			options: [],
			callback: async () => {
				connection.sendCommand('REC_START')
			},
		},

		rec_stop: {
			name: 'Recording: Stop',
			options: [],
			callback: async () => {
				connection.sendCommand('REC_STOP')
			},
		},

		rec_pause: {
			name: 'Recording: Pause',
			options: [],
			callback: async () => {
				connection.sendCommand('REC_PAUSE')
			},
		},

		rec_toggle: {
			name: 'Recording: Toggle Start/Stop',
			options: [],
			callback: async () => {
				const recState = state.getNumber('recState', 0)
				if (recState === 0) {
					connection.sendCommand('REC_START')
				} else {
					connection.sendCommand('REC_STOP')
				}
			},
		},

		rec_to_usb: {
			name: 'Recording: Record to USB',
			options: [
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const key = 'settings.rec.toUSB'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		rec_multitrack: {
			name: 'Recording: Multitrack Mode',
			options: [
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const key = 'settings.rec.mtk'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		// ── Media Player ──────────────────────────────────────────────
		player_play: {
			name: 'Media Player: Play',
			options: [],
			callback: async () => {
				connection.sendCommand('MEDIA_PLAY')
			},
		},

		player_stop: {
			name: 'Media Player: Stop',
			options: [],
			callback: async () => {
				connection.sendCommand('MEDIA_STOP')
			},
		},

		player_pause: {
			name: 'Media Player: Pause',
			options: [],
			callback: async () => {
				connection.sendCommand('MEDIA_PAUSE')
			},
		},

		player_next: {
			name: 'Media Player: Next Track',
			options: [],
			callback: async () => {
				connection.sendCommand('MEDIA_NEXT')
			},
		},

		player_prev: {
			name: 'Media Player: Previous Track',
			options: [],
			callback: async () => {
				connection.sendCommand('MEDIA_PREV')
			},
		},

		// ── Sample Pads ───────────────────────────────────────────────
		pad_trigger: {
			name: 'Sample Pad: Trigger',
			options: [
				{
					type: 'dropdown',
					id: 'pad',
					label: 'Pad',
					choices: getPadChoices(),
					default: '0',
				},
			],
			callback: async (action) => {
				// Server expects PADPRSD command with idx and val
				connection.sendCommand('PADPRSD', { idx: parseInt(action.options.pad as string, 10), val: 1 })
			},
		},

		pad_stop: {
			name: 'Sample Pad: Stop',
			options: [
				{
					type: 'dropdown',
					id: 'pad',
					label: 'Pad',
					choices: getPadChoices(),
					default: '0',
				},
			],
			callback: async () => {
				connection.sendCommand('STOP_ACTIVE_PADS')
			},
		},

		pad_bank_select: {
			name: 'Sample Pad: Select Bank',
			options: [
				{
					type: 'dropdown',
					id: 'bank',
					label: 'Bank',
					choices: getBankChoices(),
					default: '0',
				},
			],
			callback: async (action) => {
				connection.setState('bank', parseInt(action.options.bank as string, 10))
			},
		},

		pad_bank_next: {
			name: 'Sample Pad: Next Bank',
			options: [],
			callback: async () => {
				const current = state.getNumber('bank', 0)
				const maxBanks = state.config.sampleBank
				connection.setState('bank', (current + 1) % maxBanks)
			},
		},

		pad_bank_prev: {
			name: 'Sample Pad: Previous Bank',
			options: [],
			callback: async () => {
				const current = state.getNumber('bank', 0)
				const maxBanks = state.config.sampleBank
				connection.setState('bank', (current - 1 + maxBanks) % maxBanks)
			},
		},

		// ── Snapshots ─────────────────────────────────────────────────
		snap_save: {
			name: 'Snapshot: Save',
			options: [
				{
					type: 'textinput',
					id: 'name',
					label: 'Snapshot Name',
					default: '',
				},
			],
			callback: async (action) => {
				connection.sendCommand('SNAP_SAVE', { name: action.options.name as string })
			},
		},

		snap_load: {
			name: 'Snapshot: Load',
			options: [
				{
					type: 'textinput',
					id: 'name',
					label: 'Snapshot Name',
					default: '',
				},
			],
			callback: async (action) => {
				connection.sendCommand('SNAP_LOAD', { name: action.options.name as string })
			},
		},

		snap_reset: {
			name: 'Snapshot: Reset to Default',
			options: [],
			callback: async () => {
				connection.sendCommand('SNAP_RESET')
			},
		},

		// ── Bluetooth ─────────────────────────────────────────────────
		bt_enable: {
			name: 'Bluetooth: Enable',
			options: [
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const key = 'settings.bt.enabled'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		bt_pair: {
			name: 'Bluetooth: Start Pairing',
			options: [],
			callback: async () => {
				connection.sendCommand('BT_PAIR')
			},
		},

		bt_unpair: {
			name: 'Bluetooth: Unpair',
			options: [],
			callback: async () => {
				connection.sendCommand('BT_UNPAIR')
			},
		},

		// ── Censor / Auto-ducking ─────────────────────────────────────
		censor_bleep: {
			name: 'Censor: Bleep',
			options: [
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const key = 'censorBleep'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		auto_ducking: {
			name: 'Auto-Ducking',
			options: [
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const key = 'autoDucking'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		// ── Fade Control ──────────────────────────────────────────────
		ctrl_fade_enable: {
			name: 'Fade Control: Enable',
			options: [
				{
					type: 'dropdown',
					id: 'value',
					label: 'Action',
					choices: getOnOffToggleChoices(),
					default: 'toggle',
				},
			],
			callback: async (action) => {
				const key = 'ctrl.fade.enable'
				connection.setState(key, resolveToggle(action.options.value as string, state.get(key)))
			},
		},

		// ── Settings ──────────────────────────────────────────────────
		setting_layout: {
			name: 'Settings: Set Layout Mode',
			options: [
				{
					type: 'dropdown',
					id: 'layout',
					label: 'Layout',
					choices: [
						{ id: 'ez', label: 'EZ Mode' },
						{ id: 'pro', label: 'Pro Mode' },
					],
					default: 'ez',
				},
			],
			callback: async (action) => {
				connection.setState('settings.layout', action.options.layout as string)
			},
		},

		// ── USB/SD Format ─────────────────────────────────────────────
		usb_format: {
			name: 'USB: Format',
			options: [],
			callback: async () => {
				connection.sendCommand('USB_FORMAT')
			},
		},

		sd_format: {
			name: 'SD: Format',
			options: [],
			callback: async () => {
				connection.sendCommand('SD_FORMAT')
			},
		},
	}
}
