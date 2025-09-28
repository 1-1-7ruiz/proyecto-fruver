const abrirModal = document.getElementById('abrirModal');
const modalModificar = document.getElementById('modificar_u');
const modalConfirmar = document.getElementById('confirmar_c');
const btnRealizar = document.getElementById('realizar');
const mensajeError = document.getElementById('mensajeError');
const cerrarModificar = document.getElementById('cerrarModificar');
const cerrarConfirmar = document.getElementById('cerrarConfirmar');

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


document.addEventListener('DOMContentLoaded', async ()=> {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.log('No hay token, redirigiendo a login...');
        window.location.href = '../sesion/sesion_cliente.html';
        return;
    }

    try{
        const res= await fetch(`http://127.0.0.1:8000/user/perfil`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        if(!res.ok) throw new Error('Error obteniendo  perfil de usuario');

        const data = await res.json();

        const inputNombre=document.getElementById("nombre");
        inputNombre.value = data.first_name || "";
        const inputEmail= document.getElementById("email");
        inputEmail.value = data.email || "";
        const inputTelefono=document.getElementById("telefono");
        inputTelefono.value = data.telefono || "";

        inputEmail.disabled=true;
        inputTelefono.disabled=true;
        inputNombre.disabled=true;


    }catch(error){
        console.error('Error:', error);
        window.location.href = '../sesion/sesion_cliente.html';
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


document.getElementById("cerrar_sesion").addEventListener("click", cerrar_sesion); 
function cerrar_sesion() {
    // Eliminar el estado de logueo
    localStorage.removeItem("logueado");

    
    window.location.href = "../principal/principal.html";
}