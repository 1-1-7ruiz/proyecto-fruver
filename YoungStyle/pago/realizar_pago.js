// ===================== VARIABLES Y ELEMENTOS DEL DOM =====================
const usuarioBtn = document.getElementById('usuario_opciones');
const usuarioModal = document.getElementById('usuario_v');
const cerrarUsuario = document.querySelector('.oculto');

const carritoBtn = document.getElementById('abrir_carrito');
const carritoModal = document.getElementById('carrito_v');
const cerrarCarrito = document.querySelector('.oculto-carrito');

const carritoItemsContainer = carritoModal.querySelector('.carrito-items');
const carritoHeaderCount = carritoModal.querySelector('.carrito-header span');
const carritoTotalStrong = carritoModal.querySelector('.carrito-total strong');
const carritoTotalDiv = carritoModal.querySelector('.carrito-total');

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// ===================== FUNCIONES AUXILIARES =====================
function abrirModal(modal) { modal.style.display = "block"; }
function cerrarModal(modal) { modal.style.display = "none"; }

function formatearMoneda(valor) {
    return '$' + valor.toLocaleString('es-CO');
}

function actualizarCarritoUI() {
    carritoItemsContainer.innerHTML = '';
    let totalCantidad = 0;
    let totalPrecio = 0;

    carrito.forEach(item => {
        totalCantidad += item.cantidad;
        totalPrecio += item.precio * item.cantidad;

        const prodDiv = document.createElement('div');
        prodDiv.className = 'producto';
        prodDiv.innerHTML = `
            <img src="${item.imgSrc}" alt="${item.nombre}" width="50" />
            <p>${item.nombre}</p>
            <p>${formatearMoneda(item.precio)}</p>
            <div class="contador-wrapper">
                <button class="btn-restar">-</button>
                <span class="cantidad">${item.cantidad}</span>
                <button class="btn-sumar">+</button>
            </div>
            <button class="btn-eliminar">🗑</button>
        `;

        prodDiv.querySelector('.btn-restar').addEventListener('click', () => {
            if (item.cantidad > 1) item.cantidad--;
            else carrito = carrito.filter(ci => ci.id !== item.id);
            actualizarCarritoUI();
        });

        prodDiv.querySelector('.btn-sumar').addEventListener('click', () => {
            item.cantidad++;
            actualizarCarritoUI();
        });

        prodDiv.querySelector('.btn-eliminar').addEventListener('click', () => {
            carrito = carrito.filter(ci => ci.id !== item.id);
            actualizarCarritoUI();
        });

        carritoItemsContainer.appendChild(prodDiv);
    });

    carritoHeaderCount.textContent = `${totalCantidad} Producto${totalCantidad !== 1 ? 's' : ''}`;
    carritoTotalStrong.textContent = formatearMoneda(totalPrecio);
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

// ===================== INICIALIZACIÓN =====================
document.addEventListener("DOMContentLoaded", function () {
    // Inicializar carrito UI
    actualizarCarritoUI();

    // Eventos de modales usuario/carrito
    if (usuarioBtn) {
        usuarioBtn.addEventListener('click', e => {
            e.preventDefault();
            abrirModal(usuarioModal);
        });
    }
    if (cerrarUsuario) cerrarUsuario.addEventListener('click', () => cerrarModal(usuarioModal));
    if (carritoBtn) {
        carritoBtn.addEventListener('click', e => {
            e.preventDefault();
            abrirModal(carritoModal);
            actualizarCarritoUI();
        });
    }
    if (cerrarCarrito) cerrarCarrito.addEventListener('click', () => cerrarModal(carritoModal));
    window.addEventListener('click', event => {
        if (event.target === usuarioModal) cerrarModal(usuarioModal);
        if (event.target === carritoModal) cerrarModal(carritoModal);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            cerrarModal(usuarioModal);
            cerrarModal(carritoModal);
        }
    });

    // Botón vaciar carrito
    const btnVaciar = document.createElement('button');
    btnVaciar.textContent = 'Vaciar carrito';
    btnVaciar.className = 'btn-vaciar';
    carritoTotalDiv.appendChild(btnVaciar);
    btnVaciar.addEventListener('click', () => {
        carrito = [];
        actualizarCarritoUI();
    });

    // ===================== SELECCIÓN DE MÉTODO DE PAGO =====================
    let contraentrega = document.getElementById('contraentrega');
    let boton = document.getElementById('siguiente');
    let metodoseleccionado = null;

    function seleccionar(metodo, nombreMetodo) {
        contraentrega.classList.remove('seleccionado');
        metodo.classList.add('seleccionado');
        metodoseleccionado = nombreMetodo;
        boton.disabled = false;
        boton.classList.add('activo');
    }
    contraentrega.onclick = () => seleccionar(contraentrega, 'contraentrega');

    // ===================== MODALES DE PAGO =====================
    function cerrarTodosLosModales() {
        document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
    }
    const modalConfirmar = document.getElementById("modal-confirmar");
    const btnConfirmarPedido = document.getElementById("btn-confirmar-pedido");
    const btnCancelarPedido = document.getElementById("btn-cancelar-pedido");
    const closeConfirmar = document.getElementById("close-confirmar");
    const modalContraentrega = document.getElementById("modal-contraentrega");

    boton.onclick = function () {
        if (!boton.disabled && metodoseleccionado === "contraentrega") {
            cerrarTodosLosModales();
            modalConfirmar.style.display = "block";
        }
    };
    btnCancelarPedido.onclick = () => modalConfirmar.style.display = "none";
    closeConfirmar.onclick = () => modalConfirmar.style.display = "none";

    // ===================== MODAL DE ERRORES =====================
    function mostrarError(titulo, mensaje) {
        document.getElementById("modal-error-title").textContent = titulo;
        document.getElementById("modal-error-msg").textContent = mensaje;
        document.getElementById("modal-error").style.display = "block";
    }
    document.getElementById("close-error").onclick = () => {
        document.getElementById("modal-error").style.display = "none";
    };
    document.getElementById("btn-error-ok").onclick = () => {
        document.getElementById("modal-error").style.display = "none";
    };

    // ===================== CONFIRMAR PEDIDO =====================
    btnConfirmarPedido.onclick = function () {
        cerrarTodosLosModales();

        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const token = localStorage.getItem("authToken");
        const documento = localStorage.getItem("documento_usuario");

        if (!token || !documento) {
            mostrarError("Error de sesión", "Debes estar logueado para realizar la compra");
            return;
        }

        if (carrito.length === 0) {
            mostrarError("Carrito vacío", "Debes agregar productos al carrito antes de comprar.");
            return;
        }

        let totalCompra = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
        if (totalCompra < 20000) {
            mostrarError("Compra mínima", "El valor mínimo de compra es $20.000");
            return;
        }

        let detalles = carrito.map(item => ({
            id_producto: item.id,
            cantidad: item.cantidad,
            precio_u: item.precio
        }));

        let data = {
            ventas: [{ documento: documento, metodo_pago: "Contraentrega" }],
            detalles: detalles
        };

        fetch("http://127.0.0.1:8000/ventas/venta", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(response => {
            if (response.estado === "ok") {
                modalContraentrega.style.display = "block";
                localStorage.removeItem("carrito");
            } else {
                mostrarError("Error al registrar la venta", response.mensaje || "Revise los datos enviados");
            }
        })
        .catch(error => {
            console.error("Error en fetch:", error);
            alert("No se pudo conectar con el servidor");
        });
    };

    // ===================== TOTAL DE COMPRA DINÁMICO =====================
    function actualizarTotal() {
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        const totalCompra = document.querySelector(".total-compra");
        if (carrito.length === 0) {
            totalCompra.textContent = "Tu carrito está vacío";
            return;
        }
        let total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
        totalCompra.textContent = `Total compra: $ ${total.toLocaleString("es-CO")}`;
    }
    actualizarTotal();
    window.addEventListener("storage", e => { if (e.key === "carrito") actualizarTotal(); });

    // ===================== BOTONES DE NAVEGACIÓN =====================
    document.getElementById("inicio_contra").addEventListener("click", e => {
        e.preventDefault();
        if (confirm("¿Estás seguro de salir? Se perderán los datos del pedido.")) {
            window.location.href = "../principal/principal.html";
        }
    });
    document.getElementById("sobre_nosotros").addEventListener("click", e => {
        e.preventDefault();
        if (confirm("¿Estás seguro de salir? Se perderán los datos del pedido.")) {
            window.location.href = "../quienes_somos/nuestra_historia.html";
        }
    });

    // ===================== ATRÁS SEGÚN LOGUEO =====================
    const logueado = (localStorage.getItem("logueado") || "").toLowerCase();
    const seccionGestionar = document.getElementById("gestion_pro");
    const btnAtras = document.getElementById("btn_atras");
    if (logueado === "true" && seccionGestionar) seccionGestionar.style.display = "none";
    if (btnAtras) {
        btnAtras.addEventListener("click", () => {
            window.location.href = (logueado === "true") ? "ver_carrito.html" : "gestionar_pedido.html";
        });
    }

    // ===================== SESIÓN USUARIO =====================
    if (logueado === "true") {
        document.getElementById("usuario_o").style.display = "none";
        document.getElementById("usuario_o2").style.display = "block";
    } else {
        document.getElementById("usuario_o").style.display = "block";
        document.getElementById("usuario_o2").style.display = "none";
    }

    document.getElementById("cerrar_sesion")?.addEventListener("click", () => {
        localStorage.removeItem("logueado");
        localStorage.removeItem("authToken");
        localStorage.removeItem("documento_usuario");
        location.reload();
    });

    // ===================== CERRAR MODAL PEDIDO CONFIRMADO =====================
    document.querySelector('#modal-contraentrega .close').addEventListener('click', () => {
        modalContraentrega.style.display = 'none';
    });
});
