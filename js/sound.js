// ============ SISTEMA DE AUDIO (Web Audio API) ============

class SoundManager {
    constructor() {
        this.audioCtx = null;
        
        // Cargar configuración guardada o usar valores por defecto
        const savedVolume = localStorage.getItem('sfx_volume');
        const savedEnabled = localStorage.getItem('sfx_enabled');
        
        this.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.8;
        this.enabled = savedEnabled !== null ? savedEnabled === 'true' : true;
    }

    // Inicializar el AudioContext tras la interacción del usuario
    init() {
        if (!this.audioCtx) {
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
        // val entre 0.0 y 1.0
        this.volume = Math.max(0, Math.min(1, val));
        localStorage.setItem('sfx_volume', this.volume);
    }

    getVolume() {
        return this.volume;
    }

    setEnabled(isEnabled) {
        this.enabled = Boolean(isEnabled);
        localStorage.setItem('sfx_enabled', this.enabled);
    }

    isEnabled() {
        return this.enabled;
    }

    // --- EFECTOS DE SONIDO ESPECÍFICOS ---

    // 1. Clic de Botón
    playClick() {
        if (!this.enabled || this.volume <= 0) return;
        this.init();
        if (!this.audioCtx) return;

        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

        gain.gain.setValueAtTime(0.3 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    // 2. Swipe Derecha (Aceptar / Sí)
    playSwipeRight() {
        if (!this.enabled || this.volume <= 0) return;
        this.init();
        if (!this.audioCtx) return;

        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

        gain.gain.setValueAtTime(0.35 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    // 3. Swipe Izquierda (Rechazar / No)
    playSwipeLeft() {
        if (!this.enabled || this.volume <= 0) return;
        this.init();
        if (!this.audioCtx) return;

        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);

        gain.gain.setValueAtTime(0.35 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    // 4. Ganancia Económica / Moneda
    playStatGain() {
        if (!this.enabled || this.volume <= 0) return;
        this.init();
        if (!this.audioCtx) return;

        const now = this.audioCtx.currentTime;
        
        // Tono 1 (Si 5)
        const osc1 = this.audioCtx.createOscillator();
        const gain1 = this.audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(987.77, now);
        gain1.gain.setValueAtTime(0.25 * this.volume, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc1.connect(gain1);
        gain1.connect(this.audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.1);

        // Tono 2 (Mi 6)
        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1318.51, now + 0.08);
        gain2.gain.setValueAtTime(0.3 * this.volume, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc2.connect(gain2);
        gain2.connect(this.audioCtx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.25);
    }

    // 5. Pérdida Económica
    playStatLoss() {
        if (!this.enabled || this.volume <= 0) return;
        this.init();
        if (!this.audioCtx) return;

        const now = this.audioCtx.currentTime;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.18);

        gain.gain.setValueAtTime(0.2 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    // 6. Desbloqueo de Objeto / Logro (Fanfarria)
    playUnlockItem() {
        if (!this.enabled || this.volume <= 0) return;
        this.init();
        if (!this.audioCtx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // Do5, Mi5, Sol5, Do6
        const times = [0, 0.08, 0.16, 0.24];

        times.forEach((t, i) => {
            const now = this.audioCtx.currentTime + t;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(notes[i], now);

            const duration = i === notes.length - 1 ? 0.3 : 0.12;
            gain.gain.setValueAtTime(0.25 * this.volume, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(now);
            osc.stop(now + duration);
        });
    }

    // 7. Abrir / Cerrar Modal
    playModalToggle() {
        if (!this.enabled || this.volume <= 0) return;
        this.init();
        if (!this.audioCtx) return;

        const now = this.audioCtx.currentTime;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.06);

        gain.gain.setValueAtTime(0.2 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }
}

// Instancia global del administrador de sonido
const soundManager = new SoundManager();

// Inicializar audio al interactuar con la página
document.addEventListener('pointerdown', () => soundManager.init(), { once: true });
document.addEventListener('keydown', () => soundManager.init(), { once: true });
