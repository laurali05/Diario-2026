// ==========================================
// 0. CONFIGURA AQUÍ TUS CARTAS PUBLICADAS
// ==========================================
// Añade aquí cada carta que tengas subida en la carpeta /cartas/
// Se mostrarán automáticamente ordenadas de la 1 hacia abajo.
const CARTAS_PUBLICADAS = [
    {
        id: 1,
        titulo: "Feliz 4º aniversario", // <-- Cambia este título
        foto: "imagenes/nosotros.jpeg"
    },
    {
        id: 2,
        titulo: "Tú sonrisa" // <-- Cambia este título
    },
    {
        id: 3,
        titulo: "Nuestro graduación", // <-- Cambia este título
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
const FECHA_PROXIMO_ENCUENTRO = '2026-12-02T21:30:00'; // <-- Cambia aquí la fecha y hora

// ==========================================
// 1. CONFIGURACIÓN DE SUPABASE Y EMAILJS
// ==========================================
const SUPABASE_URL = 'https://wkcmqfkmvzlzkwqxrzzy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY21xZmttdnpsemt3cXhyenp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Mzc0MTUsImV4cCI6MjEwMTQxMzQxNX0.GAhAUJqOhRvt-bXk43weGi1yA8ZP2kLy7VY00Uw9miI';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Correos y claves de EmailJS
const EMAIL_LAURA = 'lopeizquierd@gmail.com';
const EMAIL_DAVID = 'dacfozaneldi@gmail.com'; // <-- Pon aquí el correo de David

const EMAILJS_SERVICE_ID = 'service_88wqugl';     // <-- Pega tu Service ID
const EMAILJS_TEMPLATE_ID = 'template_3xv990b';   // <-- Pega tu Template ID
const EMAILJS_PUBLIC_KEY = '1u8QfnReC5raJEPx_';     // <-- Pega tu Public Key
const URL_PUBLICA_WEB = 'https://laurali05.github.io/Diario-2026/';

let cartaActualId = null;

// ==========================================
// 2. VALIDAR ACCESO Y USUARIO ACTIVO
// ==========================================
function validarAcceso() {
    const claveCorrecta = "030822";
    const inputPass = document.getElementById("password");
    if (!inputPass) return;

    if (inputPass.value === claveCorrecta) {
        document.getElementById("pantalla-login").style.display = "none";
        sessionStorage.setItem("acceso", "concedido");
    } else {
        document.getElementById("mensaje-error").style.display = "block";
    }
}

function guardarUsuarioActivo() {
    const select = document.getElementById('usuario-activo');
    if (select) {
        localStorage.setItem('usuario_diario', select.value);
    }
}

function obtenerUsuarioActivo() {
    return localStorage.getItem('usuario_diario') || 'Laura';
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

        if (id === 'cartas') generarIndice();
        if (id === 'planes') cargarPlanes();
        if (id === 'libros') cargarRecomendaciones('libro');
        if (id === 'peliculas') cargarRecomendaciones('pelicula');

        const url = new URL(window.location.href);
        url.searchParams.delete('dia');
        url.searchParams.set('seccion', id);
        window.history.pushState({ seccion: id }, '', url.href);
    }
}

// ==========================================
// 4. CARGA PRINCIPAL AL ABRIR LA WEB
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // 1. Comprobar sesión iniciada
    if (sessionStorage.getItem("acceso") === "concedido") {
        const login = document.getElementById("pantalla-login");
        if (login) login.style.display = "none";
    }

    // 2. Permitir entrar con Enter en la contraseña
    const inputPassword = document.getElementById("password");
    if (inputPassword) {
        inputPassword.addEventListener("keydown", (e) => {
            if (e.key === "Enter") validarAcceso();
        });
    }

    // 3. Cargar usuario guardado (Laura o David)
    const selectUsuario = document.getElementById('usuario-activo');
    if (selectUsuario) {
        selectUsuario.value = obtenerUsuarioActivo();
    }

    // 4. Generar índice de cartas, buscador y cuenta atrás
    generarIndice();
    inicializarBuscador();
    iniciarCuentaAtras(); // <--- AQUÍ ES DONDE VA

    // 5. Atajos con Enter en Planes, Libros y Películas
    document.getElementById('input-nuevo-plan')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') agregarPlan();
    });
    document.getElementById('input-libro-titulo')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') agregarLibro();
    });
    document.getElementById('input-pelicula-titulo')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') agregarPelicula();
    });

    // 6. Comprobar si venimos desde un enlace directo (?dia=X o ?seccion=Y)
    const urlParams = new URLSearchParams(window.location.search);
    const diaEnUrl = urlParams.get('dia');
    const seccionEnUrl = urlParams.get('seccion');

    if (diaEnUrl) {
        const inicio = document.getElementById('inicio');
        if (inicio) inicio.style.display = 'none';
        mostrarCarta(diaEnUrl);
    } else if (seccionEnUrl) {
        verSeccion(seccionEnUrl);
    }
});

// ==========================================
// 5. GENERAR ÍNDICE DE CARTAS (DE LA 1 EN ADELANTE)
// ==========================================
function generarIndice() {
    const contenedor = document.getElementById('contenedor-lineas');
    if (!contenedor) return;
    contenedor.innerHTML = "";

    // Ordenamos de menor a mayor (Carta 1 arriba del todo)
    const cartasOrdenadas = [...CARTAS_PUBLICADAS].sort((a, b) => a.id - b.id);

    cartasOrdenadas.forEach((carta, index) => {
        const linea = document.createElement('div');
        linea.className = 'linea-carta desbloqueada';
        const etiquetaNueva = index === cartasOrdenadas.length - 1 ? ' ✨' : '';
        linea.innerHTML = `<span>💌 ${escapeHTML(carta.titulo)}${etiquetaNueva}</span>`;
        linea.onclick = () => mostrarCarta(carta.id);
        contenedor.appendChild(linea);
    });
}

// ==========================================
// 6. MOSTRAR CARTA INDIVIDUAL
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

    // Ocultar todas las pantallas y mostrar solo la de lectura
    document.querySelectorAll('.pantalla').forEach(s => s.style.display = 'none');
    const seccionLectura = document.getElementById('lectura');
    if (seccionLectura) seccionLectura.style.display = 'block';

    // Actualizar URL
    const url = new URL(window.location.href);
    url.searchParams.delete('seccion');
    url.searchParams.set('dia', diaNum);
    window.history.pushState({ id: diaNum }, '', url.href);

    document.getElementById('titulo-carta').innerText = cartaInfo.titulo;
    const texto = document.getElementById('texto-carta');
    texto.innerText = "Abriendo el sobre... 💌";

    // Cargar comentarios estilo chat de esta carta
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

        // 3. TEXTO DE LA CARTA (2 COLUMNAS + OPINIÓN PERSONAL)
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
            parrafoTexto.style.whiteSpace = "pre-wrap";
            parrafoTexto.innerText = contenido;
            texto.appendChild(parrafoTexto);
        }

    } catch (error) {
        texto.innerText = `No se ha podido cargar el contenido de esta carta (${diaNum}.txt). ❤️`;
    }
}

// ==========================================
// 7. SISTEMA DE NOTIFICACIONES POR CORREO (EmailJS)
// ==========================================
function enviarAvisoAlOtro(quienEscribe, asuntoNovedad, enlaceDestino) {
    if (typeof emailjs === 'undefined') {
        console.warn("EmailJS no está cargado en index.html");
        return;
    }

    const emailDestino = (quienEscribe === 'Laura') ? EMAIL_DAVID : EMAIL_LAURA;

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        email_destino: emailDestino,
        titulo_carta: asuntoNovedad,
        enlace_carta: enlaceDestino
    }, EMAILJS_PUBLIC_KEY)
    .then(() => console.log("Aviso enviado correctamente a", emailDestino))
    .catch(err => console.error("Error al enviar aviso:", err));
}

// Botón manual para avisar de una carta nueva (siempre de Laura a David)
function notificarNuevaCarta() {
    if (!cartaActualId) return;
    const cartaInfo = CARTAS_PUBLICADAS.find(c => c.id === cartaActualId);
    if (!cartaInfo) return;

    if (!confirm(`¿Enviar correo a David avisando de "${cartaInfo.titulo}"?`)) return;

    const enlaceCarta = `${URL_PUBLICA_WEB}?dia=${cartaInfo.id}`;
    enviarAvisoAlOtro('Laura', `Nueva carta: ${cartaInfo.titulo}`, enlaceCarta);
    alert("💌 ¡Aviso enviado por correo a David!");
}

// ==========================================
// 8. COMENTARIOS ESTILO MENSAJERÍA (SUPABASE)
// ==========================================
async function cargarComentarios(diaId) {
    const contenedor = document.getElementById('lista-comentarios');
    if (!contenedor) return;
    contenedor.innerHTML = "<p style='color: #888; font-size: 0.85rem; text-align:center;'>Cargando mensajes...</p>";

    const { data: comentarios, error } = await supabaseClient
        .from('comentarios')
        .select('*')
        .eq('dia_id', diaId)
        .order('created_at', { ascending: true });

    if (error) {
        contenedor.innerHTML = "<p style='color: #888;'>Error al cargar los mensajes.</p>";
        return;
    }

    if (!comentarios || comentarios.length === 0) {
        contenedor.innerHTML = "<p style='color: #888; font-size: 0.85rem; font-style: italic; text-align:center;'>Aún no hay mensajes en esta carta. ¡Empieza la conversación! 💬</p>";
        return;
    }

    contenedor.innerHTML = comentarios.map(c => {
        const fecha = new Date(c.created_at).toLocaleDateString('es-ES', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });

        let claseBurbuja = 'burbuja-antigua';
        let etiquetaAutor = 'Recuerdo 💌';

        if (c.autor === 'Laura') {
            claseBurbuja = 'burbuja-laura';
            etiquetaAutor = '🌸 Laura';
        } else if (c.autor === 'David') {
            claseBurbuja = 'burbuja-david';
            etiquetaAutor = '💙 David';
        }

        return `
            <div class="burbuja-chat ${claseBurbuja}">
                <div class="cabecera-burbuja">
                    <span>${etiquetaAutor}</span>
                    <span>${fecha}</span>
                </div>
                <p class="texto-burbuja">${escapeHTML(c.texto)}</p>
            </div>
        `;
    }).join('');

    contenedor.scrollTop = contenedor.scrollHeight;
}

async function enviarComentario() {
    const textarea = document.getElementById('texto-comentario');
    const estado = document.getElementById('estado-envio');
    const btn = document.getElementById('btn-enviar-comentario');

    const texto = textarea.value.trim();
    // Si existe un select local en comentarios lo usa; si no, usa el selector global
    const selectLocal = document.getElementById('autor-comentario');
    const autor = selectLocal ? selectLocal.value : obtenerUsuarioActivo();

    if (!texto || !cartaActualId) return;

    btn.disabled = true;
    btn.innerText = "Enviando... 💌";

    const { error } = await supabaseClient
        .from('comentarios')
        .insert([{ dia_id: cartaActualId, texto: texto, autor: autor }]);

    if (!error) {
        textarea.value = '';
        if (estado) {
            estado.style.display = 'block';
            estado.innerText = '¡Mensaje enviado y notificado! ❤️';
            setTimeout(() => { estado.style.display = 'none'; }, 3000);
        }
        cargarComentarios(cartaActualId);

        const cartaInfo = CARTAS_PUBLICADAS.find(c => c.id === cartaActualId);
        const tituloCarta = cartaInfo ? cartaInfo.titulo : `Carta ${cartaActualId}`;
        const enlace = `${URL_PUBLICA_WEB}?dia=${cartaActualId}`;
        enviarAvisoAlOtro(autor, `${autor} ha comentado en "${tituloCarta}"`, enlace);
    } else {
        alert('Ocurrió un problema al guardar el mensaje.');
    }

    btn.disabled = false;
    btn.innerText = "Enviar mensaje 💌";
}

function escapeHTML(str) {
    if (!str) return "";
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
    if (!input) return;
    const titulo = input.value.trim();
    if (!titulo) return;

    const autor = obtenerUsuarioActivo();

    const { error } = await supabaseClient
        .from('planes')
        .insert([{ titulo: titulo }]);

    if (!error) {
        input.value = '';
        cargarPlanes();
        const enlace = `${URL_PUBLICA_WEB}?seccion=planes`;
        enviarAvisoAlOtro(autor, `${autor} ha añadido un plan nuevo: "${titulo}" ✨`, enlace);
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
// 10. BUSCADOR CON AUTOCOMPLETADO TIPO GOOGLE
// ==========================================
let indiceSugerenciaActiva = -1;
let sugerenciasActuales = [];

function normalizarTexto(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function inicializarBuscador() {
    const input = document.getElementById('input-busqueda');
    const lista = document.getElementById('sugerencias-buscador');
    if (!input || !lista) return;

    input.addEventListener('input', () => {
        const consulta = normalizarTexto(input.value.trim());
        indiceSugerenciaActiva = -1;

        if (!consulta) {
            lista.style.display = 'none';
            sugerenciasActuales = [];
            return;
        }

        sugerenciasActuales = CARTAS_PUBLICADAS.filter(c =>
            normalizarTexto(c.titulo).includes(consulta) ||
            c.id.toString() === consulta
        );

        renderizarSugerencias();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            if (sugerenciasActuales.length === 0) return;
            e.preventDefault();
            indiceSugerenciaActiva = (indiceSugerenciaActiva + 1) % sugerenciasActuales.length;
            actualizarSeleccionVisual();
        } else if (e.key === 'ArrowUp') {
            if (sugerenciasActuales.length === 0) return;
            e.preventDefault();
            indiceSugerenciaActiva = (indiceSugerenciaActiva - 1 + sugerenciasActuales.length) % sugerenciasActuales.length;
            actualizarSeleccionVisual();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (indiceSugerenciaActiva >= 0 && sugerenciasActuales[indiceSugerenciaActiva]) {
                seleccionarCartaBuscador(sugerenciasActuales[indiceSugerenciaActiva].id);
            } else if (sugerenciasActuales.length === 1) {
                seleccionarCartaBuscador(sugerenciasActuales[0].id);
            } else if (sugerenciasActuales.length > 1) {
                indiceSugerenciaActiva = 0;
                actualizarSeleccionVisual();
            }
        } else if (e.key === 'Escape') {
            lista.style.display = 'none';
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.contenedor-buscador')) {
            lista.style.display = 'none';
        }
    });
}

function renderizarSugerencias() {
    const lista = document.getElementById('sugerencias-buscador');
    if (!lista) return;

    if (sugerenciasActuales.length === 0) {
        lista.innerHTML = `<div class="item-sugerencia sin-resultados">No hay cartas que coincidan...</div>`;
        lista.style.display = 'block';
        return;
    }

    lista.innerHTML = sugerenciasActuales.map((carta, index) => `
        <div class="item-sugerencia" data-index="${index}" onclick="seleccionarCartaBuscador(${carta.id})">
            <span>💌</span>
            <span>${escapeHTML(carta.titulo)}</span>
        </div>
    `).join('');

    lista.style.display = 'block';
}

function actualizarSeleccionVisual() {
    const items = document.querySelectorAll('#sugerencias-buscador .item-sugerencia');
    items.forEach((item, idx) => {
        item.classList.toggle('activa', idx === indiceSugerenciaActiva);
    });
}

function seleccionarCartaBuscador(id) {
    const input = document.getElementById('input-busqueda');
    const lista = document.getElementById('sugerencias-buscador');
    if (input) input.value = '';
    if (lista) lista.style.display = 'none';

    const inicio = document.getElementById('inicio');
    if (inicio) inicio.style.display = 'none';
    mostrarCarta(id);
}

function buscarCarta() {
    const input = document.getElementById('input-busqueda');
    if (!input) return;

    const consulta = normalizarTexto(input.value.trim());
    if (!consulta) return;

    const coincidencias = CARTAS_PUBLICADAS.filter(c =>
        normalizarTexto(c.titulo).includes(consulta) || c.id.toString() === consulta
    );

    if (coincidencias.length === 0) {
        alert("No se ha encontrado ninguna carta con ese título.");
    } else if (coincidencias.length === 1) {
        seleccionarCartaBuscador(coincidencias[0].id);
    } else {
        sugerenciasActuales = coincidencias;
        indiceSugerenciaActiva = 0;
        renderizarSugerencias();
        actualizarSeleccionVisual();
    }
}

// ==========================================
// 11. ABRIR CARTA DESDE GALERÍA
// ==========================================
function abrirCartaDesdeImagen(diaNum) {
    mostrarCarta(diaNum);
}

// ==========================================
// 12. TABLA DE LIBROS Y PELÍCULAS (SUPABASE)
// ==========================================
async function cargarRecomendaciones(categoria) {
    const contenedorId = categoria === 'libro' ? 'contenedor-libros' : 'contenedor-peliculas';
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    const { data: items, error } = await supabaseClient
        .from('recomendaciones')
        .select('*')
        .eq('categoria', categoria)
        .order('created_at', { ascending: false });

    if (error) {
        contenedor.innerHTML = `<p style='color: #888;'>Error al cargar: ${error.message}</p>`;
        return;
    }

    if (!items || items.length === 0) {
        const textoVacio = categoria === 'libro'
            ? "Aún no habéis añadido ningún libro. ¡Añadid el primero arriba!"
            : "Aún no habéis añadido ninguna película. ¡Añadid la primera arriba!";
        contenedor.innerHTML = `<p style='color: #888; text-align: center; font-style: italic;'>${textoVacio}</p>`;
        return;
    }

    if (categoria === 'libro') {
        contenedor.innerHTML = `
            <div class="contenedor-tabla-scroll">
                <table class="tabla-recomendaciones">
                    <thead>
                        <tr>
                            <th style="text-align:center;">Leído</th>
                            <th>Título</th>
                            <th>Autor</th>
                            <th>Saga</th>
                            <th style="text-align:center;">Borrar</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr class="${item.completado ? 'completado' : ''}">
                                <td class="celda-check" onclick="alternarRecomendacion(${item.id}, ${!item.completado}, 'libro')">
                                    ${item.completado ? '✅' : '⚪'}
                                </td>
                                <td class="celda-texto"><strong>${escapeHTML(item.titulo)}</strong></td>
                                <td class="celda-texto">${item.autor ? escapeHTML(item.autor) : '<span style="color:#bba898;">—</span>'}</td>
                                <td class="celda-texto">${item.saga ? escapeHTML(item.saga) : '<span style="color:#bba898;">—</span>'}</td>
                                <td class="celda-borrar">
                                    <button class="btn-eliminar-plan" onclick="eliminarRecomendacion(${item.id}, 'libro')" title="Eliminar">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else {
        contenedor.innerHTML = `
            <div class="contenedor-tabla-scroll">
                <table class="tabla-recomendaciones">
                    <thead>
                        <tr>
                            <th style="text-align:center;">Vista</th>
                            <th>Título</th>
                            <th>Saga / Plataforma</th>
                            <th style="text-align:center;">Borrar</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr class="${item.completado ? 'completado' : ''}">
                                <td class="celda-check" onclick="alternarRecomendacion(${item.id}, ${!item.completado}, 'pelicula')">
                                    ${item.completado ? '✅' : '⚪'}
                                </td>
                                <td class="celda-texto"><strong>${escapeHTML(item.titulo)}</strong></td>
                                <td class="celda-texto">${item.saga ? escapeHTML(item.saga) : '<span style="color:#bba898;">—</span>'}</td>
                                <td class="celda-borrar">
                                    <button class="btn-eliminar-plan" onclick="eliminarRecomendacion(${item.id}, 'pelicula')" title="Eliminar">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

async function agregarLibro() {
    const inputTitulo = document.getElementById('input-libro-titulo');
    const inputAutor = document.getElementById('input-libro-autor');
    const inputSaga = document.getElementById('input-libro-saga');

    const titulo = inputTitulo.value.trim();
    const autor = inputAutor.value.trim();
    const saga = inputSaga.value.trim();

    if (!titulo) {
        alert("Escribe al menos el título del libro.");
        return;
    }

    const autorUsuario = obtenerUsuarioActivo();

    const { error } = await supabaseClient
        .from('recomendaciones')
        .insert([{ titulo, autor: autor || null, saga: saga || null, categoria: 'libro' }]);

    if (!error) {
        inputTitulo.value = '';
        inputAutor.value = '';
        inputSaga.value = '';
        cargarRecomendaciones('libro');

        const enlace = `${URL_PUBLICA_WEB}?seccion=libros`;
        enviarAvisoAlOtro(autorUsuario, `${autorUsuario} ha recomendado un libro: "${titulo}" 📚`, enlace);
    } else {
        alert('Error al guardar el libro: ' + error.message);
    }
}

async function agregarPelicula() {
    const inputTitulo = document.getElementById('input-pelicula-titulo');
    const inputSaga = document.getElementById('input-pelicula-saga');

    const titulo = inputTitulo.value.trim();
    const saga = inputSaga.value.trim();

    if (!titulo) {
        alert("Escribe al menos el título de la película.");
        return;
    }

    const autorUsuario = obtenerUsuarioActivo();

    const { error } = await supabaseClient
        .from('recomendaciones')
        .insert([{ titulo, saga: saga || null, categoria: 'pelicula' }]);

    if (!error) {
        inputTitulo.value = '';
        inputSaga.value = '';
        cargarRecomendaciones('pelicula');

        const enlace = `${URL_PUBLICA_WEB}?seccion=peliculas`;
        enviarAvisoAlOtro(autorUsuario, `${autorUsuario} ha añadido una película: "${titulo}" 🎬`, enlace);
    } else {
        alert('Error al guardar la película: ' + error.message);
    }
}

async function alternarRecomendacion(id, nuevoEstado, categoria) {
    const { error } = await supabaseClient
        .from('recomendaciones')
        .update({ completado: nuevoEstado })
        .eq('id', id);

    if (!error) cargarRecomendaciones(categoria);
}

async function eliminarRecomendacion(id, categoria) {
    if (!confirm("¿Seguro que quieres borrar este elemento?")) return;

    const { error } = await supabaseClient
        .from('recomendaciones')
        .delete()
        .eq('id', id);

    if (!error) cargarRecomendaciones(categoria);
}

// ==========================================
// 13. CUENTA ATRÁS PARA VERNOS
// ==========================================
function iniciarCuentaAtras() {
    const elDias = document.getElementById('ca-dias');
    const elHoras = document.getElementById('ca-horas');
    const elMinutos = document.getElementById('ca-minutos');
    const elSegundos = document.getElementById('ca-segundos');
    const reloj = document.getElementById('contenedor-reloj');
    const mensaje = document.getElementById('mensaje-encuentro');

    if (!elDias || !reloj) return;

    function actualizarReloj() {
        const objetivo = new Date(FECHA_PROXIMO_ENCUENTRO).getTime();
        const ahora = new Date().getTime();
        const diferencia = objetivo - ahora;

        // Si ya ha llegado o pasado la fecha
        if (diferencia <= 0) {
            reloj.style.display = 'none';
            if (mensaje) mensaje.style.display = 'block';
            return;
        }

        reloj.style.display = 'flex';
        if (mensaje) mensaje.style.display = 'none';

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        elDias.innerText = dias < 10 ? '0' + dias : dias;
        elHoras.innerText = horas < 10 ? '0' + horas : horas;
        elMinutos.innerText = minutos < 10 ? '0' + minutos : minutos;
        elSegundos.innerText = segundos < 10 ? '0' + segundos : segundos;
    }

    actualizarReloj();
    setInterval(actualizarReloj, 1000);
}