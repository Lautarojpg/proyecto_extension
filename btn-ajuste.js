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

// Slider de volumen
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
volumeSlider.addEventListener('input', () => {
    volumeValue.textContent = volumeSlider.value + '%';
});

// Pantalla completa
document.getElementById('btn-toggle-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
});

// Toggle SFX
document.getElementById('toggle-sfx').addEventListener('change', (e) => {
    console.log('SFX activado:', e.target.checked);
});

// Reiniciar partida
document.getElementById('btn-restart-game').addEventListener('click', () => {
    if (confirm('¿Seguro que querés reiniciar la partida?')) {
        location.reload();
    }
});