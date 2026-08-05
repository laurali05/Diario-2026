// 1. INICIALIZAR SUPABASE (Pon tus datos del Paso 1)
const SUPABASE_URL = 'https://wkcmqfkmvzlzkwqxrzzy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrY21xZmttdnpsemt3cXhyenp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4Mzc0MTUsImV4cCI6MjEwMTQxMzQxNX0.GAhAUJqOhRvt-bXk43weGi1yA8ZP2kLy7VY00Uw9miI';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let cartaActualId = null;

// 2. VALIDAR ACCESO
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

// 3. NAVEGACIÓN ENTRE SECCIONES
function verSeccion(id) {
    // Ocultamos todas las secciones primero
    const secciones = document.querySelectorAll('.pantalla');
    secciones.forEach(s => s.style.display = 'none');

    // Mostramos la que queremos
    const seccion = document.getElementById(id);
    if (seccion) {
        seccion.style.display = 'block';

        if (id === 'planes') {
            cargarPlanes();
        }

        // Actualizar URL para secciones (opcional)
        const url = new URL(window.location.href);
        url.searchParams.set('seccion', id);
        window.history.pushState({ seccion: id }, '', url.href);
    }
}

// 4. CARGA PRINCIPAL (UNIFICADA)
window.addEventListener('DOMContentLoaded', () => {
    // Comprobar acceso
    if (sessionStorage.getItem("acceso") === "concedido") {
        const login = document.getElementById("pantalla-login");
        if (login) login.style.display = "none";
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

// 5. GENERAR ÍNDICE DE CARTAS
function generarIndice() {
    const contenedor = document.getElementById('contenedor-lineas');
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const hoy = calcularDiaActual();
    const totalDeCartas = 365;

    // Detectar si estás trabajando en local (Live Server)
    const esLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

    for (let i = 1; i <= totalDeCartas; i++) {
        const linea = document.createElement('div');

        // Si estás en local O si el día ya ha llegado, se desbloquea
        if (esLocal || i <= hoy) {
            linea.className = 'linea-carta desbloqueada';
            linea.innerHTML = `<span>💌 Carta ${i} ${i === hoy ? '✨ (Hoy)' : ''}</span>`;
            linea.onclick = () => mostrarCarta(i);
        } else {
            linea.className = 'linea-carta bloqueada';
            linea.innerHTML = `<span>🔒 Carta ${i}</span>`;
        }
        contenedor.appendChild(linea);
    }
}

// 6. MOSTRAR CARTA (CON SOPORTE PARA IMÁGENES DENTRO DE LA CARTA)
async function mostrarCarta(id) {
    const diaNum = parseInt(id, 10);
    const hoy = calcularDiaActual();
    
    const esLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

    if (!esLocal && diaNum > hoy) {
        alert(`🔒 La carta del día ${diaNum} aún no está disponible.`);
        verSeccion('cartas');
        return;
    }

    // 1. Ocultar el índice/galería y mostrar lectura
    const seccionCartas = document.getElementById('cartas');
    const seccionLectura = document.getElementById('lectura');
    const seccionImagenes = document.getElementById('imagenes');

    if (seccionCartas) seccionCartas.style.display = 'none';
    if (seccionImagenes) seccionImagenes.style.display = 'none';
    if (seccionLectura) seccionLectura.style.display = 'block';

    // 2. Actualizar la URL
    const url = new URL(window.location.href);
    url.searchParams.set('dia', diaNum);
    window.history.pushState({ id: diaNum }, '', url.href);

    // 3. Preparar el título y el área del pergamino
    document.getElementById('titulo-carta').innerText = "Carta " + diaNum;
    const texto = document.getElementById('texto-carta');
    texto.innerText = "Abriendo el sobre... 💌";

    // 4. Cargar comentarios
    if (typeof cargarComentarios === 'function') {
        cargarComentarios(diaNum);
    }

    // 5. Cargar la carta y buscar si tiene foto asociada
    try {
        const respuesta = await fetch(`cartas/${diaNum}.txt`);
        if (!respuesta.ok) throw new Error("Archivo no encontrado");
        const contenido = await respuesta.text();

        // Limpiamos contenido anterior
        texto.innerHTML = "";

        // Comprobamos si existe una foto para esta carta (ejemplo: imagenes/nosotros.jpeg o imagenes/carta-1.jpg)
        // Mapea aquí el nombre de tus imágenes según el número de carta
        const fotosPorCarta = {
            1: "imagenes/nosotros.jpeg",
            3: "imagenes/graduacion.jpg"
            // Puedes añadir aquí más: 5: "imagenes/viaje.jpg", etc.
        };

        if (fotosPorCarta[diaNum]) {
            const contenedorFoto = document.createElement('div');
            contenedorFoto.className = 'bloque-foto-carta';
            contenedorFoto.innerHTML = `
                <img src="${fotosPorCarta[diaNum]}" alt="Foto Carta ${diaNum}" class="foto-carta-clickable" onclick="verSeccion('imagenes')">
                <p class="pie-foto-carta">✨ Pulsa en la foto para ir a la galería</p>
            `;
            texto.appendChild(contenedorFoto);
        }

        // Añadimos el texto del archivo .txt debajo
        const parrafoTexto = document.createElement('p');
        parrafoTexto.innerText = contenido;
        texto.appendChild(parrafoTexto);

    } catch (error) {
        texto.innerText = `Todavía no hay carta creada para este día (${diaNum}.txt). ❤️`;
    }
}


// 7. ENVÍO DE COMENTARIOS VÍA AJAX (Sin recargar la página)
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

// 8. ENVIAR UN NUEVO COMENTARIO
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

        // Volvemos a cargar la lista para que aparezca al instante
        cargarComentarios(cartaActualId);
    } else {
        alert('Ocurrió un problema al guardar el comentario.');
    }

    btn.disabled = false;
    btn.innerText = "Publicar comentario ❤️";
}

// Función auxiliar de seguridad para evitar inyección de código
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// 9. CALCULAR DÍA
function calcularDiaActual() {
    const fechaInicio = new Date('2026-08-03'); // Asegúrate de que esta fecha es la correcta
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

// 10. CARGAR PLANES DESDE SUPABASE
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

// 11. AÑADIR UN NUEVO PLAN
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

// 12. MARCAR PLAN COMO CUMPLIDO / PENDIENTE
async function comprobarPlan(id, estadoActual) {
    const { error } = await supabaseClient
        .from('planes')
        .update({ realizado: estadoActual })
        .eq('id', id);

    if (!error) {
        cargarPlanes();
    }
}

// 13. ELIMINAR UN PLAN
async function eliminarPlan(id) {
    if (!confirm("¿Seguro que quieres borrar este plan?")) return;

    const { error } = await supabaseClient
        .from('planes')
        .delete()
        .eq('id', id);

    if (!error) {
        cargarPlanes();
    }
}

// 14. BUSCADOR PARA IR A UN DÍA CONCRETO
function buscarCarta() {
    const input = document.getElementById('input-busqueda');
    if (!input) return;

    const numDia = parseInt(input.value, 10);
    const hoy = calcularDiaActual();

    // 1. Validar que se haya introducido un número correcto
    if (isNaN(numDia) || numDia < 1 || numDia > 365) {
        alert("Por favor, introduce un número de día válido (entre 1 y 365).");
        return;
    }

    // 2. Comprobar si la carta está bloqueada (si es un día futuro)
    if (numDia > hoy) {
        alert(`🔒 La carta del día ${numDia} aún no está disponible.`);
        return;
    }

    // 3. Si el día ya ha llegado, ocultamos el inicio y mostramos la carta
    document.getElementById('inicio').style.display = 'none';
    mostrarCarta(numDia);

    // Opcional: limpiar el input del buscador
    input.value = '';
}

window.addEventListener('DOMContentLoaded', () => {
    // Escuchar la tecla Enter en el buscador
    const inputBusqueda = document.getElementById('input-busqueda');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarCarta();
            }
        });
    }
});

// 15. ABRIR CARTA DESDE LA GALERÍA DE IMÁGENES
function abrirCartaDesdeImagen(diaNum) {
    const hoy = calcularDiaActual();
    const esLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

    // Si NO estás en local y la carta es de un día futuro, bloqueamos el clic
    if (!esLocal && diaNum > hoy) {
        alert(`🔒 La foto y la carta del día ${diaNum} aún no están disponibles.`);
        return;
    }

    // Ocultar la galería de imágenes y abrir la carta
    const seccionImagenes = document.getElementById('imagenes');
    if (seccionImagenes) {
        seccionImagenes.style.display = 'none';
    }

    mostrarCarta(diaNum);
}

// 16. BLOQUEAR FOTOS FUTURAS VISUALMENTE
function actualizarGaleriaFotos() {
    const hoy = calcularDiaActual();
    const esLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

    // Seleccionamos todos los bloques de fotos que tengan un número de día
    const fotos = document.querySelectorAll('.foto-interactiva');

    fotos.forEach(bloque => {
        const diaNum = parseInt(bloque.getAttribute('data-dia'), 10);

        // Si NO estamos en local y el día aún no ha llegado
        if (!esLocal && diaNum > hoy) {
            bloque.classList.add('foto-bloqueada');
        } else {
            bloque.classList.remove('foto-bloqueada');
        }
    });
}

// Ejecutar al cargar la página y al cambiar de sección
window.addEventListener('DOMContentLoaded', actualizarGaleriaFotos);