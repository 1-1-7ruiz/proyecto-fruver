// ==================== SELECTORES PARA BÚSQUEDA AVANZADA ====================
const inputNombreCliente = document.querySelector("#nombre_cliente");
const inputIdCliente = document.querySelector("#id_cliente");
const inputFechaVenta = document.querySelector("#fechaVenta");
const inputFechaDesde = document.querySelector("#fechaDesde");
const inputFechaHasta = document.querySelector("#fechaHasta");

const btnBuscarAvanzada = document.getElementById("btnBuscarAvanzada");
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

// ==================== CARGA INICIAL ====================
document.addEventListener('DOMContentLoaded', () => {
    cargarVentas();
});

async function cargarVentas() {
    try {
        const res = await fetch('http://127.0.0.1:8000/ventas/venta');
        if (!res.ok) throw new Error("Error al obtener las ventas");
        const data = await res.json();
        mostrarVentas(data);
    } catch (error) {
        console.error("Error al cargar las ventas", error);
    }
}

// ==================== BÚSQUEDA AVANZADA ====================
async function buscarVentasAvanzada() {
    const nombre = inputNombreCliente?.value.trim() || "";
    const documento = inputIdCliente?.value.trim() || "";
    const fecha = inputFechaVenta?.value.trim() || "";
    const fechaMin = inputFechaDesde?.value.trim() || "";
    const fechaMax = inputFechaHasta?.value.trim() || "";

    const params = new URLSearchParams();
    if (nombre) params.append("cliente", nombre);
    if (documento) params.append("documento", documento);
    if (fecha) params.append("fecha", fecha);     // yyyy-mm-dd
    if (fechaMin) params.append("min", fechaMin); // yyyy-mm-dd
    if (fechaMax) params.append("max", fechaMax); // yyyy-mm-dd

    try {
        const url = params.toString()
            ? `http://127.0.0.1:8000/ventas/venta?${params.toString()}`
            : `http://127.0.0.1:8000/ventas/venta`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al buscar ventas");

        const data = await res.json();
        console.log("Resultados búsqueda:", data);
        mostrarVentas(data);

        document.getElementById("modal-busqueda-avanzada").style.display = "none";
    } catch (error) {
        console.error("Error en búsqueda avanzada:", error);
        alert("No se pudieron obtener los resultados.");
        document.getElementById("modal-busqueda-avanzada").style.display = "none";
    }
}

btnBuscarAvanzada?.addEventListener("click", e => {
    e.preventDefault();
    buscarVentasAvanzada();
});

btnLimpiarFiltros?.addEventListener("click", async () => {
    inputNombreCliente.value = "";
    inputIdCliente.value = "";
    inputFechaVenta.value = "";
    inputFechaDesde.value = "";
    inputFechaHasta.value = "";

    await cargarVentas();
});

// ==================== TABLA DE VENTAS ====================
function formatearFecha(fecha) {
    if (!fecha) return "";
    if (fecha.includes("T")) {
        fecha = fecha.split("T")[0]; // cortar la hora si existe
    }
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}-${mes}-${anio}`;
}

function mostrarVentas(data) {
    const tbody = document.getElementById('ventas-body');
    tbody.innerHTML = '';

    const ventas = data.ventas || data;

    if (!ventas.length) {
        tbody.innerHTML = `<tr><td colspan="6">No se encontraron resultados</td></tr>`;
        return;
    }

    ventas.forEach(venta => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="consecutivo">${venta.id}</td>
            <td>${venta.nombres || venta.usuario || 'N/A'}</td>
            <td>${venta.documento}</td>
            <td>${formatearFecha(venta.fecha_venta)}</td>
            <td>$${parseInt(venta.total)}</td>
        `;
        tbody.appendChild(fila);
    });

    agregarEventosConsecutivos();
}

// ==================== DETALLE DE VENTA ====================
function agregarEventosConsecutivos() {
    document.querySelectorAll('.consecutivo').forEach(el => {
        el.addEventListener('click', () => {
            const ventaId = parseInt(el.textContent.trim());
            document.getElementById('modal-consecutivo').style.display = 'block';
            document.getElementById('btnDescargarPDF').setAttribute('data-id', ventaId);
            cargarDetalleVenta(ventaId);
        });
    });
}

function cargarDetalleVenta(ventaId) {
    fetch(`http://127.0.0.1:8000/ventas/venta/${ventaId}`)
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener detalles');
            return response.json();
        })
        .then(data => mostrarModalDetalle(data.data))
        .catch(error => console.log('Error al cargar detalle de venta', error));
}

function mostrarModalDetalle(data) {
    const cuerpoDetalle = document.getElementById('detalle-body');
    const totalVenta = document.getElementById('total_V');
    const consecutivoTexto = (data.id);

    cuerpoDetalle.innerHTML = '';

    // Mostrar info cliente
    const infoExtra = document.querySelector('#modal-consecutivo .info-extra');
    if (infoExtra) infoExtra.remove(); // limpiar si ya existía

    const modalContenido = document.getElementById('ventana-contenido');
    const extraDiv = document.createElement('div');
    extraDiv.classList.add("info-extra");
    extraDiv.innerHTML = `
        <p><strong>Cliente:</strong> ${data.usuario}</p>
        <p><strong>Dirección:</strong> ${data.direccion}</p>
    `;
    modalContenido.insertBefore(extraDiv, cuerpoDetalle.parentElement);

    // productos
    data.detalles.forEach(item => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${item.producto}</td>
            <td>${item.cantidad}</td>
            <td>${item.precio_unitario}</td>
            <td>${item.sub_total}</td>
        `;
        cuerpoDetalle.appendChild(fila);
    });

    totalVenta.innerHTML = `<strong>Total a pagar:</strong> $${data.total}`;

    const consecutivoParrafo = document.querySelector('#modal-consecutivo p:nth-of-type(1)');
    if (consecutivoParrafo) {
        consecutivoParrafo.innerHTML = `<strong>Consecutivo: </strong>${consecutivoTexto}`;
    }
}

// ==================== CIERRE DE MODALES ====================
document.getElementById('cerrar-modal').addEventListener('click', () => {
    document.getElementById('modal-consecutivo').style.display = 'none';
});
document.querySelector('.cancelar').addEventListener('click', () => {
    document.getElementById('modal-consecutivo').style.display = 'none';
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('modal-calendario');
    if (event.target === modal) modal.style.display = 'none';
});

// ==================== DESCARGA PDF ====================
document.getElementById('btnDescargarPDF').addEventListener('click', () => {
    const ventaId = document.getElementById('btnDescargarPDF').getAttribute('data-id');
    if (ventaId) {
        descargarPDF(ventaId);
    } else {
        alert("No se pudo obtener el ID de la venta.");
    }
});

function descargarPDF(id) {
    const urlPDF = `http://127.0.0.1:8000/ventas/detalle/${id}`;
    axios({
        url: urlPDF,
        method: 'GET',
        responseType: 'blob'
    })
    .then(response => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `detalle_${id}.pdf`;
        link.click();
    })
    .catch(error => {
        console.error("Error al descargar PDF: ", error);
        alert("No se pudo generar el PDF");
    });
}

// ==================== ABRIR Y CERRAR MODAL BÚSQUEDA ====================
document.getElementById('filtrar_v').addEventListener('click', () => {
    document.getElementById('modal-busqueda-avanzada').style.display = 'block';
});

document.getElementById('cerrar-busqueda').addEventListener('click', () => {
    document.getElementById('modal-busqueda-avanzada').style.display = 'none';
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('modal-busqueda-avanzada');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// ==================== CERRAR SESIÓN ====================
document.getElementById("cerrar_sesion").addEventListener("click", cerrar_sesion); 
function cerrar_sesion() {
    localStorage.removeItem("logueado");
    window.location.href = "../principal/principal.html";
}
