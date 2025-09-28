// ==============================
// 🔷 VARIABLES GLOBALES
// ==============================
const BASE_URL = "http://127.0.0.1:8000/user/users";

const crearBtn = document.getElementById('crear');
const tablaBody = document.getElementById('tbody_usuarios');
const formUsuario = document.getElementById('form');
let filaEditando = null;

// ==============================
// 🔷 CAMPOS DEL FORMULARIO
// ==============================
const campos = {
  documento: document.getElementById('documento'),
  nombres: document.getElementById('nombres'),
  apellidos: document.getElementById('apellidos'),
  telefono: document.getElementById('telefono'),
  email: document.getElementById('email'),
  direccion: document.getElementById('direccion'),
  contraseña: document.getElementById('contraseña'),
  id_rol: document.getElementById('id_rol'),
  estado: document.getElementById('estado')
};

// ==============================
// 🔷 MODALES DE BÚSQUEDA AVANZADA
// ==============================
const modalBusqueda = document.getElementById("busque_avanzada");
const btnAbrirBusqueda = document.getElementById("filtrar_usuarios");
const btnCerrarBusqueda = modalBusqueda.querySelector(".cerrar");
const btnCancelarBusqueda = modalBusqueda.querySelector(".cancelar");

btnAbrirBusqueda?.addEventListener("click", () => modalBusqueda.style.display = "block");
btnCerrarBusqueda?.addEventListener("click", () => modalBusqueda.style.display = "none");
btnCancelarBusqueda?.addEventListener("click", () => modalBusqueda.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === modalBusqueda) modalBusqueda.style.display = "none"; });

// ==============================
// 🔷 UTILITARIOS
// ==============================
function mostrarMensaje(mensaje) {
  alert(mensaje);
}

function cerrarModalUsuario() {
  document.getElementById("modificar_u").style.display = 'none';
  formUsuario.reset();
  campos.documento.disabled = false;
  crearBtn.textContent = 'Crear usuario';
  document.getElementById('titulo').textContent = 'Datos de usuario';
  filaEditando = null;
}

// ==============================
// 🔷 VALIDACIÓN DE DATOS
// ==============================
function validarCampos(usuario) {
  // Documento: solo números, entre 6 y 15 dígitos
  if (!/^\d{6,15}$/.test(usuario.documento)) {
    return "El documento debe contener solo números (entre 6 y 15 dígitos).";
  }

  // Nombre y apellido: solo letras y espacios
  if (!/^[a-zA-Z\s]+$/.test(usuario.nombres)) {
    return "El nombre solo puede contener letras y espacios.";
  }
  if (!/^[a-zA-Z\s]+$/.test(usuario.apellidos)) {
    return "El apellido solo puede contener letras y espacios.";
  }

  // Teléfono: exactamente 10 dígitos
  if (!/^\d{10}$/.test(usuario.telefono)) {
    return "El número de teléfono debe tener exactamente 10 dígitos.";
  }

  // Email: formato válido
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(usuario.email)) {
    return "El correo electrónico no es válido.";
  }


  

  // Contraseña: mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(usuario.contraseña)) {
    return "La contraseña debe tener mínimo 8 caracteres e incluir al menos una mayúscula, una minúscula, un número y un carácter especial.";
  }

  return null; //  Si no hay errores
}


// ==============================
// 🔷 TABLA DE USUARIOS (CRUD)
// ==============================
function construirFilaHTML(usuario) {
  return `
    <td>${usuario.documento}</td>
    <td>${usuario.nombres}</td>
    <td>${usuario.apellidos}</td>
    <td>${usuario.email}</td>
    <td class="${(usuario.estado || '').toLowerCase() === 'activo' ? 'estado-activo' : 'estado-inactivo'}">${usuario.estado || ''}</td>
    <td>${usuario.id_rol}</td>
    <td><button class="btn-modificar">Modificar Usuario</button></td>
  `;
}

function agregarUsuarioTabla(usuario, mostrarAlerta = true) {
  let fila = filaEditando ? filaEditando : document.createElement('tr');
  fila.innerHTML = construirFilaHTML(usuario);

  // Guardar datos ocultos en dataset
  fila.dataset.telefono = usuario.telefono || '';
  fila.dataset.direccion = usuario.direccion || '';
  fila.dataset.contraseña = usuario.contraseña || '';
  fila.dataset.id_rol = usuario.id_rol || '';
  fila.dataset.estado = usuario.estado || '';

  fila.querySelector('.btn-modificar').addEventListener('click', () => editarUsuario(fila));

  if (!filaEditando) {
    tablaBody.appendChild(fila);
  }

  if (mostrarAlerta) {
    mostrarMensaje(filaEditando ? "Usuario modificado correctamente." : "Usuario agregado exitosamente.");
  }

  cerrarModalUsuario();
}

function editarUsuario(fila) {
  const celdas = fila.querySelectorAll('td');

  campos.documento.value = celdas[0].textContent;
  campos.nombres.value = celdas[1].textContent;
  campos.apellidos.value = celdas[2].textContent;
  campos.email.value = celdas[3].textContent;
  campos.estado.value = fila.dataset.estado || '';
  campos.id_rol.value = fila.dataset.id_rol || '';
  campos.telefono.value = fila.dataset.telefono || '';
  campos.direccion.value = fila.dataset.direccion || '';
  campos.contraseña.value = fila.dataset.contraseña || '';

  campos.documento.disabled = true;

  filaEditando = fila;
  crearBtn.textContent = 'Modificar usuario';
  document.getElementById('titulo').textContent = 'Modificar usuario';
  document.getElementById("modificar_u").style.display = 'block';
}

// ==============================
// 🔷 BÚSQUEDA SIMPLE
// ==============================
const inputBuscar = document.querySelector('#find');
inputBuscar.addEventListener('input', filtrarUsuarios);

function filtrarUsuarios() {
  const filtro = inputBuscar.value.toLowerCase();
  const filas = document.querySelectorAll('#tbody_usuarios tr');

  filas.forEach(fila => {
    const celdas = fila.querySelectorAll('td');
    const coincide = [...celdas].some(td => td.textContent.toLowerCase().includes(filtro));
    fila.style.display = coincide ? '' : 'none';
  });
}

// ==============================
// 🔷 BÚSQUEDA AVANZADA
// ==============================
const inputNombreBusqueda = document.querySelector(".nombre_b");
const selectEstadoBusqueda = document.getElementById("estado_busqueda");
const SelectRolBusqueda = document.getElementById("rol_busqueda");
const btnBuscarAvanzada = document.getElementById("btnBuscarAvanzada");
const btnLimpiarFiltros = document.getElementById("limpiar-filtros");

async function buscarUsuariosAvanzada() {
  const nombreFiltro = inputNombreBusqueda?.value.trim() || "";
  const estadoFiltro = selectEstadoBusqueda?.value || "";
  const rolFiltro = SelectRolBusqueda?.value || "";

  const params = new URLSearchParams();
  if (nombreFiltro) params.append("nombre", nombreFiltro);
  if (estadoFiltro && estadoFiltro !== "todos") params.append("estado", estadoFiltro);
  if (rolFiltro && rolFiltro !== "todos") params.append("rol", rolFiltro);

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!response.ok) throw new Error("Error al buscar usuarios.");

    const data = await response.json();
    tablaBody.innerHTML = "";
    data.usuario.forEach(usuario => agregarUsuarioTabla(usuario, false));

    if (data.usuario.length === 0) {
      mostrarMensaje("No se encontraron usuarios con los criterios de búsqueda.");
    }
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    mostrarMensaje("Error al buscar usuarios.");
  }
}

btnBuscarAvanzada?.addEventListener("click", (e) => { e.preventDefault(); buscarUsuariosAvanzada(); });
btnLimpiarFiltros?.addEventListener("click", async () => {
  inputNombreBusqueda.value = "";
  selectEstadoBusqueda.value = "todos";
  SelectRolBusqueda.value = "todos";
  tablaBody.innerHTML = "";
  await cargarUsuarios();
});

// ==============================
// 🔷 FORMULARIO (Crear / Modificar)
// ==============================
formUsuario.addEventListener("submit", async function (e) {
  e.preventDefault();

  const usuario = {
    documento: campos.documento.value.trim(),
    nombres: campos.nombres.value.trim(),
    apellidos: campos.apellidos.value.trim(),
    telefono: campos.telefono.value.trim(),
    email: campos.email.value.trim(),
    direccion: campos.direccion.value.trim(),
    contraseña: campos.contraseña.value.trim(),
    id_rol: campos.id_rol.value,
    estado: campos.estado.value
  };

  const error = validarCampos(usuario);
  if (error) {
    mostrarMensaje(error);
    return;
  }

  try {
    const url = filaEditando
      ? `http://127.0.0.1:8000/user/users/${usuario.documento}`
      : "http://127.0.0.1:8000/user/users";
    const metodo = filaEditando ? "PUT" : "POST";

    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario)
    });

    if (!res.ok) {
      const errorData = await res.json();
      mostrarMensaje(errorData.mensaje || "Error al guardar el usuario.");
      return;
    }

    const resJson = await res.json();
    agregarUsuarioTabla(resJson);
  } catch (err) {
    console.error("Error capturado en el fetch:", err);
    mostrarMensaje("Error de red o en la solicitud.");
  }
});

// ==============================
// 🔷 CARGA INICIAL DE USUARIOS
// ==============================
async function cargarUsuarios() {
  try {
    const res = await fetch("http://127.0.0.1:8000/user/users");
    const data = await res.json();
    tablaBody.innerHTML = "";
    data.usuario.forEach(usuario => {
      agregarUsuarioTabla(usuario, false);
    });
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
    mostrarMensaje("Error al cargar los usuarios.");
  }
}

// ==============================
// 🔷 CARGAR ROLES PARA FILTRO
// ==============================
async function cargarRoles() {
  try {
    const res = await fetch(BASE_URL);
    const data = await res.json();
    const roles = data.rol;

    SelectRolBusqueda.innerHTML = `<option value="todos">Todos</option>`;
    roles.forEach(r => {
      const opt = document.createElement("option");
      opt.value = r.rol;
      opt.textContent = r.rol;
      SelectRolBusqueda.appendChild(opt);
    });
  } catch (error) {
    console.error("Error cargando roles:", error);
  }
}

// ==============================
// 🔷 MODALES
// ==============================
document.getElementById('nuevo_usuario').addEventListener('click', e => {
  e.preventDefault();
  cerrarModalUsuario();
  document.getElementById('modificar_u').style.display = 'block';
});
document.querySelector('.close').addEventListener('click', cerrarModalUsuario);
document.getElementById('cancelar').addEventListener('click', cerrarModalUsuario);

// ==============================
// 🔷 CERRAR SESIÓN
// ==============================
document.getElementById("cerrar_sesion").addEventListener("click", cerrar_sesion); 
function cerrar_sesion() {
    localStorage.removeItem("logueado");
    window.location.href = "../principal/principal.html";
}

// ==============================
// 🔷 INICIALIZAR
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios();
  cargarRoles();
});
