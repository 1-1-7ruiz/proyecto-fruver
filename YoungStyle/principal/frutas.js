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
const headerPrecio = document.querySelector('header .precio');


const backendUrl = "http://127.0.0.1:8000";

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
actualizarCarritoUI();

function toggleExpandirCarrito() {
        const carrito = document.querySelector('#carrito_v .ventana-contenido');
        carrito.classList.toggle('expandido');
    }


document.querySelector('#find').addEventListener('input', function () {
    const filtro = this.value.toLowerCase();
    const contenedor = document.getElementById('contenedor-frutas');

    // Seleccionamos todas las cards
    const cards = Array.from(document.querySelectorAll('#contenedor-frutas .card-wrapper'));

    cards.forEach(card => {
        const nombre = card.querySelector('.user-name').textContent.toLowerCase();
        if (nombre.includes(filtro)) {
            card.style.display = ''; 
            // mover coincidencia al inicio
            contenedor.prepend(card);
        } else {
            card.style.display = 'none';
        }
    });
});

// ===================== FUNCIONES DE MODALES =====================
function abrirModal(modal) {
    modal.style.display = 'block';
}

function cerrarModal(modal) {
    modal.style.display = 'none';
}

// ===================== FUNCIONES DE CARRITO =====================
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

        // Botón restar
        prodDiv.querySelector('.btn-restar').addEventListener('click', () => {
            if (item.cantidad > 1) item.cantidad--;
            else carrito = carrito.filter(ci => ci.nombre !== item.nombre);
            actualizarCarritoUI();
        });

        // Botón sumar
        prodDiv.querySelector('.btn-sumar').addEventListener('click', () => {
            item.cantidad++;
            actualizarCarritoUI();
        });

        // Botón eliminar
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

// ===================== EVENTOS DE MODALES =====================
if (usuarioBtn) {
    usuarioBtn.addEventListener('click', e => {
        e.preventDefault();
        abrirModal(usuarioModal);
    });
}

if (cerrarUsuario) {
    cerrarUsuario.addEventListener('click', () => cerrarModal(usuarioModal));
}

if (carritoBtn) {
    carritoBtn.addEventListener('click', e => {
        e.preventDefault();
        abrirModal(carritoModal);
        actualizarCarritoUI();
    });
}

if (cerrarCarrito) {
    cerrarCarrito.addEventListener('click', () => cerrarModal(carritoModal));
}

// ===================== EVENTOS GLOBALES =====================
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

// ===================== BOTÓN VACIAR CARRITO =====================
const btnVaciar = document.createElement('button');
btnVaciar.textContent = 'Vaciar carrito';
btnVaciar.className = 'btn-vaciar';
carritoTotalDiv.appendChild(btnVaciar);
btnVaciar.addEventListener('click', () => {
    carrito = [];
    actualizarCarritoUI();
});

// ===================== EVENTOS AL CARGAR DOM =====================
document.addEventListener('DOMContentLoaded', function () {
    const buscadorBtn = document.getElementById('btn_buscar');
    const inputBusqueda = document.getElementById('input_busqueda');

    if (buscadorBtn) {
        buscadorBtn.addEventListener('click', () => {
            inputBusqueda.classList.toggle('visible');
        });
    }

    const botonCerrar = document.getElementById("cerrar_sesion");
    if (botonCerrar) {
        botonCerrar.addEventListener("click", function () {
            localStorage.removeItem("logueado");
            location.reload();
        });
    }

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

    // Cargar productos (frutas)
    fetch('http://127.0.0.1:8000/productos/productos/frutas')
        .then(response => {
            if (!response.ok) throw new Error('Respuesta del servidor no fue OK');
            return response.json();
        })
        .then(data => mostrarFrutas(data))
        .catch(error => console.error('Error al cargar los productos', error));

    // ===================== RENDERIZAR FRUTAS =====================
    function mostrarFrutas(data) {
    const contenedor = document.getElementById('contenedor-frutas');
    contenedor.innerHTML = '';

    data.forEach(fruta => {
        const card = document.createElement('div');
        card.className = 'card-wrapper';
        card.dataset.id = fruta.id; // 👈 guardamos el id en el dataset
        card.innerHTML = `
            <ul class="card-list">
                <li class="card-item">
                    <div class="product-img"><img src="${fruta.foto}" alt="${fruta.nombre}" class="card-image"></div>
                    <h2 class="user-name">${fruta.nombre}</h2>
                    <div class="precio">
                        <p>$<span class="precio-producto">${fruta.precio}</span></p>
                    </div>
                    <div class="contador-wrapper">
                        <button class="card-button material-symbols-outlined btn-restar">arrow_back</button>
                        <span class="contador">0</span>
                        <button class="card-button material-symbols-outlined btn-sumar">arrow_forward</button>
                    </div>
                    <div class="agregar-wrapper">
                        <button class="message-button">Agregar</button>
                    </div>
                </li>
            </ul>
        `;
        contenedor.appendChild(card);

        const btnSumar = card.querySelector('.btn-sumar');
        const btnRestar = card.querySelector('.btn-restar');
        const btnAgregar = card.querySelector('.message-button');

        btnSumar.addEventListener('click', () => {
            const contador = card.querySelector('.contador');
            contador.textContent = parseInt(contador.textContent) + 1;
        });

        btnRestar.addEventListener('click', () => {
            const contador = card.querySelector('.contador');
            const valor = parseInt(contador.textContent);
            if (valor > 0) contador.textContent = valor - 1;
        });

        btnAgregar.addEventListener('click', () => {
            const id = card.dataset.id; // 👈 recuperamos el id
            const nombre = card.querySelector('.user-name').innerText;
            const precio = parseFloat(card.querySelector('.precio span').innerText.replace(/\D/g, ''));
            const cantidad = parseInt(card.querySelector('.contador').innerText);
            const imgSrc = card.querySelector('.product-img img').src;

            if (cantidad === 0) return;

            const existente = carrito.find(item => item.id === id); 
            if (existente) {
                existente.cantidad += cantidad;
            } else {
                carrito.push({ id, nombre, precio, cantidad, imgSrc }); 
            }

            card.querySelector('.contador').textContent = '0';
            actualizarCarritoUI();
        });
    });
}

});