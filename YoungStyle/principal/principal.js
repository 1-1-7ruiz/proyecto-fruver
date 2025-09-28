
function toggleExpandirCarrito() {
        const carrito = document.querySelector('#carrito_v .ventana-contenido');
        carrito.classList.toggle('expandido');
    }
document.addEventListener('DOMContentLoaded', function () {
    // ===================== VARIABLES =====================
    const usuarioBtn = document.getElementById('usuario_opciones');
    const usuarioModal = document.getElementById('usuario_v');
    const cerrarUsuario = document.querySelector('.oculto');

    const carritoBtn = document.getElementById('abrir_carrito');
    const carritoModal = document.getElementById('carrito_v');
    const cerrarCarrito = document.querySelector('.oculto-carrito');

    const buscadorBtn = document.getElementById('btn_buscar');
    const inputBusqueda = document.getElementById('input_busqueda');

    const carritoItemsContainer = carritoModal.querySelector('.carrito-items');
    const carritoHeaderCount = carritoModal.querySelector('.carrito-header span');
    const carritoTotalStrong = carritoModal.querySelector('.carrito-total strong');
    const carritoTotalDiv = carritoModal.querySelector('.carrito-total');
    const headerPrecio = document.querySelector('header .precio');

    const backendUrl = "http://127.0.0.1:8000";

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
    const wrapper = boton.closest('.contador-wrapper');
    const contador = wrapper.querySelector('.contador');
    contador.textContent = parseInt(contador.textContent) + 1;
    }

    function restarLocal(boton) {
        const wrapper = boton.closest('.contador-wrapper');
        const contador = wrapper.querySelector('.contador');
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

    // ===================== BUSCADOR =====================
    buscadorBtn?.addEventListener('click', () => {
        inputBusqueda.classList.toggle('visible');
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

        // 👇 aquí obtenemos el id directamente del dataset
        const id = card.dataset.id;

        if (cantidad === 0) return;

        const existente = carrito.find(item => item.id === id);
        if (existente) {
            existente.cantidad += cantidad;
        } else {
            carrito.push({ id, nombre, precio, cantidad, imgSrc });
        }

        card.querySelector('.contador').textContent = '0';
        actualizarCarritoUI();
    }
});


    // ===================== SESIÓN =====================
    const logueado = localStorage.getItem("logueado");
    if (logueado === "true") {
        document.getElementById("usuario_o").style.display = "none";
        document.getElementById("usuario_o2").style.display = "block";
    }

    document.getElementById("cerrar_sesion")?.addEventListener("click", () => {
        localStorage.removeItem("logueado");
        location.reload();
    });

    // ===================== FUNCIÓN PARA INICIALIZAR SWIPER =====================
    function iniciarSwiper(selector, totalSlides) {
        const swiper = new Swiper(selector, {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: "auto",
            loop: true,
            initialSlide: Math.floor(totalSlides / 2), // Empezar desde el medio
            coverflowEffect: {
                rotate: 0,
                stretch: 0,
                depth: 500,
                modifier: 1,
                slideShadows: true
            }
        });
        return swiper;
    }

    // ===================== PLACEHOLDER =====================
    function mostrarPlaceholders(selector, cantidad = 5) {
        const wrapper = document.querySelector(selector + ' .swiper-wrapper');
        wrapper.innerHTML = '';
        for (let i = 0; i < cantidad; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'swiper-slide';
            placeholder.innerHTML = `
                <div style="width:100px;height:100px;background:#ccc;animation:pulse 1.5s infinite;border-radius:8px;"></div>
                <p style="width:60%;height:20px;background:#ccc;animation:pulse 1.5s infinite;border-radius:4px;"></p>
            `;
            wrapper.appendChild(placeholder);
        }
    }

    // Animación para placeholders
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% {opacity: 1;}
            50% {opacity: 0.4;}
            100% {opacity: 1;}
        }
    `;
    document.head.appendChild(style);

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

    // ===================== CARGAR Y RENDERIZAR PRODUCTOS =====================
    function renderProductos(data, selector, imgBase = '') {
        const wrapper = document.querySelector(selector + ' .swiper-wrapper');
        wrapper.innerHTML = '';

        data.forEach(item => {
            const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.dataset.id = item.id;   // 👈 aquí guardamos el id
        slide.innerHTML = `
            <div class="icons">
                
            </div>
            <div class="product-content">
                <div class="product-img">
                    <img src="${imgBase + item.foto}" alt="${item.nombre}">
                    <h3 class="user-name">${item.nombre}</h3>
                </div>
                <div class="product-text">
                    <div class="precio">
                        <p>$<span class="precio_producto">${item.precio}</span></p>
                    </div>
                </div>
                <div class="contador-wrapper">
                    <button class="card-button material-symbols-outlined btn-restar">arrow_back</button>
                    <button class="contador">0</button>
                    <button class="card-button material-symbols-outlined btn-sumar">arrow_forward</button>
                </div>
                <button class="message-button">Agregar</button>
            </div>
        `;

            wrapper.appendChild(slide);
        });

        iniciarSwiper(selector + ' .mySwiper', data.length);
    }

    // ===================== LLAMADAS =====================
    mostrarPlaceholders('#contenedor-frutas');
    mostrarPlaceholders('#contenedor-verduras');
    mostrarPlaceholders('#contenedor-leguminosas');

    fetch(backendUrl + '/productos/productos/frutasP')
        .then(res => res.json())
        .then(data => renderProductos(data, '#contenedor-frutas'))
        .catch(err => console.error('Error frutas', err));

    fetch(backendUrl + '/productos/productos/verdurasP')
        .then(res => res.json())
        .then(data => renderProductos(data, '#contenedor-verduras', backendUrl))
        .catch(err => console.error('Error verduras', err));

    fetch(backendUrl + '/productos/productos/leguminosasP')
        .then(res => res.json())
        .then(data => renderProductos(data, '#contenedor-leguminosas', backendUrl))
        .catch(err => console.error('Error leguminosas', err));

    actualizarCarritoUI();
});

