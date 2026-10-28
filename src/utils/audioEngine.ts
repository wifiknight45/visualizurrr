/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AudioMetrics, ChillTrack, ChillPlaylist } from '../types/visualizer';

// Curated Lofi Chill Playlists
export const DEFAULT_CHILL_PLAYLISTS: ChillPlaylist[] = [
  {
    id: 'lofi-tokyo-night',
    name: 'Midnight Tokyo Lofi',
    description: 'Warm Rhodes 9th chords, gentle vinyl flutter, and slow downtempo grooves',
    tracks: [
      { id: 'track-1', title: 'Rain on Shinjuku Roofs', artist: 'visualizerrr chill', bpm: 72, key: 'D minor 9', vibe: 'Cozy Nostalgia', paletteId: 'tokyo-night', patternId: 'lorenz-attractor' },
      { id: 'track-2', title: 'Late Night Convenience Store', artist: 'visualizerrr chill', bpm: 68, key: 'F major 7', vibe: 'Ethereal Warmth', paletteId: 'synthwave-84', patternId: 'hypotrochoid-spirograph' },
      { id: 'track-3', title: 'Last Train Across Sumida', artist: 'visualizerrr chill', bpm: 75, key: 'G minor 11', vibe: 'Downtempo Drift', paletteId: 'cyberpunk-neon', patternId: 'perlin-flow-field' },
      { id: 'track-4', title: 'Neon Reflections in Puddles', artist: 'visualizerrr chill', bpm: 70, key: 'A minor 9', vibe: 'Deep Flow', paletteId: 'bioluminescence', patternId: 'tunnel-vortex' },
    ],
  },
  {
    id: 'cosmic-study-session',
    name: 'Cosmic Study Session',
    description: 'Ambient celestial pads, meditative harmonics, and low-frequency pulses',
    tracks: [
      { id: 'track-5', title: 'Starlight Through the Blinds', artist: 'visualizerrr chill', bpm: 64, key: 'C major 7', vibe: 'Meditative Calm', paletteId: 'celestial-nebula', patternId: 'fourier-epicycles' },
      { id: 'track-6', title: 'Quantum Slumber Orbit', artist: 'visualizerrr chill', bpm: 60, key: 'E minor 9', vibe: 'Weightless Space', paletteId: 'electric-ultraviolet', patternId: 'quantum-harmonic' },
      { id: 'track-7', title: 'Solar Wind Lullaby', artist: 'visualizerrr chill', bpm: 66, key: 'Bb major 7', vibe: 'Gentle Focus', paletteId: 'golden-amber', patternId: 'phyllotaxis-sunflower' },
      { id: 'track-8', title: 'Interstellar Reading Room', artist: 'visualizerrr chill', bpm: 62, key: 'D minor 7', vibe: 'Infinite Depth', paletteId: 'viridis', patternId: 'starfield-warp' },
    ],
  },
  {
    id: 'coffee-shop-vinyl',
    name: 'Coffee Shop Vinyl Beats',
    description: 'Dusty needle crackle, mellow acoustic basslines, and golden hour jazz chords',
    tracks: [
      { id: 'track-9', title: 'Steaming Matcha Latte', artist: 'visualizerrr chill', bpm: 78, key: 'Eb major 7', vibe: 'Warm Cozy', paletteId: 'emerald-forest', patternId: 'barnsley-fern' },
      { id: 'track-10', title: 'Worn Paperbacks & Rain', artist: 'visualizerrr chill', bpm: 74, key: 'C minor 9', vibe: 'Dusty Vintage', paletteId: 'copper-patina', patternId: 'maurer-rose' },
      { id: 'track-11', title: 'Quiet Corner Table', artist: 'visualizerrr chill', bpm: 76, key: 'Ab major 7', vibe: 'Mellow Swing', paletteId: 'cherry-blossom', patternId: 'lissajous-harmonograph' },
      { id: 'track-12', title: 'Golden Hour Brew', artist: 'visualizerrr chill', bpm: 71, key: 'F minor 11', vibe: 'Smooth Groove', paletteId: 'sunset-horizon', patternId: 'jellyfish-pulse' },
    ],
  },
];

// Chord progressions for procedural lofi generation (frequencies in Hz)
const CHORD_PROGRESSIONS: Record<string, number[][]> = {
  'D minor 9': [
    [146.83, 220.0, 261.63, 329.63], // Dm9
    [130.81, 196.0, 246.94, 293.66], // Cmaj7
    [116.54, 174.61, 220.0, 261.63], // Bbmaj7
    [103.83, 155.56, 196.0, 246.94], // A7alt
  ],
  'F major 7': [
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [196.0, 246.94, 293.66, 349.23], // G7
    [220.0, 261.63, 329.63, 392.0],  // Am7
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
  ],
  'C major 7': [
    [130.81, 164.81, 196.0, 246.94], // Cmaj7
    [146.83, 174.61, 220.0, 261.63], // Dm7
    [164.81, 196.0, 246.94, 293.66], // Em7
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
  ],
};

class LofiAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private masterGain: GainNode | null = null;
  private vinylGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.7;

  private currentTrack: ChillTrack = DEFAULT_CHILL_PLAYLISTS[0].tracks[0];
  private currentPlaylist: ChillPlaylist = DEFAULT_CHILL_PLAYLISTS[0];
  private trackIndex: number = 0;

  private stepTimer: number | null = null;
  private step: number = 0;
  private chordIndex: number = 0;
  private freqData: Uint8Array = new Uint8Array(128);

  // Callbacks
  private onMorphCallbacks: Array<(track: ChillTrack) => void> = [];

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    // Warm analog low-pass filter (characteristic of lofi vinyl warmth)
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(1400, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Start background vinyl crackle
    this.initVinylCrackle();
  }

  private initVinylCrackle() {
    if (!this.ctx || !this.filterNode) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Rare crackle clicks mixed with gentle pink tape hiss
      if (Math.random() < 0.001) {
        output[i] = (Math.random() * 2 - 1) * 0.4;
      } else {
        output[i] = (Math.random() * 2 - 1) * 0.015;
      }
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.vinylGain = this.ctx.createGain();
    this.vinylGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    const vinylFilter = this.ctx.createBiquadFilter();
    vinylFilter.type = 'bandpass';
    vinylFilter.frequency.setValueAtTime(2000, this.ctx.currentTime);
    vinylFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

    if (this.vinylGain && this.masterGain) {
      whiteNoise.connect(vinylFilter);
      vinylFilter.connect(this.vinylGain);
      this.vinylGain.connect(this.masterGain);
      whiteNoise.start();
    }
  }

  public play() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isPlaying = true;
    this.startSequencer();
  }

  public pause() {
    this.isPlaying = false;
    if (this.stepTimer) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
  }

  public toggle() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): ChillTrack {
    return this.currentTrack;
  }

  public getCurrentPlaylist(): ChillPlaylist {
    return this.currentPlaylist;
  }

  public onMorph(cb: (track: ChillTrack) => void) {
    this.onMorphCallbacks.push(cb);
  }

  public setTrack(track: ChillTrack) {
    this.currentTrack = track;
    this.step = 0;
    this.chordIndex = 0;
    this.onMorphCallbacks.forEach((cb) => cb(track));
    if (this.isPlaying) {
      this.startSequencer();
    }
  }

  public setPlaylist(playlist: ChillPlaylist) {
    this.currentPlaylist = playlist;
    this.trackIndex = 0;
    this.setTrack(playlist.tracks[0]);
  }

  public nextTrack() {
    const tracks = this.currentPlaylist.tracks;
    this.trackIndex = (this.trackIndex + 1) % tracks.length;
    this.setTrack(tracks[this.trackIndex]);
  }

  public prevTrack() {
    const tracks = this.currentPlaylist.tracks;
    this.trackIndex = (this.trackIndex - 1 + tracks.length) % tracks.length;
    this.setTrack(tracks[this.trackIndex]);
  }

  // Generates a new customized chill playlist
  public generateCustomPlaylist(name: string, vibe: string, baseBpm: number = 72): ChillPlaylist {
    const titles = [
      'Velvet Sunset Coffee',
      'Raindrops on Cedar',
      'Analog Tape Memories',
      'Midnight Subway Reflections',
      'Breeze in the Bamboo Garden',
      'Autumn Rooftop Study',
    ];
    const keys = ['D minor 9', 'F major 7', 'C major 7'];
    const paletteIds = ['tokyo-night', 'synthwave-84', 'sunset-horizon', 'bioluminescence', 'nord-frost', 'monokai-pro'];
    const patternIds = ['lorenz-attractor', 'hypotrochoid-spirograph', 'perlin-flow-field', 'fourier-epicycles', 'jellyfish-pulse', 'chladni-plate'];

    const tracks: ChillTrack[] = [];
    for (let i = 0; i < 4; i++) {
      tracks.push({
        id: `custom-track-${Date.now()}-${i}`,
        title: titles[i % titles.length],
        artist: 'visualizerrr chill engine',
        bpm: baseBpm + (i % 2 === 0 ? -2 : 3),
        key: keys[i % keys.length],
        vibe: vibe,
        paletteId: paletteIds[i % paletteIds.length],
        patternId: patternIds[i % patternIds.length],
      });
    }

    const playlist: ChillPlaylist = {
      id: `custom-${Date.now()}`,
      name: name || 'Custom Chill Session',
      description: `Generative lofi chill soundscape (${vibe}) matching visual dynamics in real time`,
      tracks,
    };

    return playlist;
  }

  private startSequencer() {
    if (this.stepTimer) {
      window.clearInterval(this.stepTimer);
    }

    // 16th note interval at current BPM
    const bpm = this.currentTrack.bpm || 72;
    const intervalMs = (60 / bpm / 4) * 1000;

    this.stepTimer = window.setInterval(() => {
      this.playStep();
    }, intervalMs);
  }

  private playStep() {
    if (!this.ctx || !this.isPlaying) return;

    const key = this.currentTrack.key in CHORD_PROGRESSIONS ? this.currentTrack.key : 'D minor 9';
    const chords = CHORD_PROGRESSIONS[key];
    const currentChord = chords[this.chordIndex % chords.length];

    // Every 16 steps (1 bar), change chord and trigger subtle morph
    if (this.step % 16 === 0) {
      this.chordIndex = (this.chordIndex + 1) % chords.length;
      this.playRhodesChord(currentChord, 2.2);

      // On 4-bar boundary, notify morph callback to shift visual parameters
      if (this.step % 64 === 0) {
        this.onMorphCallbacks.forEach((cb) => cb(this.currentTrack));
      }
    }

    // Lofi Acoustic Kick on beat 1 and syncopated beat 3.5
    if (this.step % 16 === 0 || this.step % 16 === 10) {
      this.playKick();
    }

    // Soft Brush Snare / Rimshot on beat 2 and 4 (step 4 and 12)
    if (this.step % 16 === 4 || this.step % 16 === 12) {
      this.playSnare();
    }

    // Gentle closed Hi-hat on every 8th note with subtle swing
    if (this.step % 2 === 0) {
      this.playHiHat(this.step % 4 === 2);
    }

    // Soft melodic embellishment (Rhodes high note)
    if (this.step % 8 === 6 && Math.random() < 0.6) {
      const highNote = currentChord[Math.floor(Math.random() * currentChord.length)] * 2;
      this.playMelodyNote(highNote, 0.4);
    }

    this.step++;
  }

  // Synthesis of warm lofi Rhodes chord
  private playRhodesChord(notes: number[], duration: number) {
    if (!this.ctx || !this.filterNode) return;
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      // Sine + Triangle blend for warm electric piano tone
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      // Gentle vintage detune flutter
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12 / notes.length, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.filterNode!);
      osc.start(now);
      osc.stop(now + duration);
    });
  }

  // Melodic single note
  private playMelodyNote(freq: number, duration: number) {
    if (!this.ctx || !this.filterNode) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.filterNode);
    osc.start(now);
    osc.stop(now + duration);
  }

  // Sub-bass 808/acoustic lofi kick
  private playKick() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.12);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Soft brush snare
  private playSnare() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Filtered noise burst
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.15);
  }

  // Soft closed hi-hat
  private playHiHat(accent: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, now);

    const vol = accent ? 0.05 : 0.025;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Real-time audio metric analysis
  public getMetrics(): AudioMetrics {
    if (!this.analyser || !this.isPlaying) {
      return {
        bass: 0,
        mid: 0,
        treble: 0,
        volume: 0,
        beat: false,
      };
    }

    (this.analyser as unknown as { getByteFrequencyData: (d: Uint8Array) => void }).getByteFrequencyData(this.freqData);

    let bassSum = 0;
    const bassEnd = Math.floor(this.freqData.length * 0.1);
    for (let i = 0; i < bassEnd; i++) {
      bassSum += this.freqData[i];
    }
    const bass = bassSum / (bassEnd * 255);

    let midSum = 0;
    const midEnd = Math.floor(this.freqData.length * 0.4);
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += this.freqData[i];
    }
    const mid = midSum / ((midEnd - bassEnd) * 255);

    let trebleSum = 0;
    for (let i = midEnd; i < this.freqData.length; i++) {
      trebleSum += this.freqData[i];
    }
    const treble = trebleSum / ((this.freqData.length - midEnd) * 255);

    const volume = (bass * 0.5 + mid * 0.35 + treble * 0.15);
    const beat = bass > 0.45;

    return {
      bass,
      mid,
      treble,
      volume,
      beat,
      frequencyData: this.freqData,
    };
  }
}

export const audioEngine = new LofiAudioEngine();
