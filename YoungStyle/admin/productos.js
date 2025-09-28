const BASE_URL = "http://127.0.0.1:8000/productos/productos";
const BASE_URL_IMG = "http://127.0.0.1:8000/media/uploads/productos/";

// Campos del formulario
const nombre = document.getElementById('name');
const precio = document.getElementById('precio');
const cantidad = document.getElementById('cantidad');
const categoria = document.getElementById('categoria');
const codigo = document.getElementById('codigo');
const estado = document.getElementById('estado');
const crearBtn = document.getElementById('crear');
const tablaBody = document.getElementById('tbody_productos');
const previewImg = document.getElementById('previewImg');
const formProducto = document.getElementById('form');

// ===================== MODAL BÚSQUEDA AVANZADA =====================
const modalBusqueda = document.getElementById("busque_avanzada");
const btnAbrirBusqueda = document.getElementById("filtrar_productos");
const btnCerrarBusqueda = modalBusqueda.querySelector(".cerrar");
const btnCancelarBusqueda = modalBusqueda.querySelector(".cancelar");
const btnEliminar = document.getElementById('eliminar');

// Abrir modal búsqueda avanzada
btnAbrirBusqueda?.addEventListener("click", () => modalBusqueda.style.display = "block");
btnCerrarBusqueda?.addEventListener("click", () => modalBusqueda.style.display = "none");
btnCancelarBusqueda?.addEventListener("click", () => modalBusqueda.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === modalBusqueda) modalBusqueda.style.display = "none"; });

let filaEditando = null;

// ==============================
// 🔷 BUSCADOR
// ==============================
document.querySelector('#find').addEventListener('input', function () {
    const filtro = this.value.toLowerCase();
    document.querySelectorAll('#tbody_productos tr').forEach(fila => {
        const coincide = [...fila.querySelectorAll('td')].some(td =>
            td.textContent.toLowerCase().includes(filtro)
        );
        fila.style.display = coincide ? '' : 'none';
    });
});

// ===================== BÚSQUEDA AVANZADA DESDE BACKEND =====================

const inputNombreBusqueda = document.querySelector(".nombre_b");
const selectCategoriaBusqueda = document.getElementById("categoria_busqueda");
const inputPrecioMax = document.getElementById("precio_max");
const inputPrecioMin = document.getElementById("precio_min");
const btnBuscarAvanzada = document.getElementById("btnBuscarAvanzada");
const btnLimpiarFiltros = document.getElementById("limpiar-filtros");

async function buscarProductosAvanzada() {
    const nombreFiltro = inputNombreBusqueda?.value.trim() || "";
    const categoriaFiltro = parseInt(selectCategoriaBusqueda?.value) || 0;
    const precioMax = inputPrecioMax?.value.trim() || "";
    const precioMin = inputPrecioMin?.value.trim() || "";

    const params = new URLSearchParams();
    if (nombreFiltro) params.append("nombre", nombreFiltro);
    if (categoriaFiltro > 0) params.append("categoria", categoriaFiltro);
    if (precioMax) params.append("precio_max", precioMax);
    if (precioMin) params.append("precio_min", precioMin);

    try {
        const url = params.toString() ? `${BASE_URL}?${params.toString()}` : BASE_URL;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al buscar productos");

        const data = await res.json();
        tablaBody.innerHTML = "";
        if (Array.isArray(data) && data.length > 0) {
            data.forEach(producto => agregarProductoTabla(producto, false));
        } else {
            alert("No se encontraron productos con esos filtros. Mostrando todos.");
            await cargarProductos();
        }
        modalBusqueda.style.display = "none";
    } catch (error) {
        console.error("Error en búsqueda avanzada:", error);
        alert("No se pudieron obtener los resultados.");
        await cargarProductos();
        modalBusqueda.style.display = "none";
    }
}

btnBuscarAvanzada?.addEventListener("click", e => { e.preventDefault(); buscarProductosAvanzada(); });
btnLimpiarFiltros?.addEventListener("click", async () => {
    inputNombreBusqueda.value = "";
    selectCategoriaBusqueda.value = "0";
    inputPrecioMax.value = "";
    inputPrecioMin.value = "";
    await cargarProductos();
});


// ===================== FUNCIONES =====================
function mostrarMensaje(mensaje) {
    alert(mensaje);
}

function cerrarFormulario() {
    formProducto.reset();
    document.getElementById("modificar_p").style.display = 'none';
    crearBtn.textContent = 'Crear producto';
    document.getElementById('titulo').textContent = 'Datos del producto';
    previewImg.src = '../Img/papa.jpg';
    filaEditando = null;
}

function obtenerRutaImagen(foto) {
    if (!foto) return '../Img/papa.jpg';
    if (foto.startsWith('http')) return foto;
    if (foto.startsWith('/media/')) return `http://127.0.0.1:8000${foto}`;
    return `http://127.0.0.1:8000/media/productos/${foto}`;
}



function agregarProductoTabla(producto, mostrarAlerta = true) {
    const fila = document.createElement('tr');
    fila.dataset.categoria = producto.categoria || producto.categoria_id || "1";
    fila.dataset.estado = producto.estado || "Activo";

    const rutaImg = obtenerRutaImagen(producto.foto);

    fila.innerHTML = `
        <td class="codigo">${producto.id || producto.codigo || ''}</td>
        <td class="imagen">
            <img src="${rutaImg}" alt="${producto.nombre}" 
                style="width:50px;height:50px;object-fit:cover;margin-right:5px;">
            <span>${producto.nombre}</span>
        </td>
        <td>${producto.precio}</td>
        <td>${producto.stock || producto.cantidad || '0'} </td>
        <td><button class="btn-modificar">Modificar</button></td>
    `;
    tablaBody.appendChild(fila);
    if (mostrarAlerta) alert('Producto agregado correctamente');
}


// ===================== MODAL CREAR / MODIFICAR =====================
document.getElementById('nuevo_producto').addEventListener('click', e => {
    e.preventDefault();
    cerrarFormulario();
    document.getElementById('modificar_p').style.display = 'block';
    btnEliminar.style.display = "none";

    document.querySelector('label[for="codigo"]').style.display = "none";
    codigo.style.display = "none";
});

document.querySelector('#modificar_p .close').addEventListener('click', cerrarFormulario);
document.getElementById('cancelar').addEventListener('click', cerrarFormulario);
window.addEventListener('click', e => { if (e.target === document.getElementById("modificar_p")) cerrarFormulario(); });

// Cambiar imagen en formulario
document.getElementById('imagenProducto').addEventListener('change', function (event) {
    const archivo = event.target.files[0];
    if (archivo && archivo.type.startsWith('image/')) {
        const lector = new FileReader();
        lector.onload = e => { previewImg.src = e.target.result; };
        lector.readAsDataURL(archivo);
    } else {
        previewImg.src = '';
        alert('Por favor selecciona una imagen válida.');
    }
});

// ===================== ENVÍO FORMULARIO =====================
formProducto.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!nombre.value.trim() || !cantidad.value.trim() || !precio.value.trim()) {
        mostrarMensaje("Por favor completa todos los campos requeridos.");
        return;
    }

    const formData = new FormData();
    formData.append('nombre', nombre.value.trim());
    formData.append('stock', cantidad.value.trim());
    formData.append('precio', precio.value.trim());
    formData.append('categoria', parseInt(categoria.value));
    formData.append('estado', estado.value.trim());

    const fileInput = document.getElementById('imagenProducto');
    if (fileInput.files.length > 0) {
        formData.append('foto', fileInput.files[0]);
    } else if (!filaEditando) {
        alert("Debes seleccionar una imagen para crear un producto nuevo.");
        return;
    }

    try {
        const url = filaEditando ? `${BASE_URL}/${codigo.value.trim()}` : BASE_URL;
        const metodo = filaEditando ? "PUT" : "POST";
        const res = await fetch(url, { method: metodo, body: formData });
        const resJson = await res.json();

        if (!res.ok) {
            mostrarMensaje(resJson.mensaje || "Error al guardar el producto.");
            return;
        }

        alert("Producto guardado correctamente");

        //  Recargar lista completa en lugar de insertar manualmente
        await cargarProductos();

        cerrarFormulario();

    } catch (error) {
        console.error("Error capturado en el fetch", error);
        mostrarMensaje("Error de red o en la solicitud");
    }
});

// ===================== MODIFICAR PRODUCTO =====================
tablaBody.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-modificar')) {
        const fila = e.target.closest('tr');
        const celdas = fila.querySelectorAll('td');

        codigo.value = celdas[0].textContent.trim();
        nombre.value = celdas[1].querySelector('span')?.textContent || '';
        precio.value = celdas[2].textContent.trim();
        cantidad.value = celdas[3].textContent.trim();
        categoria.value = fila.dataset.categoria || "1";
        estado.value = fila.dataset.estado || "Activo"; 

        const img = celdas[1].querySelector('img');
        previewImg.src = img ? img.src : '../Img/papa.jpg';

        filaEditando = fila;
        crearBtn.textContent = 'Guardar cambios';
        document.getElementById('titulo').textContent = 'Modificar producto';
        document.getElementById('modificar_p').style.display = 'block';

        btnEliminar.style.display = "inline-block";

        document.querySelector('label[for="codigo"]').style.display = "block";
        codigo.style.display = "block";
    }
    
});




// Eliminar producto
btnEliminar.addEventListener('click', async () => {
    if (!filaEditando) return; // Solo eliminar si estamos editando

    const codigoProducto = codigo.value.trim();
    if (!codigoProducto) return;

    const confirmar = confirm("¿Seguro que quieres eliminar este producto?");
    if (!confirmar) return;

    try {
        const res = await fetch(`${BASE_URL}/${codigoProducto}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar el producto");

        // Quitar la fila de la tabla
        filaEditando.remove();
        cerrarFormulario();
        alert("Producto eliminado correctamente");
    } catch (error) {
        console.error("Error eliminando producto:", error);
        alert("No se pudo eliminar el producto");
    }
});


// ===================== CARGAR PRODUCTOS =====================
async function cargarProductos() {
    try {
        const res = await fetch(BASE_URL);
        if (!res.ok) throw new Error("Respuesta no OK al cargar productos");

        const data = await res.json();
        tablaBody.innerHTML = "";
        data.forEach(producto => agregarProductoTabla(producto, false));
    } catch (error) {
        console.error("Error al cargar productos:", error);
        // No mostramos alert aquí para no molestar al usuario si es un fallo momentáneo
    }
}

function cerrar_sesion() {
    // Eliminar el estado de logueo
    localStorage.removeItem("logueado");

    
    window.location.href = "../principal/principal.html";
}
document.addEventListener("DOMContentLoaded", () => {
    const btnCerrar = document.getElementById("cerrar_sesion");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", cerrar_sesion);
    }
});




cargarProductos();