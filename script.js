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
window.onload = function() {
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
    const hoy = 15; 
    const totalDeCartas = 30; // Puedes poner 365 si quieres verlas todas

    for (let i = 1; i <= totalDeCartas; i++) {
        const linea = document.createElement('div');
        
        if (i <= hoy) {
            // DISEÑO DESBLOQUEADO
            linea.className = 'linea-carta desbloqueada';
            linea.innerHTML = `
                <span class="icon-estado">💌</span>
                <strong>Carta ${i}</strong>
            `;
            linea.onclick = function() {
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

function mostrarCarta(id) {
    // 1. Buscamos el título y el párrafo en el HTML
    const titulo = document.getElementById('titulo-carta');
    const texto = document.getElementById('texto-carta');

    // 2. Ponemos el título dinámico
    titulo.innerText = "Carta " + id;

    // 3. Simulamos el contenido (Temporalmente)
    // Cuando lo subas a internet, cambiaremos esto por una lectura de archivos .txt
    const mensajesDePrueba = {
        1: "Este es el mensaje de la primera carta. ¡Qué ilusión que funcione!",
        2: "Hoy es el segundo día... Cada vez te quiero más.",
        15: "¡Has llegado a la carta 15! Eres el mejor."
    };

    // Si no tenemos texto para ese número, ponemos uno por defecto
    texto.innerText = mensajesDePrueba[id] || "Contenido de la carta " + id + ": Aquí irá el texto que escribiste en tu archivo .txt original.";
}

// Ejecutar al cargar la web
window.onload = generarIndice;