// ============ LÓGICA DEL MODAL ============

const modalSettings = document.getElementById('modal-settings');

// Ahora selecciona AMBOS botones de ajustes (menú principal + HUD)
const btnsOpenSettings = document.querySelectorAll('#btn-settings, #btn-hud-settings');

function openSettings() {
    modalSettings.classList.remove('hidden-modal');
    modalSettings.style.display = "flex";
}

function closeSettings() {
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

// Slider de Volumen de SFX
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');

if (typeof soundManager !== 'undefined') {
    volumeSlider.value = Math.round(soundManager.getVolume() * 100);
    volumeValue.textContent = volumeSlider.value + '%';

    volumeSlider.addEventListener('input', () => {
        volumeValue.textContent = volumeSlider.value + '%';
        soundManager.setVolume(parseFloat(volumeSlider.value) / 100);
    });
}

// Slider de Volumen de Música 8-Bit (BGM)
const musicVolumeSlider = document.getElementById('music-volume-slider');
const musicVolumeValue = document.getElementById('music-volume-value');

if (typeof musicManager !== 'undefined') {
    musicVolumeSlider.value = Math.round(musicManager.getVolume() * 100);
    musicVolumeValue.textContent = musicVolumeSlider.value + '%';

    musicVolumeSlider.addEventListener('input', () => {
        musicVolumeValue.textContent = musicVolumeSlider.value + '%';
        musicManager.setVolume(parseFloat(musicVolumeSlider.value) / 100);
    });
}

// Pantalla completa
document.getElementById('btn-toggle-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
});

