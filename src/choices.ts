import type { DropdownChoice } from '@companion-module/base'
import {
	type ModelType,
	MODEL_CONFIGS,
	getAvailableChannels,
	getInputChannels,
	getEqChannels,
	getCompChannels,
	getGateChannels,
	getDsChannels,
	getAuxSendChannels,
	getFxSendChannels,
	ChannelType,
	COLOR_LABELS,
	SAMPLE_COLORS,
	FxType,
	PadMode,
	PadControlMode,
	FxVoice,
	FxRobotSize,
	RecState,
	PlayerState,
} from './constants.js'

/** Helper to build DropdownChoice[] from ChannelInfo[]. */
function channelsToChoices(
	channelGetter: (model: ModelType) => { prefix: string; label: string }[],
	model: ModelType,
): DropdownChoice[] {
	return channelGetter(model).map((ch) => ({ id: ch.prefix, label: ch.label }))
}

export function getAllChannelChoices(model: ModelType): DropdownChoice[] {
	return channelsToChoices(getAvailableChannels, model)
}

export function getInputChannelChoices(model: ModelType): DropdownChoice[] {
	return channelsToChoices(getInputChannels, model)
}

export function getEqChannelChoices(model: ModelType): DropdownChoice[] {
	return channelsToChoices(getEqChannels, model)
}

export function getCompChannelChoices(model: ModelType): DropdownChoice[] {
	return channelsToChoices(getCompChannels, model)
}

export function getGateChannelChoices(model: ModelType): DropdownChoice[] {
	return channelsToChoices(getGateChannels, model)
}

export function getDsChannelChoices(model: ModelType): DropdownChoice[] {
	return channelsToChoices(getDsChannels, model)
}

export function getAuxSendChannelChoices(model: ModelType): DropdownChoice[] {
	return channelsToChoices(getAuxSendChannels, model)
}

export function getFxSendChannelChoices(model: ModelType): DropdownChoice[] {
	return channelsToChoices(getFxSendChannels, model)
}

/** Channels that have fader/mute/solo but are not aux/fx/master */
export function getSourceChannelChoices(model: ModelType): DropdownChoice[] {
	return getAvailableChannels(model)
		.filter(
			(c) =>
				c.type === ChannelType.Input ||
				c.type === ChannelType.Player ||
				c.type === ChannelType.Sample ||
				c.type === ChannelType.Virtual,
		)
		.map((ch) => ({ id: ch.prefix, label: ch.label }))
}

export function getAuxBusChoices(model: ModelType): DropdownChoice[] {
	const cfg = MODEL_CONFIGS[model]
	return Array.from({ length: cfg.aux }, (_, i) => ({
		id: i.toString(),
		label: `Aux ${i + 1}`,
	}))
}

export function getFxBusChoices(model: ModelType): DropdownChoice[] {
	const cfg = MODEL_CONFIGS[model]
	return Array.from({ length: cfg.fx }, (_, i) => ({
		id: i.toString(),
		label: `FX ${i + 1}`,
	}))
}

export function getColorChoices(): DropdownChoice[] {
	return COLOR_LABELS.map((label, i) => ({
		id: i.toString(),
		label: `${label} (${SAMPLE_COLORS[i]})`,
	}))
}

export function getEqBandChoices(): DropdownChoice[] {
	return [
		{ id: 'hp', label: 'High Pass' },
		{ id: 'b1', label: 'Band 1 (Low)' },
		{ id: 'b2', label: 'Band 2 (Mid)' },
		{ id: 'b3', label: 'Band 3 (High)' },
	]
}

export function getMuteToggleChoices(): DropdownChoice[] {
	return [
		{ id: '1', label: 'Mute' },
		{ id: '0', label: 'Unmute' },
		{ id: 'toggle', label: 'Toggle' },
	]
}

export function getOnOffToggleChoices(): DropdownChoice[] {
	return [
		{ id: '1', label: 'On' },
		{ id: '0', label: 'Off' },
		{ id: 'toggle', label: 'Toggle' },
	]
}

export function getBankChoices(): DropdownChoice[] {
	return Array.from({ length: 8 }, (_, i) => ({
		id: i.toString(),
		label: `Bank ${i + 1}`,
	}))
}

export function getPadChoices(): DropdownChoice[] {
	return Array.from({ length: 6 }, (_, i) => ({
		id: i.toString(),
		label: `Pad ${i + 1}`,
	}))
}

export function getFxTypeChoices(): DropdownChoice[] {
	return [
		{ id: FxType.REVERB.toString(), label: 'Reverb' },
		{ id: FxType.DELAY.toString(), label: 'Delay' },
		{ id: FxType.TELEPHONE.toString(), label: 'Telephone' },
		{ id: FxType.VOICE_FX.toString(), label: 'Voice FX' },
	]
}

export function getPadModeChoices(): DropdownChoice[] {
	return [
		{ id: PadMode.SAMPLE.toString(), label: 'Sample' },
		{ id: PadMode.CONTROL.toString(), label: 'Control' },
		{ id: PadMode.FX.toString(), label: 'FX' },
	]
}

export function getPadControlModeChoices(): DropdownChoice[] {
	return [
		{ id: PadControlMode.CENSOR, label: 'Censor' },
		{ id: PadControlMode.MUTE, label: 'Mute' },
		{ id: PadControlMode.LOCALS, label: 'Locals' },
		{ id: PadControlMode.INTERCOM, label: 'Intercom' },
		{ id: PadControlMode.FADE, label: 'Fade' },
		{ id: PadControlMode.DUCKING, label: 'Ducking' },
	]
}

export function getFxVoiceChoices(): DropdownChoice[] {
	return [
		{ id: FxVoice.PITCH, label: 'Pitch' },
		{ id: FxVoice.DISGUISE, label: 'Disguise' },
		{ id: FxVoice.ROBOT, label: 'Robot' },
	]
}

export function getFxRobotSizeChoices(): DropdownChoice[] {
	return [
		{ id: FxRobotSize.SMALL.toString(), label: 'Small' },
		{ id: FxRobotSize.MEDIUM.toString(), label: 'Medium' },
		{ id: FxRobotSize.LARGE.toString(), label: 'Large' },
	]
}

export function getEqHpSlopeChoices(): DropdownChoice[] {
	return [
		{ id: '0', label: '6 dB/oct' },
		{ id: '1', label: '12 dB/oct' },
		{ id: '2', label: '24 dB/oct' },
	]
}

export function getRecStateChoices(): DropdownChoice[] {
	return [
		{ id: RecState.READY.toString(), label: 'Ready' },
		{ id: RecState.ACTIVE.toString(), label: 'Active' },
		{ id: RecState.PAUSED.toString(), label: 'Paused' },
		{ id: RecState.SAVING.toString(), label: 'Saving' },
		{ id: RecState.SAVED.toString(), label: 'Saved' },
		{ id: RecState.FULL.toString(), label: 'Full' },
	]
}

export function getPlayerStateChoices(): DropdownChoice[] {
	return [
		{ id: PlayerState.CLOSED.toString(), label: 'Closed' },
		{ id: PlayerState.ERROR.toString(), label: 'Error' },
		{ id: PlayerState.STOP.toString(), label: 'Stopped' },
		{ id: PlayerState.PLAY.toString(), label: 'Playing' },
		{ id: PlayerState.LOOP.toString(), label: 'Looping' },
		{ id: PlayerState.PAUSE.toString(), label: 'Paused' },
	]
}
