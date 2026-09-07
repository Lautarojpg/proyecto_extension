let cartas = [];
let cartaActual = null;

// Puntuación inicial
let economia = {
    dinero: 50,
    reputacion: 50,
    insumos: 50
};

// Cargar cartas desde el JSON
async function cargarJuego() {
    const res = await fetch('./data/cards.json');
    cartas = await res.json();
    mostrarCarta(cartas[0].id);
}

function volverAlInicio() {
    // 1. Resetear las estadísticas a los valores iniciales
    economia = { dinero: 50, reputacion: 50, insumos: 50 };
    document.getElementById('stat-dinero').innerText = economia.dinero;
    document.getElementById('stat-reputacion').innerText = economia.reputacion;
    document.getElementById('stat-insumos').innerText = economia.insumos;

    // 2. Ocultar todos los objetos
    document.querySelectorAll('.objeto').forEach(obj => {
        obj.classList.add('oculto');
    });

    // --- LIMPIAR ESTILOS DE DERROTA Y RESTABLECER MÚSICA ---
    document.getElementById('card').classList.remove("carta-derrota");
    document.getElementById('bg-layer').classList.remove("fondo-derrota");
    if (typeof musicManager !== 'undefined') {
        musicManager.setMood('menu');
    }

    // 3. Preparar la primera carta
    mostrarCarta(cartas[0].id);

    // 4. Cambiar las pantallas
    document.getElementById("stats-bar").style.display = "none";
    document.getElementById("game-container").style.display = "none";
    document.getElementById("scene-main-menu").style.display = "flex"; 
}

function actualizarMusicaSegunEstado() {
    if (typeof musicManager === 'undefined') return;
    
    // Calcular el promedio de salud económica actual
    const saludPromedio = (economia.dinero + economia.reputacion + economia.insumos) / 3;

    if (saludPromedio >= 60) {
        musicManager.setMood('good'); // Modo Próspero / Mayor alegre
    } else if (saludPromedio >= 35) {
        musicManager.setMood('neutral'); // Modo Neutral / Aventura
    } else {
        musicManager.setMood('bad'); // Modo Crítico / Tensión menor
    }
}

function mostrarCarta(id) {

    if (id === "reiniciar") {
        volverAlInicio();
        return;
    }

    cartaActual = cartas.find(c => c.id === id) || cartas[0];

    document.getElementById('card-title').innerText = cartaActual.titulo;
    document.getElementById('card-description').innerText = cartaActual.descripcion;
    document.getElementById('card-image').innerText = cartaActual.imagen;

    // Resetear posición de la carta
    cardElem.style.transform = `translate(0px, 0px) rotate(0deg)`;
    overlayElem.className = 'choice-overlay';
    overlayElem.innerText = '';

    // --- LÓGICA VISUAL Y AUDITIVA DE DERROTA ---
    if (cartaActual.id.includes("game_over")) {
        cardElem.classList.add("carta-derrota");
        document.getElementById('bg-layer').classList.add("fondo-derrota");
        if (typeof musicManager !== 'undefined') {
            musicManager.setMood('gameover');
        }
    } else {
        cardElem.classList.remove("carta-derrota");
        document.getElementById('bg-layer').classList.remove("fondo-derrota");
    }
}

function actualizarEconomia(impacto) {
    economia.dinero = Math.max(0, economia.dinero + impacto.dinero);
    economia.reputacion = Math.max(0, economia.reputacion + impacto.reputacion);
    economia.insumos = Math.max(0, economia.insumos + impacto.insumos);

    document.getElementById('stat-dinero').innerText = economia.dinero;
    document.getElementById('stat-reputacion').innerText = economia.reputacion;
    document.getElementById('stat-insumos').innerText = economia.insumos;

    const netImpact = (impacto.dinero || 0) + (impacto.reputacion || 0) + (impacto.insumos || 0);
    if (netImpact > 0) {
        soundManager.playStatGain();
        if (typeof musicManager !== 'undefined') musicManager.playGoodStinger();
    } else if (netImpact < 0) {
        soundManager.playStatLoss();
        if (typeof musicManager !== 'undefined') musicManager.playBadStinger();
    }

    actualizarMusicaSegunEstado();
}

// --- LÓGICA DE SWIPE (Touch / Mouse) ---
const cardElem = document.getElementById('card');
const overlayElem = document.getElementById('choice-overlay');

let startX = 0, currentX = 0, isDragging = false;

// Umbral para que aparezca la vista previa (texto/color) mientras arrastrás
const PREVIEW_THRESHOLD = 80;
// Umbral para que se confirme la decisión al soltar (a más alto, más recorrido hace falta)
const DECISION_THRESHOLD = 160;

function onStart(e) {
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
}

function onMove(e) {
    if (!isDragging) return;
    currentX = (e.touches ? e.touches[0].clientX : e.clientX) - startX;

    // Rotación y movimiento
    let rotate = currentX * 0.05;
    cardElem.style.transform = `translate(${currentX}px, 0px) rotate(${rotate}deg)`;

    // Texto emergente según dirección
    if (currentX < -PREVIEW_THRESHOLD) {
        overlayElem.innerText = cartaActual.opcion_izquierda.texto;
        overlayElem.className = 'choice-overlay choice-left';
    } else if (currentX > PREVIEW_THRESHOLD) {
        overlayElem.innerText = cartaActual.opcion_derecha.texto;
        overlayElem.className = 'choice-overlay choice-right';
    } else {
        overlayElem.className = 'choice-overlay';
        overlayElem.innerText = '';
    }
}

function verificarDerrota() {
    if (economia.dinero <= 0) return "game_over_dinero";
    if (economia.reputacion <= 0) return "game_over_reputacion";
    return null; // Si devuelve null, significa que no perdió todavía
}

function onEnd() {
    if (!isDragging) return;
    isDragging = false;

    if (currentX < -DECISION_THRESHOLD) {
        // Decisión IZQUIERDA
        ejecutarDecision(cartaActual.opcion_izquierda);
    } else if (currentX > DECISION_THRESHOLD) {
        // Decisión DERECHA
        ejecutarDecision(cartaActual.opcion_derecha);
    } else {
        // No hizo el swipe lo suficientemente largo, la carta vuelve al centro
        cardElem.style.transform = `translate(0px, 0px) rotate(0deg)`;
        overlayElem.className = 'choice-overlay';
    }
    currentX = 0;
}

function ejecutarDecision(opcion) {
    // 1. Si es reiniciar (Game Over o Victoria), vuelve al menú y corta acá
    if (opcion.siguiente_id === "reiniciar") {
        volverAlInicio();
        return; 
    }

    // 2. Aplicamos impactos, sumando siempre +10 de insumos por turno
    let impactoFinal = { dinero: 0, reputacion: 0, insumos: 10 }; 
    if (opcion.impacto) {
        impactoFinal.dinero = opcion.impacto.dinero || 0;
        impactoFinal.reputacion = opcion.impacto.reputacion || 0;
        impactoFinal.insumos = (opcion.impacto.insumos || 0) + 10; 
    }
    actualizarEconomia(impactoFinal);

    if (opcion.objeto) {
        agregarObjeto(opcion.objeto);
    }

    // 3. Revisamos si perdió
    const idDerrota = verificarDerrota();
    if (idDerrota) {
        mostrarCarta(idDerrota);
        return;
    }

    // 4. Revisar si GANÓ la etapa (Juntó 150 monedas)
    if (economia.dinero >= 150 && cartaActual.id !== "carta_proximamente") {
        mostrarCarta("carta_proximamente");
        return;
    }

    // 5. Sistema de Cartas Aleatorias
    if (opcion.siguiente_id === "evento_aleatorio") {
        // Excluye la carta actual para que no salga dos veces seguidas
        let eventos = cartas.filter(c => c.id.includes("rand") && c.id !== cartaActual.id);
        
        if (eventos.length === 0) {
            eventos = cartas.filter(c => c.id.includes("rand"));
        }
        
        const cartaAlAzar = eventos[Math.floor(Math.random() * eventos.length)];
        mostrarCarta(cartaAlAzar.id);
    } else {
        mostrarCarta(opcion.siguiente_id);
    }
}

function agregarObjeto(nombre){
    const elem = document.getElementById(nombre);
    if (elem) {
        elem.classList.remove("oculto");
        soundManager.playUnlockItem();
    }
}

// Boton de iniciar el juego
document.getElementById("btn-start").onclick = () => {
    soundManager.playClick();
    if (typeof musicManager !== 'undefined') {
        musicManager.start();
        actualizarMusicaSegunEstado();
    }
    document.getElementById("scene-main-menu").style.display="none";
    document.getElementById("stats-bar").style.display="flex";
    document.getElementById("game-container").style.display="flex";
}

// Iniciar música del menú tras interacción inicial
document.addEventListener('pointerdown', () => {
    if (typeof musicManager !== 'undefined' && musicManager.isEnabled() && !musicManager.isPlaying) {
        musicManager.setMood('menu');
        musicManager.start();
    }
}, { once: true });

// Event Listeners
cardElem.addEventListener('mousedown', onStart);
document.addEventListener('mousemove', onMove);
document.addEventListener('mouseup', onEnd);

cardElem.addEventListener('touchstart', onStart);
document.addEventListener('touchmove', onMove);
document.addEventListener('touchend', onEnd);

// Iniciar juego
document.getElementById("modal-settings").style.display = "none";
cargarJuego();