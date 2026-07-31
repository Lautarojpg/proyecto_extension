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

function mostrarCarta(id) {
    cartaActual = cartas.find(c => c.id === id) || cartas[0];

    document.getElementById('card-title').innerText = cartaActual.titulo;
    document.getElementById('card-description').innerText = cartaActual.descripcion;
    document.getElementById('card-image').innerText = cartaActual.imagen;

    // Resetear posición de la carta
    cardElem.style.transform = `translate(0px, 0px) rotate(0deg)`;
    overlayElem.className = 'choice-overlay';
    overlayElem.innerText = '';
}

function actualizarEconomia(impacto) {
    economia.dinero = Math.max(0, economia.dinero + impacto.dinero);
    economia.reputacion = Math.max(0, economia.reputacion + impacto.reputacion);
    economia.insumos = Math.max(0, economia.insumos + impacto.insumos);

    document.getElementById('stat-dinero').innerText = economia.dinero;
    document.getElementById('stat-reputacion').innerText = economia.reputacion;
    document.getElementById('stat-insumos').innerText = economia.insumos;
}

// --- LÓGICA DE SWIPE (Touch / Mouse) ---
const cardElem = document.getElementById('card');
const overlayElem = document.getElementById('choice-overlay');

let startX = 0, currentX = 0, isDragging = false;

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
    if (currentX < -50) {
        overlayElem.innerText = cartaActual.opcion_izquierda.texto;
        overlayElem.className = 'choice-overlay choice-left';
    } else if (currentX > 50) {
        overlayElem.innerText = cartaActual.opcion_derecha.texto;
        overlayElem.className = 'choice-overlay choice-right';
    } else {
        overlayElem.className = 'choice-overlay';
        overlayElem.innerText = '';
    }
}

function onEnd() {
    if (!isDragging) return;
    isDragging = false;

    const threshold = 100; // Distancia para tomar la decisión
    
    if (currentX < -threshold) {
        const opcion = cartaActual.opcion_izquierda;
        // Decisión IZQUIERDA (NO)
        actualizarEconomia(cartaActual.opcion_izquierda.impacto);
        if(opcion.objeto){
            agregarObjeto(opcion.objeto);
        }


        mostrarCarta(cartaActual.opcion_izquierda.siguiente_id);
    } else if (currentX > threshold) {
        const opcion = cartaActual.opcion_derecha;
        // Decisión DERECHA (SÍ)
        actualizarEconomia(cartaActual.opcion_derecha.impacto);
        if(opcion.objeto){
            agregarObjeto(opcion.objeto);
        }
        mostrarCarta(cartaActual.opcion_derecha.siguiente_id);
    } else {
        // Volver al centro
        cardElem.style.transform = `translate(0px, 0px) rotate(0deg)`;
        overlayElem.className = 'choice-overlay';
    }
    currentX = 0;
}

function agregarObjeto(nombre){

    document
        .getElementById(nombre)
        .classList.remove("oculto");

}

// boton de inciar el juego
document.getElementById("btn-start").onclick = () => {
    document.getElementById("scene-main-menu").style.display="none";
    document.getElementById("stats-bar").style.display="flex";
    document.getElementById("game-container").style.display="flex";
}

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