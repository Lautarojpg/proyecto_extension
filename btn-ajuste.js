// ============ LÓGICA DEL MODAL ============

const modalSettings = document.getElementById('modal-settings');

// Ahora selecciona AMBOS botones de ajustes (menú principal + HUD)
const btnsOpenSettings = document.querySelectorAll('#btn-settings, #btn-hud-settings');

function openSettings() {
    if (typeof soundManager !== 'undefined') soundManager.playModalToggle();
    modalSettings.classList.remove('hidden-modal');
    modalSettings.style.display = "flex";
}

function closeSettings() {
    if (typeof soundManager !== 'undefined') soundManager.playModalToggle();
    modalSettings.classList.add('hidden-modal');
    modalSettings.style.display = "none";
}

// Abrir modal con cualquiera de los dos botones
btnsOpenSettings.forEach(btn => {
    btn.addEventListener('click', openSettings);
});

// Cerrar modal (con cualquier botón que tenga data-close)
document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', closeSettings);
});

// Cerrar al hacer click fuera de la tarjeta
modalSettings.addEventListener('click', (e) => {
    if (e.target === modalSettings) {
        closeSettings();
    }
});

// Slider de volumen y Toggle SFX
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
const toggleSfx = document.getElementById('toggle-sfx');

// Inicializar valores desde soundManager
if (typeof soundManager !== 'undefined') {
    if (volumeSlider && volumeValue) {
        const currentVolPercent = Math.round(soundManager.getVolume() * 100);
        volumeSlider.value = currentVolPercent;
        volumeValue.textContent = currentVolPercent + '%';

        volumeSlider.addEventListener('input', () => {
            const val = parseFloat(volumeSlider.value);
            volumeValue.textContent = val + '%';
            soundManager.setVolume(val / 100);
        });
    }

    if (toggleSfx) {
        toggleSfx.checked = soundManager.isEnabled();
        toggleSfx.addEventListener('change', (e) => {
            soundManager.setEnabled(e.target.checked);
            if (e.target.checked) {
                soundManager.playClick();
            }
        });
    }
}

// Pantalla completa
document.getElementById('btn-toggle-fullscreen').addEventListener('click', () => {
    if (typeof soundManager !== 'undefined') soundManager.playClick();
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
});

// Reiniciar partida
document.getElementById('btn-restart-game').addEventListener('click', () => {
    if (typeof soundManager !== 'undefined') soundManager.playClick();
    if (confirm('¿Seguro que querés reiniciar la partida?')) {
        location.reload();
    }
});

// Créditos
const btnCredits = document.getElementById('btn-credits');
if (btnCredits) {
    btnCredits.addEventListener('click', () => {
        if (typeof soundManager !== 'undefined') soundManager.playClick();
    });
}