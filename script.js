// ==========================================
// 0. CONFIGURA AQUÍ TUS CARTAS PUBLICADAS
// ==========================================
// Añade aquí cada carta que tengas subida en la carpeta /cartas/
// El índice las mostrará automáticamente de la más nueva a la más antigua.
const CARTAS_PUBLICADAS = [
    {
        id: 1,
        titulo: "Feliz 4º aniversario", // <-- Cambia este título
        foto: "imagenes/nosotros.jpeg"
    },
    {
        id: 2,
        titulo: "Tu sonrisa" // <-- Cambia este título
    },
    {
        id: 3,
        titulo: "La graduación de 2º de bach", // <-- Cambia este título
        foto: "imagenes/graduacion.jpg"
    },
    {
        id: 4,
        titulo: "Sudoku", // <-- Cambia este título
        foto: "imagenes/Sudoku 1.jpg"
    },
    {
        id: 5,
        titulo: "Il fillo Rosso", // <-- Cambia este título
        cancion: {
            titulo: "Il fillo Rosso",
            artista: "Alfa",
            archivoAudio: "audios/il fillo rosso- Alfa.mp3"
        }
    },
    {
        id: 6,
        titulo: "Preguntas 1"
    },
    {
        id: 7,
        titulo: "Mis sentimientos sobre lo de Adriana"
    },
    {
        id: 8,
        titulo: "Et Prometo", // <-- Cambia este título
        cancion: {
            titulo: "Et Prometo",
            artista: "Ivan Herzog",
            archivoAudio: "audios/Ivan Herzog- Et prometo.mp3"
        }
    },
    {
        id: 9,
        titulo: "Preguntas 2", // <-- Cambia este título
    },
    {
        id: 10,
        titulo: "Lo que siento cuando me llamas Bruja", // <-- Cambia este título
    }
    // Cuando subas la carta 9, añade aquí:
    // { id: 9, titulo: "Título de la nueva carta" }
];

// ==========================================
// 1. INICIALIZAR SUPABASE
// ==========================================
const SUPABASE_URL = 'https://wkcmqfkmvzlzkwqxrzzy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY21xZmttdnpsemt3cXhyenp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Mzc0MTUsImV4cCI6MjEwMTQxMzQxNX0.GAhAUJqOhRvt-bXk43weGi1yA8ZP2kLy7VY00Uw9miI';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let cartaActualId = null;

// ==========================================
// 2. VALIDAR ACCESO
// ==========================================
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

// ==========================================
// 3. NAVEGACIÓN ENTRE SECCIONES
// ==========================================
function verSeccion(id) {
    const secciones = document.querySelectorAll('.pantalla');
    secciones.forEach(s => s.style.display = 'none');

    const seccion = document.getElementById(id);
    if (seccion) {
        seccion.style.display = 'block';

        if (id === 'planes') {
            cargarPlanes();
        }

        const url = new URL(window.location.href);
        url.searchParams.delete('dia');
        url.searchParams.set('seccion', id);
        window.history.pushState({ seccion: id }, '', url.href);
    }
}

// ==========================================
// 4. CARGA PRINCIPAL
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem("acceso") === "concedido") {
        const login = document.getElementById("pantalla-login");
        if (login) login.style.display = "none";
    }

    generarIndice();

    const urlParams = new URLSearchParams(window.location.search);
    const diaEnUrl = urlParams.get('dia');
    if (diaEnUrl) {
        document.getElementById('inicio').style.display = 'none';
        mostrarCarta(diaEnUrl);
    }

    const inputBusqueda = document.getElementById('input-busqueda');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') buscarCarta();
        });
    }
});

// ==========================================
// 5. GENERAR ÍNDICE DE CARTAS (DE LA 1 EN ADELANTE)
// ==========================================
function generarIndice() {
    const contenedor = document.getElementById('contenedor-lineas');
    if (!contenedor) return;
    contenedor.innerHTML = "";

    // Ordenamos de más antigua (1 arriba del todo) a más reciente (abajo)
    const cartasOrdenadas = [...CARTAS_PUBLICADAS].sort((a, b) => a.id - b.id);

    cartasOrdenadas.forEach((carta, index) => {
        const linea = document.createElement('div');
        linea.className = 'linea-carta desbloqueada';
        // El destello ✨ aparece en la última carta subida
        const etiquetaNueva = index === cartasOrdenadas.length - 1 ? ' ✨' : '';
        linea.innerHTML = `<span>💌 ${escapeHTML(carta.titulo)}${etiquetaNueva}</span>`;
        linea.onclick = () => mostrarCarta(carta.id);
        contenedor.appendChild(linea);
    });
}

// ==========================================
// 6. MOSTRAR CARTA
// ==========================================
async function mostrarCarta(id) {
    const diaNum = parseInt(id, 10);
    const cartaInfo = CARTAS_PUBLICADAS.find(c => c.id === diaNum);

    if (!cartaInfo) {
        alert("Esta carta no existe todavía.");
        verSeccion('cartas');
        return;
    }

    cartaActualId = diaNum;

    document.querySelectorAll('.pantalla').forEach(s => s.style.display = 'none');
    const seccionLectura = document.getElementById('lectura');
    if (seccionLectura) seccionLectura.style.display = 'block';

    const url = new URL(window.location.href);
    url.searchParams.delete('seccion');
    url.searchParams.set('dia', diaNum);
    window.history.pushState({ id: diaNum }, '', url.href);

    // Mostramos el título personalizado en lugar de "Carta X"
    document.getElementById('titulo-carta').innerText = cartaInfo.titulo;
    const texto = document.getElementById('texto-carta');
    texto.innerText = "Abriendo el sobre... 💌";

    cargarComentarios(diaNum);

    try {
        const respuesta = await fetch(`cartas/${diaNum}.txt`);
        if (!respuesta.ok) throw new Error("Archivo no encontrado");
        const contenido = await respuesta.text();

        texto.innerHTML = "";

        // 1. FOTO ASOCIADA
        if (cartaInfo.foto) {
            const contenedorFoto = document.createElement('div');
            contenedorFoto.className = 'bloque-foto-carta';
            contenedorFoto.innerHTML = `
                <img src="${cartaInfo.foto}" alt="${escapeHTML(cartaInfo.titulo)}" class="foto-carta-clickable" onclick="verSeccion('imagenes')">
            `;
            texto.appendChild(contenedorFoto);
        }

        // 2. CANCIÓN DEDICADA
        if (cartaInfo.cancion) {
            const info = cartaInfo.cancion;
            const tarjetaCancion = document.createElement('div');
            tarjetaCancion.className = 'tarjeta-cancion-reproductor';
            tarjetaCancion.innerHTML = `
                <div class="cabecera-cancion-linea">
                    <div class="info-cancion-top">
                        <strong>${escapeHTML(info.titulo)}</strong>
                        <p>${escapeHTML(info.artista)}</p>
                    </div>
                    <button onclick="verSeccion('musica')" class="btn-ir-seccion">🎶</button>
                </div>
                <audio controls src="${info.archivoAudio}" class="reproductor-cancion-carta"></audio>
            `;
            texto.appendChild(tarjetaCancion);
        }

        // 3. TEXTO DE LA CARTA (2 COLUMNAS + OPINIÓN)
        const partes = contenido.split('---');

        if (partes.length >= 2) {
            const contenedorColumnas = document.createElement('div');
            contenedorColumnas.className = 'contenedor-dos-columnas';

            contenedorColumnas.innerHTML = `
                <div class="columna-original">${partes[0].trim()}</div>
                <div class="columna-traduccion">${partes[1].trim()}</div>
            `;
            texto.appendChild(contenedorColumnas);

            if (partes[2]) {
                const opinionCarta = document.createElement('div');
                opinionCarta.className = 'texto-opinion-carta';
                opinionCarta.innerText = partes[2].trim();
                texto.appendChild(opinionCarta);
            }
        } else {
            const parrafoTexto = document.createElement('p');
            parrafoTexto.innerText = contenido;
            texto.appendChild(parrafoTexto);
        }

    } catch (error) {
        texto.innerText = `No se ha podido cargar el contenido de esta carta (${diaNum}.txt). ❤️`;
    }
}

// ==========================================
// 7. NOTIFICAR POR CORREO AL SUBIR NUEVA CARTA (EmailJS)
// ==========================================
function notificarNuevaCarta() {
    if (!cartaActualId) return;
    const cartaInfo = CARTAS_PUBLICADAS.find(c => c.id === cartaActualId);
    if (!cartaInfo) return;

    if (!confirm(`¿Enviar correo avisando de la carta "${cartaInfo.titulo}"?`)) return;

    const enlaceCarta = `${window.location.origin}${window.location.pathname}?dia=${cartaInfo.id}`;

    // Rellena estos 3 datos desde tu cuenta gratuita de emailjs.com:
    const SERVICE_ID = 'TU_SERVICE_ID';
    const TEMPLATE_ID = 'TU_TEMPLATE_ID';
    const PUBLIC_KEY = 'TU_PUBLIC_KEY';

    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        titulo_carta: cartaInfo.titulo,
        enlace_carta: enlaceCarta
    }, PUBLIC_KEY)
    .then(() => {
        alert("💌 ¡Aviso enviado por correo!");
    })
    .catch((err) => {
        console.error(err);
        alert("Error al enviar el correo. Revisa la configuración de EmailJS.");
    });
}

// ==========================================
// 8. COMENTARIOS (SUPABASE)
// ==========================================
async function cargarComentarios(diaId) {
    const contenedor = document.getElementById('lista-comentarios');
    if (!contenedor) return;
    contenedor.innerHTML = "<p style='color: #888; font-size: 0.85rem;'>Cargando comentarios...</p>";

    const { data: comentarios, error } = await supabaseClient
        .from('comentarios')
        .select('*')
        .eq('dia_id', diaId)
        .order('created_at', { ascending: true });

    if (error) {
        contenedor.innerHTML = "<p style='color: #888;'>Error al cargar los comentarios.</p>";
        return;
    }

    if (!comentarios || comentarios.length === 0) {
        contenedor.innerHTML = "<p style='color: #888; font-size: 0.85rem; font-style: italic;'>Aún no hay ningún comentario en esta carta. ¡Sé el primero en escribir uno!</p>";
        return;
    }

    contenedor.innerHTML = comentarios.map(c => {
        const fecha = new Date(c.created_at).toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        return `
            <div class="comentario-item">
                <span class="comentario-fecha">🗓️ ${fecha}</span>
                <p class="comentario-texto">${escapeHTML(c.texto)}</p>
            </div>
        `;
    }).join('');
}

async function enviarComentario() {
    const textarea = document.getElementById('texto-comentario');
    const estado = document.getElementById('estado-envio');
    const btn = document.getElementById('btn-enviar-comentario');
    const texto = textarea.value.trim();

    if (!texto || !cartaActualId) return;

    btn.disabled = true;
    btn.innerText = "Publicando... 💌";

    const { error } = await supabaseClient
        .from('comentarios')
        .insert([{ dia_id: cartaActualId, texto: texto }]);

    if (!error) {
        textarea.value = '';
        estado.style.display = 'block';
        estado.innerText = '¡Comentario guardado! ❤️';
        setTimeout(() => { estado.style.display = 'none'; }, 3000);
        cargarComentarios(cartaActualId);
    } else {
        alert('Ocurrió un problema al guardar el comentario.');
    }

    btn.disabled = false;
    btn.innerText = "Publicar comentario ❤️";
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// ==========================================
// 9. PLANES JUNTOS (SUPABASE)
// ==========================================
async function cargarPlanes() {
    const contenedor = document.getElementById('contenedor-planes');
    if (!contenedor) return;

    const { data: planes, error } = await supabaseClient
        .from('planes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        contenedor.innerHTML = "<p style='color: #888;'>Error al cargar los planes.</p>";
        return;
    }

    if (!planes || planes.length === 0) {
        contenedor.innerHTML = "<p style='color: #888; text-align: center; font-style: italic;'>Aún no tenéis planes en la lista. ¡Añadid el primero!</p>";
        return;
    }

    contenedor.innerHTML = planes.map(p => `
        <div class="item-plan ${p.realizado ? 'completado' : ''}">
            <div class="info-plan" onclick="comprobarPlan(${p.id}, ${!p.realizado})">
                <span class="checkbox-plan">${p.realizado ? '✅' : '⚪'}</span>
                <span class="texto-plan">${escapeHTML(p.titulo)}</span>
            </div>
            <button class="btn-eliminar-plan" onclick="eliminarPlan(${p.id})" title="Eliminar plan">🗑️</button>
        </div>
    `).join('');
}

async function agregarPlan() {
    const input = document.getElementById('input-nuevo-plan');
    const titulo = input.value.trim();
    if (!titulo) return;

    const { error } = await supabaseClient
        .from('planes')
        .insert([{ titulo: titulo }]);

    if (!error) {
        input.value = '';
        cargarPlanes();
    } else {
        alert('Hubo un error al guardar el plan.');
    }
}

async function comprobarPlan(id, estadoActual) {
    const { error } = await supabaseClient
        .from('planes')
        .update({ realizado: estadoActual })
        .eq('id', id);

    if (!error) cargarPlanes();
}

async function eliminarPlan(id) {
    if (!confirm("¿Seguro que quieres borrar este plan?")) return;

    const { error } = await supabaseClient
        .from('planes')
        .delete()
        .eq('id', id);

    if (!error) cargarPlanes();
}

// ==========================================
// 10. BUSCADOR POR TÍTULO O NÚMERO DE CARTA
// ==========================================
function buscarCarta() {
    const input = document.getElementById('input-busqueda');
    if (!input) return;

    const consulta = input.value.trim().toLowerCase();
    if (!consulta) return;

    const encontrada = CARTAS_PUBLICADAS.find(c =>
        c.id.toString() === consulta || c.titulo.toLowerCase().includes(consulta)
    );

    if (!encontrada) {
        alert("No se ha encontrado ninguna carta con ese nombre o número.");
        return;
    }

    document.getElementById('inicio').style.display = 'none';
    mostrarCarta(encontrada.id);
    input.value = '';
}

// ==========================================
// 11. ABRIR CARTA DESDE GALERÍA
// ==========================================
function abrirCartaDesdeImagen(diaNum) {
    mostrarCarta(diaNum);
}