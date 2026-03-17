/**
 * Value conversion utilities matching the DLZ Creator protocol.
 *
 * All stored values are normalized to 0–1 floats.
 * These functions convert between the normalized form and human-readable units.
 */

// ── Clamp helper ──────────────────────────────────────────────────────

export function clamp(v: number): number {
	return v < 0 ? 0 : v > 1 ? 1 : v
}

// ── Generic conversion factories ──────────────────────────────────────

/** Linear mapping: value = v * (max - min) + min */
export function VtoLIN(min: number, max: number): (v: number) => number {
	return (v: number) => v * (max - min) + min
}

export function LINtoV(min: number, max: number): (val: number) => number {
	return (val: number) => (val - min) / (max - min)
}

/** Logarithmic mapping */
export function VtoLOG(min: number, max: number): (v: number) => number {
	return (v: number) => {
		let offset = 0
		if (min <= 0) offset = 1 - min
		return (min + offset) * Math.pow((max + offset) / (min + offset), v) - offset
	}
}

export function LOGtoV(min: number, max: number): (val: number) => number {
	return (val: number) => Math.log(val / min) / Math.log(max / min)
}

/** Square mapping: value = min + v² * (max - min) */
export function VtoSQR(min: number, max: number): (v: number) => number {
	return (v: number) => min + v * v * (max - min)
}

export function SQRtoV(min: number, max: number): (val: number) => number {
	return (val: number) => Math.sqrt(Math.abs((val - min) / (max - min)))
}

// ── Fader curve (polynomial) ──────────────────────────────────────────

/**
 * Convert normalized fader value (0–1) to dB.
 * This is the exact polynomial from the DLZ Creator firmware.
 */
export function VtoMix(v: number): number {
	let db =
		v * (212.46963343266762 + v * (v * (185.11460729522545 + -54.28829155946011 * v) - 261.6726216708534)) -
		71.62332749757951
	if (v < 0.055) {
		const sine = Math.sin(28.559933214452666 * v)
		if (sine < 1e-10) return -200
		db += 20 * Math.log10(sine)
	}
	return db < -200 ? -200 : db
}

/**
 * Binary search to invert VtoMix: find v such that VtoMix(v) ≈ target dB.
 */
function findV(fn: (v: number) => number, target: number): number {
	let lo = 0
	let hi = 1
	for (let i = 0; i < 128; i++) {
		const mid = 0.5 * (lo + hi)
		const val = fn(mid)
		if (Math.abs(val - target) < 1e-10) return mid
		if (val > target) hi = mid
		else lo = mid
	}
	return 0.5 * (lo + hi)
}

/** Convert dB to normalized fader value (inverse of VtoMix). */
export function MixToV(db: number): number {
	if (db < -96) return 0
	if (db >= 10) return 1
	return findV(VtoMix, db)
}

// ── Pre-built conversion pairs ────────────────────────────────────────

// Gain: 0–80 dB (linear)
export const gainToDb = VtoLIN(0, 80)
export const dbToGain = LINtoV(0, 80)

// Trim: -20 to +40 dB (linear)
export const trimToDb = VtoLIN(-20, 40)
export const dbToTrim = LINtoV(-20, 40)

// Master delay: 0–250 ms (linear)
export const delayToMs = VtoLIN(0, 250)
export const msToDelay = LINtoV(0, 250)

// Aux send value2: -20 to +20 dB (linear)
export const auxVal2ToDb = VtoLIN(-20, 20)
export const dbToAuxVal2 = LINtoV(-20, 20)

// EQ frequency: 20–20000 Hz (logarithmic)
export const eqFreqToHz = VtoLOG(20, 20000)
export const hzToEqFreq = LOGtoV(20, 20000)

// EQ gain: -15 to +15 dB (linear)
export const eqGainToDb = VtoLIN(-15, 15)
export const dbToEqGain = LINtoV(-15, 15)

// EQ Q: 0.1–15 (logarithmic)
export const eqQToVal = VtoLOG(0.1, 15)
export const valToEqQ = LOGtoV(0.1, 15)

// Compressor threshold: -60 to 0 dB (linear)
export const compThreshToDb = VtoLIN(-60, 0)
export const dbToCompThresh = LINtoV(-60, 0)

// Compressor ratio: 1–20 (logarithmic)
export const compRatioToVal = VtoLOG(1, 20)
export const valToCompRatio = LOGtoV(1, 20)

// Compressor gain: 0–24 dB (linear)
export const compGainToDb = VtoLIN(0, 24)
export const dbToCompGain = LINtoV(0, 24)

// Compressor attack: 0.5–500 ms (logarithmic)
export const compAttackToMs = VtoLOG(0.5, 500)
export const msToCompAttack = LOGtoV(0.5, 500)

// Compressor release: 10–2000 ms (logarithmic)
export const compReleaseToMs = VtoLOG(10, 2000)
export const msToCompRelease = LOGtoV(10, 2000)

// Compressor hold: 0–500 ms (square)
export const compHoldToMs = VtoSQR(0, 500)
export const msToCompHold = SQRtoV(0, 500)

// Gate threshold: -60 to 0 dB (linear)
export const gateThreshToDb = VtoLIN(-60, 0)
export const dbToGateThresh = LINtoV(-60, 0)

// Gate depth: -80 to 0 dB (linear)
export const gateDepthToDb = VtoLIN(-80, 0)
export const dbToGateDepth = LINtoV(-80, 0)

// Gate attack: 0.5–500 ms (logarithmic)
export const gateAttackToMs = VtoLOG(0.5, 500)
export const msToGateAttack = LOGtoV(0.5, 500)

// Gate release: 10–2000 ms (logarithmic)
export const gateReleaseToMs = VtoLOG(10, 2000)
export const msToGateRelease = LOGtoV(10, 2000)

// Gate hold: 0–500 ms (square)
export const gateHoldToMs = VtoSQR(0, 500)
export const msToGateHold = SQRtoV(0, 500)

// De-esser threshold: -96 to 0 dB (linear)
export const dsThreshToDb = VtoLIN(-96, 0)
export const dbToDsThresh = LINtoV(-96, 0)

// De-esser frequency: 20–20000 Hz (logarithmic)
export const dsFreqToHz = VtoLOG(20, 20000)
export const hzToDsFreq = LOGtoV(20, 20000)

// De-esser Q: 0.1–15 (logarithmic)
export const dsQToVal = VtoLOG(0.1, 15)
export const valToDsQ = LOGtoV(0.1, 15)

// De-esser range: -15 to 0 dB (linear)
export const dsRangeToDb = VtoLIN(-15, 0)
export const dbToDsRange = LINtoV(-15, 0)

// Reverb predelay: 0–50 ms (linear)
export const revPredelayToMs = VtoLIN(0, 50)
export const msToRevPredelay = LINtoV(0, 50)

// Reverb time: 200–8000 ms (linear)
export const revTimeToMs = VtoLIN(200, 8000)
export const msToRevTime = LINtoV(200, 8000)

// Reverb LPF: 400–20000 Hz (logarithmic)
export const revLpfToHz = VtoLOG(400, 20000)
export const hzToRevLpf = LOGtoV(400, 20000)

// Delay time: 100–2000 ms (linear)
export const delTimeToMs = VtoLIN(100, 2000)
export const msToDelTime = LINtoV(100, 2000)

// Delay feedback: 0–100% (linear)
export const delFeedbackToPct = VtoLIN(0, 100)
export const pctToDelFeedback = LINtoV(0, 100)

// Delay LPF: 20–20000 Hz (logarithmic)
export const delLpfToHz = VtoLOG(20, 20000)
export const hzToDelLpf = LOGtoV(20, 20000)

// ── Display helpers ───────────────────────────────────────────────────

/** Format a dB value for display. */
export function formatDb(db: number): string {
	if (db <= -200) return '-∞'
	if (db <= -100) return '-∞'
	return `${db >= 0 ? '+' : ''}${db.toFixed(1)} dB`
}

/** Format a fader value (0–1) as dB for display. */
export function formatFaderDb(v: number): string {
	return formatDb(VtoMix(v))
}

/** Format a frequency in Hz for display. */
export function formatHz(hz: number): string {
	if (hz >= 1000) return `${(hz / 1000).toFixed(1)} kHz`
	return `${Math.round(hz)} Hz`
}

/** Format milliseconds for display. */
export function formatMs(ms: number): string {
	if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`
	return `${Math.round(ms)} ms`
}

/** Format a recording time (seconds) as HH:MM:SS. */
export function formatTime(seconds: number): string {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = Math.floor(seconds % 60)
	return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
