
// ============ LÓGICA DEL MODAL (esto no estaba en tu app.js, lo armé yo) ============
 
const modalSettings = document.getElementById('modal-settings');
const btnOpenSettings = document.getElementById('btn-hud-settings');
 
// Abrir modal
btnOpenSettings.addEventListener('click', () => {
    modalSettings.style.display = "flex";
});
 
// Cerrar modal (con cualquier botón que tenga data-close)
document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
        modalSettings.style.display = "none";
    });
});
 
// Cerrar al hacer click fuera de la tarjeta
modalSettings.addEventListener('click', (e) => {
    if (e.target === modalSettings) {
        modalSettings.classList.add('hidden-modal');
    }
});
 
// Slider de volumen
const volumeSlider = document.getElementById('volume-slider');
const volumeValue = document.getElementById('volume-value');
volumeSlider.addEventListener('input', () => {
    volumeValue.textContent = volumeSlider.value + '%';
    // Acá podrías conectar con tu Web Audio API: masterGain.value = volumeSlider.value / 100;
});
 
// Pantalla completa
document.getElementById('btn-toggle-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
        document.exitFullscreen();
    }
});
 
 
// Toggle SFX (ejemplo)
document.getElementById('toggle-sfx').addEventListener('change', (e) => {
    console.log('SFX activado:', e.target.checked);
});
 
// Reiniciar partida (ejemplo)
document.getElementById('btn-restart-game').addEventListener('click', () => {
    if (confirm('¿Seguro que querés reiniciar la partida?')) {
        location.reload(); // o tu función de reinicio real
    }
});
