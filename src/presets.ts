import { combineRgb, type CompanionPresetDefinitions } from '@companion-module/base'
import type { ModelType } from './constants.js'
import { MODEL_CONFIGS, getAvailableChannels, ChannelType } from './constants.js'

const COLOR_WHITE = combineRgb(255, 255, 255)
const COLOR_BLACK = combineRgb(0, 0, 0)
const COLOR_RED = combineRgb(255, 0, 0)
const COLOR_GREEN = combineRgb(0, 204, 0)
const COLOR_YELLOW = combineRgb(255, 204, 0)
const COLOR_ORANGE = combineRgb(255, 128, 0)
const COLOR_BLUE = combineRgb(0, 128, 255)
const COLOR_GRAY = combineRgb(64, 64, 64)

export function GetPresets(model: ModelType): CompanionPresetDefinitions {
	const cfg = MODEL_CONFIGS[model]
	const presets: CompanionPresetDefinitions = {}
	const channels = getAvailableChannels(model)

	// ── Per-channel Mute buttons ──────────────────────────────────────
	for (const ch of channels) {
		const p = ch.prefix.replace(/\./g, '_').replace(/_$/, '')

		presets[`${p}_mute`] = {
			type: 'button',
			category: 'Channel Mute',
			name: `${ch.label} Mute`,
			style: {
				text: `$(${instanceLabel()}:${p}_name)\\nMUTE`,
				size: 'auto',
				color: COLOR_WHITE,
				bgcolor: COLOR_GRAY,
			},
			steps: [
				{
					down: [{ actionId: 'channel_mute', options: { channel: ch.prefix, value: 'toggle' } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'channel_mute',
					options: { channel: ch.prefix },
					style: { bgcolor: COLOR_RED, color: COLOR_WHITE },
				},
				{
					feedbackId: 'channel_color',
					options: { channel: ch.prefix },
				},
			],
		}
	}

	// ── Per-channel Solo buttons ──────────────────────────────────────
	for (const ch of channels) {
		const p = ch.prefix.replace(/\./g, '_').replace(/_$/, '')

		presets[`${p}_solo`] = {
			type: 'button',
			category: 'Channel Solo',
			name: `${ch.label} Solo`,
			style: {
				text: `$(${instanceLabel()}:${p}_name)\\nSOLO`,
				size: 'auto',
				color: COLOR_WHITE,
				bgcolor: COLOR_GRAY,
			},
			steps: [
				{
					down: [{ actionId: 'channel_solo', options: { channel: ch.prefix, value: 'toggle' } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'channel_solo',
					options: { channel: ch.prefix },
					style: { bgcolor: COLOR_YELLOW, color: COLOR_BLACK },
				},
			],
		}
	}

	// ── Per-channel Fader Level ────────────────────────────────────────
	for (const ch of channels) {
		const p = ch.prefix.replace(/\./g, '_').replace(/_$/, '')

		presets[`${p}_fader`] = {
			type: 'button',
			category: 'Channel Fader',
			name: `${ch.label} Fader`,
			style: {
				text: `$(${instanceLabel()}:${p}_name)\\n$(${instanceLabel()}:${p}_fader_db)`,
				size: 'auto',
				color: COLOR_WHITE,
				bgcolor: COLOR_GRAY,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'channel_color',
					options: { channel: ch.prefix },
				},
			],
		}
	}

	// ── Input Gain ────────────────────────────────────────────────────
	const inputChannels = channels.filter((c) => c.type === ChannelType.Input)
	for (const ch of inputChannels) {
		const p = ch.prefix.replace(/\./g, '_').replace(/_$/, '')

		presets[`${p}_gain`] = {
			type: 'button',
			category: 'Input Gain',
			name: `${ch.label} Gain`,
			style: {
				text: `$(${instanceLabel()}:${p}_name)\\n$(${instanceLabel()}:${p}_gain_db)`,
				size: 'auto',
				color: COLOR_WHITE,
				bgcolor: COLOR_GRAY,
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'channel_color',
					options: { channel: ch.prefix },
				},
			],
		}
	}

	// ── Phantom Power ─────────────────────────────────────────────────
	for (const ch of inputChannels) {
		const p = ch.prefix.replace(/\./g, '_').replace(/_$/, '')

		presets[`${p}_phantom`] = {
			type: 'button',
			category: 'Phantom Power',
			name: `${ch.label} 48V`,
			style: {
				text: `$(${instanceLabel()}:${p}_name)\\n48V`,
				size: 'auto',
				color: COLOR_WHITE,
				bgcolor: COLOR_GRAY,
			},
			steps: [
				{
					down: [{ actionId: 'input_phantom', options: { channel: ch.prefix, value: 'toggle' } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'input_phantom',
					options: { channel: ch.prefix },
					style: { bgcolor: COLOR_RED, color: COLOR_WHITE },
				},
			],
		}
	}

	// ── Recording ─────────────────────────────────────────────────────
	presets['rec_toggle'] = {
		type: 'button',
		category: 'Recording',
		name: 'Record Toggle',
		style: {
			text: 'REC\\n$(dlzcreator:rec_state_text)',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'rec_toggle', options: {} }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'rec_active',
				options: {},
				style: { bgcolor: COLOR_RED, color: COLOR_WHITE },
			},
			{
				feedbackId: 'rec_paused',
				options: {},
				style: { bgcolor: COLOR_YELLOW, color: COLOR_BLACK },
			},
		],
	}

	presets['rec_time'] = {
		type: 'button',
		category: 'Recording',
		name: 'Record Time',
		style: {
			text: 'REC\\n$(dlzcreator:rec_time)',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'rec_any',
				options: {},
				style: { bgcolor: COLOR_RED, color: COLOR_WHITE },
			},
		],
	}

	// ── Media Player ──────────────────────────────────────────────────
	presets['player_play'] = {
		type: 'button',
		category: 'Media Player',
		name: 'Play',
		style: {
			text: '▶ PLAY',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'player_play', options: {} }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'player_playing',
				options: {},
				style: { bgcolor: COLOR_GREEN, color: COLOR_BLACK },
			},
		],
	}

	presets['player_stop'] = {
		type: 'button',
		category: 'Media Player',
		name: 'Stop',
		style: {
			text: '■ STOP',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'player_stop', options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['player_pause'] = {
		type: 'button',
		category: 'Media Player',
		name: 'Pause',
		style: {
			text: '❚❚ PAUSE',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'player_pause', options: {} }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'player_paused',
				options: {},
				style: { bgcolor: COLOR_YELLOW, color: COLOR_BLACK },
			},
		],
	}

	presets['player_next'] = {
		type: 'button',
		category: 'Media Player',
		name: 'Next Track',
		style: {
			text: '⏭ NEXT',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'player_next', options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['player_prev'] = {
		type: 'button',
		category: 'Media Player',
		name: 'Previous Track',
		style: {
			text: '⏮ PREV',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'player_prev', options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['player_info'] = {
		type: 'button',
		category: 'Media Player',
		name: 'Now Playing',
		style: {
			text: '$(dlzcreator:player_name)\\n$(dlzcreator:player_pos) / $(dlzcreator:player_length)',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'player_playing',
				options: {},
				style: { bgcolor: COLOR_GREEN, color: COLOR_BLACK },
			},
		],
	}

	// ── Sample Pads ───────────────────────────────────────────────────
	for (let pad = 0; pad < cfg.sample; pad++) {
		presets[`pad_${pad}`] = {
			type: 'button',
			category: 'Sample Pads',
			name: `Pad ${pad + 1}`,
			style: {
				text: `$(dlzcreator:pad_${pad}_name)`,
				size: 'auto',
				color: COLOR_WHITE,
				bgcolor: COLOR_GRAY,
			},
			steps: [
				{
					down: [{ actionId: 'pad_trigger', options: { pad: String(pad) } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'pad_active',
					options: { bank: 'current', pad: String(pad) },
					style: { bgcolor: COLOR_GREEN, color: COLOR_BLACK },
				},
			],
		}
	}

	// ── Bluetooth ─────────────────────────────────────────────────────
	presets['bt_status'] = {
		type: 'button',
		category: 'Bluetooth',
		name: 'Bluetooth Status',
		style: {
			text: 'BT\\n$(dlzcreator:bt_status_text)',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'bt_enabled',
				options: {},
				style: { bgcolor: COLOR_GRAY, color: COLOR_WHITE },
			},
			{
				feedbackId: 'bt_connected',
				options: {},
				style: { bgcolor: COLOR_BLUE, color: COLOR_WHITE },
			},
		],
	}

	// ── AutoMix ───────────────────────────────────────────────────────
	presets['automix_global'] = {
		type: 'button',
		category: 'AutoMix',
		name: 'AutoMix Global',
		style: {
			text: 'AUTO\\nMIX',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'automix_global', options: { value: 'toggle' } }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'automix_global',
				options: {},
				style: { bgcolor: COLOR_GREEN, color: COLOR_BLACK },
			},
		],
	}

	// ── Censor Bleep ──────────────────────────────────────────────────
	presets['censor'] = {
		type: 'button',
		category: 'Utilities',
		name: 'Censor Bleep',
		style: {
			text: 'CENSOR\\nBLEEP',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'censor_bleep', options: { value: 'toggle' } }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'censor_active',
				options: {},
				style: { bgcolor: COLOR_RED, color: COLOR_WHITE },
			},
		],
	}

	// ── Auto-Ducking ──────────────────────────────────────────────────
	presets['auto_ducking'] = {
		type: 'button',
		category: 'Utilities',
		name: 'Auto-Ducking',
		style: {
			text: 'AUTO\\nDUCK',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [{ actionId: 'auto_ducking', options: { value: 'toggle' } }],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'auto_ducking',
				options: {},
				style: { bgcolor: COLOR_GREEN, color: COLOR_BLACK },
			},
		],
	}

	// ── Snapshot ───────────────────────────────────────────────────────
	presets['snap_info'] = {
		type: 'button',
		category: 'Snapshots',
		name: 'Current Snapshot',
		style: {
			text: 'SNAP\\n$(dlzcreator:snapshot)',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets['snap_reset'] = {
		type: 'button',
		category: 'Snapshots',
		name: 'Reset Snapshot',
		style: {
			text: 'SNAP\\nRESET',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_ORANGE,
		},
		steps: [
			{
				down: [{ actionId: 'snap_reset', options: {} }],
				up: [],
			},
		],
		feedbacks: [],
	}

	// ── System Info ───────────────────────────────────────────────────
	presets['system_info'] = {
		type: 'button',
		category: 'System',
		name: 'System Info',
		style: {
			text: '$(dlzcreator:model)\\n$(dlzcreator:ip)',
			size: 'auto',
			color: COLOR_WHITE,
			bgcolor: COLOR_GRAY,
		},
		steps: [
			{
				down: [],
				up: [],
			},
		],
		feedbacks: [],
	}

	return presets
}

/** Helper to get the instance label for variable references in presets. */
function instanceLabel(): string {
	return 'mackie-dlzcreator'
}
