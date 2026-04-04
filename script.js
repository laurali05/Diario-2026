// 1. VALIDAR ACCESO
function validarAcceso() {
    const claveCorrecta = "030822"; 
    const claveIntroducida = document.getElementById("password").value;

    if (claveIntroducida === claveCorrecta) {
        document.getElementById("pantalla-login").style.display = "none";
        sessionStorage.setItem("acceso", "concedido");
    } else {
        document.getElementById("mensaje-error").style.display = "block";
    }
}

// 2. NAVEGACIÓN ENTRE SECCIONES
function verSeccion(id) {
    // Ocultamos todas las secciones primero
    const secciones = document.querySelectorAll('.pantalla');
    secciones.forEach(s => s.style.display = 'none');

    // Mostramos la que queremos
    const seccion = document.getElementById(id);
    if (seccion) {
        seccion.style.display = 'block';
        
        // Actualizar URL para secciones (opcional)
        const url = new URL(window.location.href);
        url.searchParams.set('seccion', id); 
        window.history.pushState({ seccion: id }, '', url.href);
    }
}

// 3. CARGA PRINCIPAL (UNIFICADA)
window.addEventListener('DOMContentLoaded', () => {
    // Comprobar acceso
    if (sessionStorage.getItem("acceso") === "concedido") {
        const login = document.getElementById("pantalla-login");
        if(login) login.style.display = "none";
    }

    // Generar sobres
    generarIndice();

    // Comprobar si venimos de un link de correo (?dia=X)
    const urlParams = new URLSearchParams(window.location.search);
    const diaEnUrl = urlParams.get('dia');
    if (diaEnUrl) {
        mostrarCarta(diaEnUrl);
    }
});

// 4. GENERAR ÍNDICE DE CARTAS
function generarIndice() {
    const contenedor = document.getElementById('contenedor-lineas');
    if(!contenedor) return;
    contenedor.innerHTML = "";

    const hoy = calcularDiaActual();
    const totalDeCartas = 365;

    for (let i = 1; i <= totalDeCartas; i++) {
        const linea = document.createElement('div');
        if (i <= hoy) {
            linea.className = 'linea-carta desbloqueada';
            linea.innerHTML = `<span>💌 Carta ${i}</span>`;
            linea.onclick = () => mostrarCarta(i);
        } else {
            linea.className = 'linea-carta bloqueada';
            linea.innerHTML = `<span>🔒 Carta ${i}</span>`;
        }
        contenedor.appendChild(linea);
    }
}

// 5. MOSTRAR CARTA
async function mostrarCarta(id) {
    // 1. Ocultamos el índice de cartas y mostramos la pantalla de lectura
    document.getElementById('cartas').style.display = 'none'; 
    document.getElementById('lectura').style.display = 'block';

    // 2. Actualizamos la URL (Lo que ya hacíamos)
    const url = new URL(window.location.href);
    url.searchParams.set('dia', id);
    window.history.pushState({ id: id }, '', url.href);

    // 3. Ponemos los títulos
    document.getElementById('titulo-carta').innerText = "Carta " + id;
    const texto = document.getElementById('texto-carta');
    texto.innerText = "Abriendo el sobre... 💌";

    try {
        const respuesta = await fetch(`cartas/${id}.txt`);
        if (!respuesta.ok) throw new Error();
        const contenido = await respuesta.text();
        texto.innerText = contenido;
    } catch (error) {
        texto.innerText = "Todavía no hay carta para este día. ❤️";
    }
}

// 6. CALCULAR DÍA
function calcularDiaActual() {
    const fechaInicio = new Date('2026-04-03'); // Asegúrate de que esta fecha es la correcta
    const hoy = new Date();
    const diferencia = hoy - fechaInicio;
    const diaActual = Math.floor(diferencia / (1000 * 60 * 60 * 24)) + 1;
    return diaActual > 0 ? diaActual : 0;
}

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const diaEnUrl = urlParams.get('dia');

    if (diaEnUrl) {
        // Si hay un día en la URL, ocultamos el inicio y mostramos la carta
        document.getElementById('inicio').style.display = 'none';
        mostrarCarta(diaEnUrl);
    }
});