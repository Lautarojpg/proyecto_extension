// ============ MOTOR DE MÚSICA ADAPTATIVA 8-BITS (Web Audio API) ============

class MusicManager8Bit {
    constructor() {
        this.audioCtx = null;
        
        // Guardar/cargar configuración de volumen y estado
        const savedVolume = localStorage.getItem('bgm_volume');
        const savedEnabled = localStorage.getItem('bgm_enabled');
        
        this.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
        this.enabled = savedEnabled !== null ? savedEnabled === 'true' : true;
        
        this.currentMood = 'menu'; // 'menu', 'good', 'neutral', 'bad', 'gameover'
        this.isPlaying = false;
        
        // Variables de sincronización del secuenciador
        this.tempo = 120; // BPM por defecto
        this.currentStep = 0;
        this.nextNoteTime = 0;
        this.timerId = null;
        this.lookahead = 25.0; // Milisegundos entre chequeos
        this.scheduleAheadTime = 0.1; // Segundos a programar por adelantado

        // Frecuencias de notas musicales (Hz)
        this.notes = {
            'C2': 65.41,  'D2': 73.42,  'Eb2': 77.78, 'E2': 82.41,  'F2': 87.31,  'F#2': 92.50, 'G2': 98.00,  'Ab2': 103.83, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
            'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'Ab3': 207.65, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'Ab5': 830.61, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
            'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'G6': 1567.98,
            '-': null // Silencio
        };

        // Patrones musicales de 16 pasos para cada estado del juego
        this.patterns = {
            menu: {
                tempo: 124,
                melody: ['C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'C5', 'D5', 'E5', 'G5', 'C6', 'B5', 'A5', 'G5', 'F5', 'E5'],
                bass:   ['C3', '-',  'G3', '-',  'A3', '-',  'F3', '-',  'C3', '-',  'G3', '-',  'A3', 'F3', 'G3', '-'],
                arp:    ['C4', 'G4', 'E4', 'G4', 'C4', 'G4', 'E4', 'G4', 'C4', 'A4', 'F4', 'A4', 'C4', 'G4', 'E4', 'G4'],
                drum:   ['k',  'h',  'h',  'h',  's',  'h',  'h',  'h',  'k',  'h',  'h',  'h',  's',  'h',  'h',  'h']
            },
            good: {
                tempo: 136, // Ritmo acelerado y alegre
                melody: ['E5', 'G5', 'C6', 'G5', 'E5', 'F5', 'G5', 'A5', 'G5', 'C6', 'E6', 'D6', 'C6', 'G5', 'E5', 'D5'],
                bass:   ['C3', 'C3', 'E3', 'G3', 'F3', 'F3', 'A3', 'C4', 'G3', 'G3', 'B3', 'D4', 'C3', 'E3', 'G3', 'C3'],
                arp:    ['C4', 'E4', 'G4', 'C5', 'F4', 'A4', 'C5', 'F5', 'G4', 'B4', 'D5', 'G5', 'C4', 'E4', 'G4', 'C5'],
                drum:   ['k',  'h',  'k',  'h',  's',  'h',  'k',  'h',  ['k','k'], 'h', 'k', 'h', 's', 'h', 'k', 'h']
            },
            neutral: {
                tempo: 118, // Ritmo estándar de aventura
                melody: ['G4', 'C5', 'D5', 'E5', 'D5', 'C5', 'A4', 'G4', 'A4', 'C5', 'C5', 'D5', 'E5', 'G5', 'E5', 'D5'],
                bass:   ['A2', '-',  'C3', 'E3', 'F2', '-',  'A2', 'C3', 'G2', '-',  'B2', 'D3', 'E2', '-',  'G2', 'B2'],
                arp:    ['A3', 'C4', 'E4', 'A4', 'F3', 'A3', 'C4', 'F4', 'G3', 'B3', 'D4', 'G4', 'E3', 'G3', 'B3', 'E4'],
                drum:   ['k',  'h',  'h',  'h',  's',  'h',  'h',  'h',  'k',  'h',  'k',  'h',  's',  'h',  'h',  'h']
            },
            bad: {
                tempo: 110, // Tema tenso en escala menor
                melody: ['A4', 'C5', 'Eb5', 'D5', 'C5', 'A4', 'F#4', 'G4', 'A4', 'Eb5', 'D5', 'C5', 'F4', 'G4', 'Ab4', 'A4'],
                bass:   ['A2', 'A2', 'Eb2', 'D2', 'D2', 'D2', 'F2', 'G2', 'A2', 'A2', 'Eb2', 'Eb2', 'E2', 'E2', 'E2', 'E2'],
                arp:    ['A3', 'Eb4', 'A3', 'Eb4', 'D3', 'F#3', 'D3', 'F#3', 'A3', 'Eb4', 'A3', 'Eb4', 'E3', 'Ab3', 'E3', 'Ab3'],
                drum:   ['k',  'k',  's',  'h',  'k',  'k',  's',  'h',  'k',  'k',  's',  'h',  'k',  's',  's',  'h']
            },
            gameover: {
                tempo: 90, // Tono melancólico y lento de derrota
                melody: ['C5', '-',  'B4', '-',  'Bb4', '-', 'A4', '-',  'Ab4', '-', 'G4', '-',  'Eb4', '-', 'C4', '-'],
                bass:   ['C3', '-',  'G2', '-',  'C3', '-',  'F2', '-',  'Fm2', '-', 'C2', '-',  'G2', '-',  'C2', '-'],
                arp:    ['C4', 'Eb4', 'G4', 'C5', 'B3', 'D4', 'G4', 'B4', 'Bb3', 'Db4', 'F4', 'Bb4', 'C4', 'Eb4', 'G4', 'C5'],
                drum:   ['k',  '-',  '-',  '-',  's',  '-',  '-',  '-',  'k',  '-',  '-',  '-',  's',  '-',  '-',  '-']
            }
        };
    }

    init(context) {
        if (context) {
            this.audioCtx = context;
        } else if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
            }
        }

        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        localStorage.setItem('bgm_volume', this.volume);
    }

    getVolume() {
        return this.volume;
    }

    setEnabled(isEnabled) {
        this.enabled = Boolean(isEnabled);
        localStorage.setItem('bgm_enabled', this.enabled);
        if (!this.enabled) {
            this.stop();
        } else if (!this.isPlaying && this.enabled) {
            this.start();
        }
    }

    isEnabled() {
        return this.enabled;
    }

    setMood(mood) {
        if (!this.patterns[mood]) return;
        if (this.currentMood !== mood) {
            this.currentMood = mood;
            this.tempo = this.patterns[mood].tempo;
        }
        if (this.enabled && !this.isPlaying) {
            this.start();
        }
    }

    start() {
        this.init();
        if (!this.enabled || !this.audioCtx) return;
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = this.audioCtx.currentTime + 0.05;
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }

    scheduler() {
        if (!this.isPlaying || !this.enabled) return;

        while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
            this.scheduleStep(this.currentStep, this.nextNoteTime);
            this.advanceStep();
        }

        this.timerId = setTimeout(() => this.scheduler(), this.lookahead);
    }

    advanceStep() {
        const pattern = this.patterns[this.currentMood] || this.patterns.neutral;
        const secondsPerBeat = 60.0 / (pattern.tempo * 2); // 16th notes
        this.nextNoteTime += secondsPerBeat;
        this.currentStep = (this.currentStep + 1) % 16;
    }

    scheduleStep(step, time) {
        if (!this.audioCtx || this.volume <= 0) return;

        const pattern = this.patterns[this.currentMood] || this.patterns.neutral;
        const masterGainVal = 0.18 * this.volume;

        // 1. Canal Melodía (Onda Cuadrada / Square Pulse)
        const noteMelody = pattern.melody[step];
        if (noteMelody && this.notes[noteMelody]) {
            this.playPulseTone(this.notes[noteMelody], time, 0.12, 'square', masterGainVal * 0.9);
        }

        // 2. Canal Arpegio / Armonía (Onda Cuadrada suave)
        const noteArp = pattern.arp[step];
        if (noteArp && this.notes[noteArp]) {
            this.playPulseTone(this.notes[noteArp], time, 0.08, 'square', masterGainVal * 0.5);
        }

        // 3. Canal Bajo (Onda Triangular / Triangle Wave)
        const noteBass = pattern.bass[step];
        if (noteBass && this.notes[noteBass]) {
            this.playPulseTone(this.notes[noteBass], time, 0.18, 'triangle', masterGainVal * 1.2);
        }

        // 4. Percusión 8-bits (Ruido blanco / White Noise)
        const drum = pattern.drum[step];
        if (drum) {
            if (Array.isArray(drum)) {
                drum.forEach((d, idx) => this.play8BitDrum(d, time + (idx * 0.04), masterGainVal));
            } else if (drum !== '-') {
                this.play8BitDrum(drum, time, masterGainVal);
            }
        }
    }

    playPulseTone(freq, time, duration, type, volume) {
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(volume, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(time);
            osc.stop(time + duration);
        } catch (e) {
            // Ignorar pequeños desfases si el AudioContext está reiniciándose
        }
    }

    play8BitDrum(type, time, masterVolume) {
        try {
            if (type === 'k') {
                // Bombo (Kick) - Frecuencia descendente rápida en onda senoidal/triangular
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(120, time);
                osc.frequency.exponentialRampToValueAtTime(30, time + 0.08);

                gain.gain.setValueAtTime(masterVolume * 1.3, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start(time);
                osc.stop(time + 0.08);

            } else if (type === 's' || type === 'h') {
                // Caja (Snare) o Hi-Hat usando buffer de ruido 8-bits
                const bufferSize = this.audioCtx.sampleRate * (type === 's' ? 0.08 : 0.03);
                const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
                const output = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1; // Ruido blanco
                }

                const whiteNoise = this.audioCtx.createBufferSource();
                whiteNoise.buffer = buffer;

                const filter = this.audioCtx.createBiquadFilter();
                filter.type = type === 's' ? 'lowpass' : 'highpass';
                filter.frequency.setValueAtTime(type === 's' ? 1200 : 5000, time);

                const gain = this.audioCtx.createGain();
                const vol = (type === 's' ? 0.7 : 0.3) * masterVolume;
                gain.gain.setValueAtTime(vol, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + (type === 's' ? 0.08 : 0.03));

                whiteNoise.connect(filter);
                filter.connect(gain);
                gain.connect(this.audioCtx.destination);

                whiteNoise.start(time);
                whiteNoise.stop(time + (type === 's' ? 0.08 : 0.03));
            }
        } catch (e) {
            // Ignorar errores puntuales de audio
        }
    }

    // --- STINGERS / ACENTOS DE DECISIÓN (BUENA vs MALA) ---

    // Acento armónico 8-bit para decisión BUENA
    playGoodStinger() {
        if (!this.enabled || this.volume <= 0) return;
        this.init();
        if (!this.audioCtx) return;

        const now = this.audioCtx.currentTime;
        const stingerNotes = [523.25, 659.25, 783.99, 1046.50]; // Do5, Mi5, Sol5, Do6 (Arpegio Triunfal)

        stingerNotes.forEach((freq, i) => {
            const time = now + (i * 0.05);
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, time);

            const duration = i === stingerNotes.length - 1 ? 0.2 : 0.08;
            gain.gain.setValueAtTime(0.25 * this.volume, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(time);
            osc.stop(time + duration);
        });
    }

    // Acento armónico 8-bit para decisión MALA
    playBadStinger() {
        if (!this.enabled || this.volume <= 0) return;
        this.init();
        if (!this.audioCtx) return;

        const now = this.audioCtx.currentTime;
        const stingerNotes = [622.25, 523.25, 369.99, 293.66]; // Eb5, C5, F#4, D4 (Acorde descendente disonante)

        stingerNotes.forEach((freq, i) => {
            const time = now + (i * 0.06);
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sawtooth'; // Tono áspero estilo 8-bits
            osc.frequency.setValueAtTime(freq, time);

            const duration = i === stingerNotes.length - 1 ? 0.25 : 0.09;
            gain.gain.setValueAtTime(0.22 * this.volume, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(time);
            osc.stop(time + duration);
        });
    }
}

// Instancia global del administrador de música
const musicManager = new MusicManager8Bit();

// Inicializar y reanudar audio en interacción del usuario
document.addEventListener('pointerdown', () => musicManager.init(), { once: true });
document.addEventListener('keydown', () => musicManager.init(), { once: true });
