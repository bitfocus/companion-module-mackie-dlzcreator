/**
 * Constants, enums, and model configuration for the Mackie DLZ Creator module.
 */

// ── Hardware Model Configuration ──────────────────────────────────────

export enum ModelType {
	DlzCreator = 'DLZ Creator',
	DlzCreatorXS = 'DLZ Creator XS',
}

export interface ModelConfig {
	hwinput: number
	input: number
	player: number
	samples: number
	virtual: number
	aux: number
	fx: number
	sample: number
	sampleBank: number
	eqgain: number
}

export const MODEL_CONFIGS: Record<ModelType, ModelConfig> = {
	[ModelType.DlzCreator]: {
		hwinput: 4,
		input: 4,
		player: 3,
		samples: 1,
		virtual: 0,
		aux: 4,
		fx: 2,
		sample: 6,
		sampleBank: 8,
		eqgain: 15,
	},
	[ModelType.DlzCreatorXS]: {
		hwinput: 2,
		input: 2,
		player: 2,
		samples: 1,
		virtual: 2,
		aux: 2,
		fx: 2,
		sample: 6,
		sampleBank: 8,
		eqgain: 15,
	},
}

// ── Channel Types ─────────────────────────────────────────────────────

export enum ChannelType {
	Input = 'input',
	Player = 'player',
	Sample = 'sample',
	Virtual = 'virtual',
	Aux = 'aux',
	FX = 'fx',
	Master = 'master',
}

export interface ChannelInfo {
	type: ChannelType
	index: number
	prefix: string
	label: string
}

/** Build the flat-key prefix for a given channel. */
export function getChannelPrefix(type: ChannelType, index: number): string {
	switch (type) {
		case ChannelType.Input:
			return `i.${index}.`
		case ChannelType.Player:
			return `p.${index}.`
		case ChannelType.Sample:
			return 's.'
		case ChannelType.Virtual:
			return `v.${index}.`
		case ChannelType.Aux:
			return `a.${index}.`
		case ChannelType.FX:
			return `f.${index}.`
		case ChannelType.Master:
			return 'm.'
	}
}

/** Get all available channels for a given model. */
export function getAvailableChannels(model: ModelType): ChannelInfo[] {
	const cfg = MODEL_CONFIGS[model]
	const channels: ChannelInfo[] = []

	for (let i = 0; i < cfg.input; i++) {
		channels.push({ type: ChannelType.Input, index: i, prefix: `i.${i}.`, label: `Input ${i + 1}` })
	}
	for (let i = 0; i < cfg.player; i++) {
		channels.push({ type: ChannelType.Player, index: i, prefix: `p.${i}.`, label: `Player ${i + 1}` })
	}
	channels.push({ type: ChannelType.Sample, index: 0, prefix: 's.', label: 'Sample' })
	for (let i = 0; i < cfg.virtual; i++) {
		channels.push({ type: ChannelType.Virtual, index: i, prefix: `v.${i}.`, label: `Virtual ${i + 1}` })
	}
	for (let i = 0; i < cfg.aux; i++) {
		channels.push({ type: ChannelType.Aux, index: i, prefix: `a.${i}.`, label: `Aux ${i + 1}` })
	}
	for (let i = 0; i < cfg.fx; i++) {
		channels.push({ type: ChannelType.FX, index: i, prefix: `f.${i}.`, label: `FX ${i + 1}` })
	}
	channels.push({ type: ChannelType.Master, index: 0, prefix: 'm.', label: 'Master' })

	return channels
}

/** Channels that have input gain (preamp) control. */
export function getInputChannels(model: ModelType): ChannelInfo[] {
	return getAvailableChannels(model).filter((c) => c.type === ChannelType.Input)
}

/** Channels that support full mix strip (fader, mute, solo, pan). */
export function getMixChannels(model: ModelType): ChannelInfo[] {
	return getAvailableChannels(model)
}

/** Channels that have EQ. */
export function getEqChannels(model: ModelType): ChannelInfo[] {
	return getAvailableChannels(model).filter(
		(c) =>
			c.type === ChannelType.Input ||
			c.type === ChannelType.Player ||
			c.type === ChannelType.Sample ||
			c.type === ChannelType.Virtual ||
			c.type === ChannelType.Master,
	)
}

/** Channels that have compressor. */
export function getCompChannels(model: ModelType): ChannelInfo[] {
	return getEqChannels(model)
}

/** Channels that have gate. */
export function getGateChannels(model: ModelType): ChannelInfo[] {
	return getAvailableChannels(model).filter(
		(c) =>
			c.type === ChannelType.Input ||
			c.type === ChannelType.Player ||
			c.type === ChannelType.Sample ||
			c.type === ChannelType.Virtual ||
			c.type === ChannelType.Master,
	)
}

/** Channels that have de-esser. Only inputs, players, and virtuals. */
export function getDsChannels(model: ModelType): ChannelInfo[] {
	return getAvailableChannels(model).filter(
		(c) => c.type === ChannelType.Input || c.type === ChannelType.Player || c.type === ChannelType.Virtual,
	)
}

/** Channels that have aux sends. */
export function getAuxSendChannels(model: ModelType): ChannelInfo[] {
	return getAvailableChannels(model).filter(
		(c) =>
			c.type === ChannelType.Input ||
			c.type === ChannelType.Player ||
			c.type === ChannelType.Sample ||
			c.type === ChannelType.Virtual,
	)
}

/** Channels that have FX sends. */
export function getFxSendChannels(model: ModelType): ChannelInfo[] {
	return getAuxSendChannels(model)
}

// ── Enumerations ──────────────────────────────────────────────────────

export enum FxType {
	REVERB = 0,
	DELAY = 1,
	TELEPHONE = 2,
	VOICE_FX = 3,
}

export enum FxVoice {
	PITCH = 'pitch',
	DISGUISE = 'disguise',
	ROBOT = 'robot',
}

export enum FxRobotSize {
	SMALL = 0,
	MEDIUM = 1,
	LARGE = 2,
}

export enum RecState {
	READY = 0,
	ACTIVE = 1,
	PAUSED = 2,
	SAVING = 3,
	SAVED = 4,
	FULL = 5,
}

export enum PlayerState {
	CLOSED = 0,
	ERROR = 1,
	STOP = 2,
	PLAY = 3,
	LOOP = 4,
	PAUSE = 5,
}

export enum BtStatus {
	DISABLED = 0,
	UNPAIRED = 1,
	PAIRED = 2,
	CONNECTED = 3,
}

export enum SampleRecState {
	READY = 0,
	RECORDING = 1,
	DECISION = 2,
}

export enum SdStatus {
	REMOVED = 0,
	INSERTED = 1,
	NOTSUPPORTED = 2,
}

export enum UsbStatus {
	REMOVED = 0,
	INSERTED = 1,
	NOTSUPPORTED = 2,
}

export enum PadMode {
	SAMPLE = 0,
	CONTROL = 1,
	FX = 2,
}

export enum PadControlMode {
	CENSOR = 'censor',
	MUTE = 'mute',
	LOCALS = 'locals',
	INTERCOM = 'intercom',
	FADE = 'fade',
	DUCKING = 'ducking',
}

// ── Color Palette ─────────────────────────────────────────────────────

export const SAMPLE_COLORS = [
	'#ea1a5b',
	'#ee3524',
	'#f0582a',
	'#f9a42b',
	'#ffc909',
	'#9ccc56',
	'#85cca9',
	'#21baac',
	'#1ba9d5',
	'#a276b3',
]

export const SAMPLE_COLORS_DIM = [
	'#750d2e',
	'#771a12',
	'#782c15',
	'#7c5215',
	'#7F6404',
	'#4e662b',
	'#426654',
	'#105d56',
	'#0d546a',
	'#513b59',
]

export const COLOR_LABELS = ['Pink', 'Red', 'Orange', 'Amber', 'Yellow', 'Green', 'Mint', 'Teal', 'Blue', 'Purple']

// ── Default Sample Names ──────────────────────────────────────────────

export const DEFAULT_SAMPLE_NAMES = [
	'Airhorn',
	'Applause&Laughter',
	'Scream',
	'Buzzer',
	'Censor Bleep',
	'Mackie After Dark',
]

// ── Socket.io Protocol Constants ──────────────────────────────────────

export const DEFAULT_PORT = 80
export const SOCKET_EVENT = 'message'
export const RECONNECT_INTERVAL = 5000
