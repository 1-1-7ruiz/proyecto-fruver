const abrirModal = document.getElementById('abrirModal');
const modalModificar = document.getElementById('modificar_u');
const modalConfirmar = document.getElementById('confirmar_c');
const btnRealizar = document.getElementById('realizar');
const mensajeError = document.getElementById('mensajeError');
const cerrarModificar = document.getElementById('cerrarModificar');
const cerrarConfirmar = document.getElementById('cerrarConfirmar');

// ===================== VARIABLES Y ELEMENTOS DEL DOM =====================
const usuarioBtn = document.getElementById('usuario_opciones');
const usuarioModal = document.getElementById('usuario_v');
const cerrarUsuario = document.querySelector('.oculto');

// ===================== FUNCIONES DE MODALES =====================
function abrirModal_U(modal) {
    modal.style.display = 'block';
    
}

function cerrarModal(modal) {
    modal.style.display = 'none';
}

// ===================== EVENTOS DE MODALES =====================
if (usuarioBtn) {
    usuarioBtn.addEventListener('click', e => {
        e.preventDefault();
        abrirModal_U(usuarioModal);
        console.log("Modal de usuario abierto");
    });
}

if (cerrarUsuario) {
    cerrarUsuario.addEventListener('click', () => cerrarModal(usuarioModal));
}

// ===================== EVENTOS GLOBALES =====================
window.addEventListener('click', event => {
    if (event.target === usuarioModal) cerrarModal(usuarioModal);

});

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        cerrarModal(usuarioModal);
        
    }
});

const logueado = localStorage.getItem("logueado");
    if (logueado === "true") {
        document.getElementById("usuario_o").style.display = "none";
        document.getElementById("usuario_o2").style.display = "block";
    }

    document.getElementById("cerrar_sesion")?.addEventListener("click", () => {
        localStorage.removeItem("logueado");
        location.reload();
    });


// ======================= MODALES =======================

// Abrir modal de cambio de contraseña
abrirModal.addEventListener('click', function (e) {
    e.preventDefault();
    modalModificar.style.display = 'flex';
    mensajeError.textContent = '';
});

// Cerrar modal de cambio
cerrarModificar.addEventListener('click', function () {
    modalModificar.style.display = 'none';
    mensajeError.textContent = '';
});

// Cerrar modal de confirmación
cerrarConfirmar.addEventListener('click', function () {
    modalConfirmar.style.display = 'none';
});

// ======================= PERFIL DE USUARIO =======================
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    console.log("🔑 Token cargado en perfil:", token);

    if (!token) {
        console.log('No hay token, redirigiendo a login...');
        window.location.href = '../sesion/sesion_cliente.html';
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:8000/user/perfil`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + token,
            }
        });
        console.log("📡 Respuesta perfil status:", res.status);

        if (!res.ok) throw new Error('Error obteniendo perfil de usuario');

        const data = await res.json();
        

        const inputNombre=document.getElementById("nombre");
        const inputApellido =document.getElementById("apellido");
        const inputEmail =document.getElementById("email");
        const inputTelefono =document.getElementById("telefono");
        const inputDireccion= document.getElementById("direccion");

        inputNombre.value = data.first_name || "";
        inputApellido.value = data.last_name || "";
        inputEmail.value = data.email || "";
        inputTelefono.value = data.telefono || "";
        inputDireccion.value = data.direccion || "";

        inputNombre.disabled=true;
        inputApellido.disabled=true;
        inputEmail.disabled=true;
        inputTelefono.disabled=true;
        inputDireccion.disabled=true;


    } catch (error) {
        console.error('❌ Error perfil:', error);
        //window.location.href = '../principal/principal.html';
    }
});

// ======================= CAMBIO DE CONTRASEÑA =======================
btnRealizar.addEventListener("click", async function () {
    const token = localStorage.getItem('authToken');
    console.log("🔑 Token cargado en cambio contraseña:", token);

    const old_password = document.getElementById("actualContra").value.trim();
    const new_password = document.getElementById("nueva").value.trim();
    const confirm_password = document.getElementById("confirmar").value.trim();

    // Validaciones
    if (!old_password || !new_password || !confirm_password) {
        mensajeError.textContent = "Por favor, completa todos los campos.";
        return;
    }

    if (new_password !== confirm_password) {
        mensajeError.textContent = "Las contraseñas no coinciden.";
        return;
    }

    mensajeError.textContent = "";

    try {
        const response = await fetch("http://127.0.0.1:8000/seguridad/change_password", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ old_password, new_password, confirm_password })
        });

        console.log("📡 Respuesta cambio contraseña status:", response.status);

        const data = await response.json();
        console.log("📥 Respuesta cambio contraseña:", data);

        if (!response.ok || data.Estado === "Error") {
            alert(data.Mensaje || "Error al cambiar la contraseña");
            return;
        }

        modalModificar.style.display = 'none';
        modalConfirmar.style.display = 'flex';

    } catch (error) {
        console.error("❌ Error cambio contraseña:", error);
        alert("Ocurrió un error al intentar cambiar la contraseña");
    }
});
