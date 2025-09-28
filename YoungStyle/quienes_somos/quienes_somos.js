document.addEventListener('DOMContentLoaded', function () {
    // ===================== VARIABLES =====================
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
    const headerPrecio = document.querySelector('header .precio');

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // ===================== FUNCIONES UTILES =====================
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
                else carrito = carrito.filter(ci => ci.nombre !== item.nombre);
                actualizarCarritoUI();
            });

            prodDiv.querySelector('.btn-sumar').addEventListener('click', () => {
                item.cantidad++;
                actualizarCarritoUI();
            });

            prodDiv.querySelector('.btn-eliminar').addEventListener('click', () => {
                carrito = carrito.filter(ci => ci.nombre !== item.nombre);
                actualizarCarritoUI();
            });

            carritoItemsContainer.appendChild(prodDiv);
        });

        carritoHeaderCount.textContent = `${totalCantidad} Producto${totalCantidad !== 1 ? 's' : ''}`;
        carritoTotalStrong.textContent = formatearMoneda(totalPrecio);
        headerPrecio.textContent = formatearMoneda(totalPrecio);
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    function sumarLocal(boton) {
        const contador = boton.previousElementSibling;
        contador.textContent = parseInt(contador.textContent) + 1;
    }

    function restarLocal(boton) {
        const contador = boton.nextElementSibling;
        const valor = parseInt(contador.textContent);
        if (valor > 0) contador.textContent = valor - 1;
    }

    // ===================== BOTON VACIAR CARRITO =====================
    const btnVaciar = document.createElement('button');
    btnVaciar.textContent = 'Vaciar carrito';
    btnVaciar.className = 'btn-vaciar';
    carritoTotalDiv.appendChild(btnVaciar);
    btnVaciar.addEventListener('click', () => {
        carrito = [];
        actualizarCarritoUI();
    });

    // ===================== MODALES =====================
    usuarioBtn?.addEventListener('click', e => {
        e.preventDefault();
        usuarioModal.style.display = 'block';
    });
    cerrarUsuario?.addEventListener('click', () => usuarioModal.style.display = 'none');

    carritoBtn?.addEventListener('click', e => {
        e.preventDefault();
        carritoModal.style.display = 'block';
        actualizarCarritoUI();
    });
    cerrarCarrito?.addEventListener('click', () => carritoModal.style.display = 'none');

    window.addEventListener('click', event => {
        if (event.target === usuarioModal) usuarioModal.style.display = 'none';
        if (event.target === carritoModal) carritoModal.style.display = 'none';
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            usuarioModal.style.display = 'none';
            carritoModal.style.display = 'none';
        }
    });

    // ===================== SUMAR / RESTAR EN PRODUCTOS =====================
    document.addEventListener('click', e => {
        if (e.target.classList.contains('btn-sumar')) sumarLocal(e.target);
        if (e.target.classList.contains('btn-restar')) restarLocal(e.target);
    });

    // ===================== AGREGAR AL CARRITO =====================
    document.addEventListener('click', e => {
        if (e.target.classList.contains('message-button')) {
            const card = e.target.closest('.swiper-slide');
            const nombre = (card.querySelector('.user-name') || card.querySelector('h3')).innerText;
            const precio = parseFloat(card.querySelector('.precio span').innerText.replace(/\D/g, ''));
            const cantidad = parseInt(card.querySelector('.contador').innerText);
            const imgSrc = card.querySelector('.product-img img').src;

            if (cantidad === 0) return;

            const existente = carrito.find(item => item.nombre === nombre);
            if (existente) {
                existente.cantidad += cantidad;
            } else {
                carrito.push({ nombre, precio, cantidad, imgSrc });
            }

            card.querySelector('.contador').textContent = '0';
            actualizarCarritoUI();
        }
    });

    // ===================== ENVIAR CARRITO AL BACKEND =====================
    window.enviarCarritoAlBackend = function () {
        if (carrito.length === 0) {
            alert("El carrito está vacío. No se puede enviar.");
            return;
        }

        fetch("http://localhost:8000/carrito/carrito/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productos: carrito }),
        })
            .then(response => {
                if (!response.ok) throw new Error("Error en la respuesta del backend");
                return response.json();
            })
            .then(data => {
                console.log("Carrito enviado con éxito:", data);
                window.location.href = "../pago/ver_carrito.html";
            })
            .catch(error => {
                console.error("Error al enviar el carrito:", error);
                alert("Error al enviar el carrito al backend.");
            });
    };

    // ===================== INICIALIZAR =====================
    actualizarCarritoUI();

    // ===================== GESTIÓN DE SESIÓN (mantengo tu lógica previa) =====================
    const logueado = localStorage.getItem("logueado");
    const seccionInvitado = document.getElementById("usuario_o");
    const seccionCliente = document.getElementById("usuario_o2");

    if (seccionCliente) seccionCliente.style.display = "none";

    if (logueado === "true") {
        if (seccionInvitado) seccionInvitado.style.display = "none";
        if (seccionCliente) seccionCliente.style.display = "block";
    }

    const botonCerrar = document.getElementById("cerrar_sesion");
    if (botonCerrar) botonCerrar.addEventListener("click", cerrarSesion);

    const botonIniciarSesion = document.getElementById("iniciar_sesion");
    if (botonIniciarSesion) botonIniciarSesion.addEventListener("click", () => {
        window.location.href = "../sesion/sesion_cliente.html";
    });

    const botonRegistrarse = document.getElementById("registrarse");
    if (botonRegistrarse) botonRegistrarse.addEventListener("click", () => {
        window.location.href = "../sesion/registrarse.html";
    });

    function cerrarSesion() {
        localStorage.removeItem("logueado");
        location.reload();
    }
});
