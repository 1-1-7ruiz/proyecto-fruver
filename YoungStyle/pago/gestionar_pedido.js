document.addEventListener("DOMContentLoaded", function () {
  // ===================== BOTÓN ATRÁS =====================
  const btnAtras = document.getElementById("btnAtras");
  if (btnAtras) {
    btnAtras.addEventListener("click", function () {
      const salir = confirm("¿Deseas regresar al carrito? Se perderán los datos.");
      if (salir) {
        window.location.href = "ver_carrito.html";
      }
    });
  }

  // ===================== NAVEGACIÓN SEGURA =====================
  const inicio = document.getElementById("inicio");
  if (inicio) {
    inicio.addEventListener("click", function (e) {
      e.preventDefault();
      const salir = confirm("¿Estás segura de salir? Se perderán los datos del pedido.");
      if (salir) {
        window.location.href = "../principal/principal.html";
      }
    });
  }

  const sobreNosotros = document.getElementById("sobre_nosotros");
  if (sobreNosotros) {
    sobreNosotros.addEventListener("click", function (e) {
      e.preventDefault();
      const salir = confirm("¿Estás segura de salir? Se perderán los datos del pedido.");
      if (salir) {
        window.location.href = "../quienes_somos/nuestra_historia.html";
      }
    });
  }

  // ===================== CARGAR CARRITO =====================
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const contenedorProductos = document.querySelector(".produc");
  const totalCompra = document.querySelector(".total-compra");
  const cantidadProductos = document.querySelector(".cantidad-productos");

  if (carrito.length === 0) {
    if (cantidadProductos) cantidadProductos.textContent = "No hay productos en tu carrito.";
    if (totalCompra) totalCompra.textContent = "";
  } else {
    let total = 0;
    carrito.forEach(producto => {
      const precioTotal = producto.precio * producto.cantidad;
      total += precioTotal;

      const p = document.createElement("p");
      p.innerHTML = `<span>${producto.nombre}</span> <span>$ ${precioTotal.toLocaleString("es-CO")}</span>`;
      contenedorProductos.appendChild(p);
    });

    cantidadProductos.textContent = `${carrito.length} producto(s)`;
    totalCompra.textContent = `Total compra: $ ${total.toLocaleString("es-CO")}`;
  }

  // ===================== MODAL USUARIO =====================
  const usuarioBtn = document.getElementById('usuario_opciones');
  const usuarioModal = document.getElementById('usuario_v');
  const cerrarUsuario = document.querySelector('.oculto');

  function abrirModal(modal) {
    if (modal) modal.style.display = 'block';
  }
  function cerrarModal(modal) {
    if (modal) modal.style.display = 'none';
  }

  if (usuarioBtn) {
    usuarioBtn.addEventListener('click', e => {
      e.preventDefault();
      abrirModal(usuarioModal);
    });
  }

  if (cerrarUsuario) {
    cerrarUsuario.addEventListener('click', () => cerrarModal(usuarioModal));
  }

  window.addEventListener('click', event => {
    if (event.target === usuarioModal) cerrarModal(usuarioModal);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') cerrarModal(usuarioModal);
  });

  // ===================== SESIÓN =====================
  const logueado = localStorage.getItem("logueado");
  if (logueado === "true") {
    document.getElementById("usuario_o").style.display = "none";
    document.getElementById("usuario_o2").style.display = "flex";
  }

  document.getElementById("cerrar_sesion")?.addEventListener("click", () => {
    localStorage.removeItem("logueado");
    localStorage.removeItem("authToken");
    localStorage.removeItem("documento_usuario");
    location.reload();
  });
});
