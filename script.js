function validarAcceso() {
    const claveCorrecta = "030822"; // CAMBIA ESTO POR TU CLAVE
    const claveIntroducida = document.getElementById("password").value;

    if (claveIntroducida === claveCorrecta) {
        // Si es correcta, ocultamos el muro
        document.getElementById("pantalla-login").style.display = "none";
        // Guardamos en la sesión que ya entró para que no pida la clave todo el rato
        sessionStorage.setItem("acceso", "concedido");
    } else {
        // Si es incorrecta, mostramos error
        document.getElementById("mensaje-error").style.display = "block";
    }
}

// Al cargar la página, comprobamos si ya había entrado antes
window.onload = function () {
    if (sessionStorage.getItem("acceso") === "concedido") {
        document.getElementById("pantalla-login").style.display = "none";
    }
    generarIndice(); // Tu función que crea las líneas de las cartas
};

// 1. Función para cambiar entre pantallas
function verSeccion(id) {
    // Ocultamos todas
    document.querySelectorAll('.pantalla').forEach(p => p.style.display = 'none');
    // Mostramos la elegida
    document.getElementById(id).style.display = 'block';
}

// 2. Generar las líneas de cartas automáticamente
function generarIndice() {
    const contenedor = document.getElementById('contenedor-lineas');
    contenedor.innerHTML = "";

    // Aquí pondremos el día real más adelante
    const hoy = calcularDiaActual();
    const totalDeCartas = 365; // Puedes poner 365 si quieres verlas todas

    for (let i = 1; i <= totalDeCartas; i++) {
        const linea = document.createElement('div');

        if (i <= hoy) {
            // DISEÑO DESBLOQUEADO
            linea.className = 'linea-carta desbloqueada';
            linea.innerHTML = `
                <span class="icon-estado">💌</span>
                <strong>Carta ${i}</strong>
            `;
            linea.onclick = function () {
                mostrarCarta(i);
                verSeccion('lectura');
            };
        } else {
            // DISEÑO BLOQUEADO
            linea.className = 'linea-carta bloqueada';
            linea.innerHTML = `
                <span class="icon-estado">🔒</span>
                <span>Carta ${i}</span>
            `;
            // Al ser bloqueada, no le asignamos función de click
        }

        contenedor.appendChild(linea);
    }
}

async function mostrarCarta(id) {
    const titulo = document.getElementById('titulo-carta');
    const texto = document.getElementById('texto-carta');

    titulo.innerText = "Carta " + id;
    texto.innerText = "Abriendo el sobre... 💌";

    try {
        // Esto busca el archivo 1.txt, 2.txt, etc., en tu carpeta de GitHub
        const respuesta = await fetch(`cartas/${id}.txt`);
        if (!respuesta.ok) throw new Error();
        const contenido = await respuesta.text();
        texto.innerText = contenido;
    } catch (error) {
        texto.innerText = "Hubo un problemilla al abrir esta carta, pero mi amor por ti sigue intacto. ❤️";
    }
}

function calcularDiaActual() {
    const fechaInicio = new Date('2026-08-03'); // Pon aquí la fecha en que empieza el diario
    const hoy = new Date();

    // Calculamos la diferencia en milisegundos
    const diferencia = hoy - fechaInicio;

    // Convertimos a días (milisegundos / 1000s / 60m / 60h / 24d)
    const diaActual = Math.floor(diferencia / (1000 * 60 * 60 * 24)) + 1;

    return diaActual > 0 ? diaActual : 0; // Si aún no ha empezado, devuelve 0
}
// Ejecutar al cargar la web
window.onload = generarIndice;