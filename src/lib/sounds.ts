// ─── 8-bit Web Audio API Sound Engine ──────────────────────────
// Singleton module — all sounds generated via oscillators, no external files.

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let muted = false
let volume = 0.3

function getCtx(): AudioContext | null {
  if (!ctx) return null
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function osc(
  type: OscillatorType,
  freq: number,
  duration: number,
  startTime?: number,
  endFreq?: number,
) {
  const c = getCtx()
  if (!c || !masterGain) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, c.currentTime)
  if (endFreq !== undefined) {
    o.frequency.linearRampToValueAtTime(endFreq, c.currentTime + duration)
  }
  g.gain.setValueAtTime(0.5, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration)
  o.connect(g)
  g.connect(masterGain)
  const t = startTime ?? c.currentTime
  o.start(t)
  o.stop(t + duration)
}

function noteSeq(type: OscillatorType, notes: number[], dur: number) {
  const c = getCtx()
  if (!c) return
  notes.forEach((freq, i) => {
    osc(type, freq, dur, c.currentTime + i * dur)
  })
}

// ─── Public API ────────────────────────────────────────────────

export function init() {
  if (ctx) return
  ctx = new AudioContext()
  masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(volume, ctx.currentTime)
  masterGain.connect(ctx.destination)
}

export function scorePoint() {
  osc('square', 400, 0.15, undefined, 800)
}

export function levelUp() {
  // C5→E5→G5 jingle
  noteSeq('square', [523, 659, 784], 0.12)
}

export function combo() {
  osc('sawtooth', 200, 0.25, undefined, 1200)
}

export function carHonk() {
  osc('square', 280, 0.12)
}

export function projectileWhoosh() {
  const c = getCtx()
  if (!c || !masterGain) return
  const bufferSize = c.sampleRate * 0.2
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  const noise = c.createBufferSource()
  noise.buffer = buffer
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.setValueAtTime(800, c.currentTime)
  bp.frequency.linearRampToValueAtTime(3000, c.currentTime + 0.2)
  bp.Q.setValueAtTime(2, c.currentTime)
  const g = c.createGain()
  g.gain.setValueAtTime(0.3, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2)
  noise.connect(bp)
  bp.connect(g)
  g.connect(masterGain)
  noise.start()
  noise.stop(c.currentTime + 0.2)
}

export function buttonClick() {
  osc('triangle', 600, 0.06)
}

export function typingKey() {
  osc('triangle', 800, 0.04)
}

export function completion() {
  // C5→D5→E5→G5→C6 fanfare
  noteSeq('square', [523, 587, 659, 784, 1047], 0.14)
}

export function achievement() {
  const c = getCtx()
  if (!c) return
  osc('square', 880, 0.08, c.currentTime)
  osc('square', 1100, 0.1, c.currentTime + 0.1)
}

export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v))
  if (masterGain && ctx) {
    masterGain.gain.setValueAtTime(muted ? 0 : volume, ctx.currentTime)
  }
}

export function mute() {
  muted = true
  if (masterGain && ctx) masterGain.gain.setValueAtTime(0, ctx.currentTime)
}

export function unmute() {
  muted = false
  if (masterGain && ctx) masterGain.gain.setValueAtTime(volume, ctx.currentTime)
}

export function isMuted() {
  return muted
}
