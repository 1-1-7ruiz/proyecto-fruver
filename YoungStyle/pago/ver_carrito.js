const usuarioBtn = document.getElementById('usuario_opciones');
const usuarioModal = document.getElementById('usuario_v');
const cerrarUsuario = document.querySelector('.oculto');






function actualizarCarritoLS(nombre, nuevaCantidad) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito = carrito.map(p => {
    if (p.nombre === nombre) {
      p.cantidad = nuevaCantidad;
    }
    return p;
  });
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function sumar(boton) {
  const contador = boton.previousElementSibling;
  const nuevoValor = parseInt(contador.textContent) + 1;
  contador.textContent = nuevoValor;

  const nombre = boton.closest(".producto").querySelector(".col-nombre span").textContent;
  actualizarCarritoLS(nombre, nuevoValor);

  actualizarTotal();
}

function restar(boton) {
  const contador = boton.nextElementSibling;
  let valor = parseInt(contador.textContent);

  if (valor > 1) {
    // 🔽 Si es mayor que 1, solo restamos
    const nuevoValor = valor - 1;
    contador.textContent = nuevoValor;

    const nombre = boton.closest(".producto").querySelector(".col-nombre span").textContent;
    actualizarCarritoLS(nombre, nuevoValor);
  } else {
    // 🔽 Si llega a 0, eliminamos el producto del DOM y del localStorage
    const productoDiv = boton.closest(".producto");
    const nombre = productoDiv.querySelector(".col-nombre span").textContent;

    productoDiv.remove();

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito = carrito.filter(p => p.nombre !== nombre);
    localStorage.setItem("carrito", JSON.stringify(carrito));

    // Si el carrito quedó vacío, recargo para mostrar el mensaje "carrito vacío"
    if (carrito.length === 0) location.reload();
  }

  actualizarTotal();
}

function actualizarTotal() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let total = 0;

  carrito.forEach(producto => {
    total += producto.precio * producto.cantidad;
  });

  // Mostrar el total en el DOM
  const totalBox = document.querySelector(".total-box");
  if (totalBox) {
    totalBox.textContent = "Total: $" + total.toLocaleString("es-CO");
  }
}


// Eliminar producto y actualizar total
document.addEventListener("DOMContentLoaded", function () {
    const botonesEliminar = document.querySelectorAll(".eliminar-btn");

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", function () {
            const producto = boton.closest(".producto");
            if (producto) {
                producto.remove();
                actualizarTotal();
            }
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
  const logueado = localStorage.getItem("logueado");

  const pasoGestionar = document.getElementById("gestion_pro");
  const btnGestionar = document.getElementById("gestion_pe");

  //  Ocultar visualmente "Gestionar pedido" del navegador
  if (logueado === "true" && pasoGestionar) {
    pasoGestionar.style.display = "none";
  }

  // ir a paso correcto según login
  if (btnGestionar) {
    btnGestionar.addEventListener("click", function () {
      const carrito=JSON.parse(localStorage.getItem("carrito")) || [];

      if (carrito.length===0){
        alert("Tu carrito esta vacio,agrega productos antes para continuar")
        return;
      }
      if (logueado === "true") {
        window.location.href = "realizar_pago.html";
        
      } else {
        window.location.href = "gestionar_pedido.html";
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const carritoGuardado = localStorage.getItem("carrito");
  const contenedor = document.getElementById("contenedor2");
  const encabezado = document.querySelector(".encabezado2");
  const total= document.querySelector(".total-box");

  if (!carritoGuardado || JSON.parse(carritoGuardado).length === 0) {
    encabezado.style.display = "none";
    total.style.display = "none";

    const mensaje = document.createElement("div");
    mensaje.textContent = "Tu carrito de compras esta vacio";
    mensaje.style.textAlign = "center";
    mensaje.style.fontSize = "22px";
    mensaje.style.padding = "30px";
    mensaje.style.color = "#666";
    contenedor.appendChild(mensaje);
    return;
  }

  const productos = JSON.parse(carritoGuardado);

  productos.forEach(producto => {
    const productoHTML = document.createElement("div");
    productoHTML.classList.add("producto");

    productoHTML.innerHTML = `
      <div class="col-nombre">
        <img src="${producto.imgSrc}" alt="imagen${producto.nombre}" width="80" height="80">
        <span>${producto.nombre}</span>
      </div>
      <div class="col-precio">$${producto.precio.toLocaleString("es-CO")}</div>
      <div class="contador-wrapper">
        <button onclick="restar(this)" class="btn-restar card-button material-symbols-outlined">arrow_back</button>
        <button class="contador">${producto.cantidad}</button>
        <button onclick="sumar(this)" class="btn-sumar card-button material-symbols-outlined">arrow_forward</button>
      </div>
      <div class="col-modificar eliminar-btn">Eliminar<br>producto</div>
    `;

    // Insertar antes del total
    contenedor.insertBefore(productoHTML, total);
  });

  actualizarTotal();

  // Activar botones eliminar
  document.querySelectorAll(".eliminar-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const divProducto = btn.closest(".producto");
      const nombre = divProducto.querySelector(".col-nombre span").textContent;

      divProducto.remove();

      // Actualizar localStorage
      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      carrito = carrito.filter(p => p.nombre !== nombre);
      localStorage.setItem("carrito", JSON.stringify(carrito));

      actualizarTotal();
      
      if (carrito.length === 0) location.reload();
    });

  });

  
});


// ===================== EVENTOS DE MODALES =====================
if (usuarioBtn) {
    usuarioBtn.addEventListener('click', e => {
        e.preventDefault();
        abrirModal(usuarioModal);
    });
}
if (cerrarUsuario) cerrarUsuario.addEventListener('click', () => cerrarModal(usuarioModal));
function abrirModal(modal) {
    if (modal) modal.style.display = 'block';
}

window.addEventListener('click', event => {
    if (event.target === usuarioModal) cerrarModal(usuarioModal);
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        cerrarModal(usuarioModal);
    }
});

cerrarModal = (modal) => {
    if (modal) modal.style.display = 'none';
};

// ===================== SESION USUARIO =====================
document.addEventListener("DOMContentLoaded", function () {
    const logueado = localStorage.getItem("logueado");
    if (logueado === "true") {
        document.getElementById("usuario_o").style.display = "none";
        document.getElementById("usuario_o2").style.display = "block";
    }
    document.getElementById("cerrar_sesion")?.addEventListener("click", () => {
        localStorage.removeItem("logueado");
        localStorage.removeItem("authToken");
        localStorage.removeItem("documento_usuario");
        location.reload();
    });
});
