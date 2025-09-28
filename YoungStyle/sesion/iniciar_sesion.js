const params = new URLSearchParams(window.location.search);
const token = params.get("token");

const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";

  // Cambiar el ícono
  togglePassword.classList.toggle("fa-eye");
  togglePassword.classList.toggle("fa-eye-slash");
});


document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    try {
      const res = await fetch("http://127.0.0.1:8000/seguridad/seguridad/activar/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });

      const data = await res.json();

      if (res.ok && (data.estado === "ok" || data.mensaje === "Contraseña cambiada con éxito")) {
        mostrarMensaje("✅ " + (data.mensaje || "Operación realizada correctamente"));
      } else if (data.error && data.error.includes("expiró")) {
        // Caso especial: token expirado
        mostrarMensaje("⚠️ El enlace de recuperación ya expiró. Solicita uno nuevo.");
      } else {
        mostrarMensaje("❌ " + (data.mensaje || "Token inválido o error en la activación"));
      }
    } catch (error) {
      console.error("Error al activar cuenta:", error);
      mostrarMensaje("❌ Error en la activación de la cuenta. Intenta más tarde.");
    }
  }
});


// ================== VALIDACIONES INICIO DE SESIÓN Y LOGIN ==================

document.getElementById('login_form').addEventListener('submit', async function (e) {
  e.preventDefault();
  clearErrors();

  let isValid = true;
  isValid = validateUsername() && isValid;
  isValid = validatePassword() && isValid;

  if (!isValid) return;

  const credenciales = {
    correo: document.getElementById('correo').value.trim(),
    password: document.getElementById('password').value.trim()
  };

  try {
    const urlLogin = "http://127.0.0.1:8000/seguridad/login";
    const res = await fetch(urlLogin, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credenciales)
    });

    const resJson = await res.json();

    if (!res.ok || resJson.Estado === "Error") {
      mostrarMensaje(resJson.Mensaje || "Credenciales incorrectas. Inténtalo de nuevo.");
      return;
    }

    const token = resJson.token;
const usuarioLogueado = resJson.nombre;
const esSuperusuario = resJson.is_superuser;

// Nuevo: el backend debe estar devolviendo también el documento
const documento = resJson.documento;  

localStorage.setItem("authToken", token);
localStorage.setItem("usuarioId", resJson.id);
localStorage.setItem("documento_usuario", documento);   // ✅ Guardamos el documento
localStorage.setItem("logueado", "true");
localStorage.setItem("horaLogin", Date.now());

    mostrarMensaje("¡Inicio de sesión exitoso!");

    document.getElementById("login_form").reset();
    if (esSuperusuario) {
      window.location.href = "../admin/administrador.html";
    } else {
      window.location.href = "../principal/principal.html";
    }
  } catch (error) {
    console.error("Error al intentar iniciar sesión: ", error);
    mostrarMensaje("Error en la red o en la solicitud de login");
  }
});



// ================== VALIDACIONES ==================

function clearErrors() {
  const errorElements = document.querySelectorAll(".error");
  errorElements.forEach(el => {
    el.textContent = "";
    el.style.visibility = "hidden";
  });
}

function validateUsername() {
  const username = document.getElementById("correo").value;
  const errorElement = document.getElementById("correo-error");
  if (!username) {
    errorElement.textContent = "El correo es obligatorio.";
    errorElement.style.visibility = "visible";
    return false;
  }
  return true;
}
function validatePassword() {
  const password = document.getElementById("password").value;
  const errorElement = document.getElementById("password-error");
  if (!password) {
    errorElement.textContent = "La contraseña es obligatoria.";
    errorElement.style.visibility = "visible";
    return false;
  }
  return true;
}
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email && emailPattern.test(email);
}
// ================== RECUPERAR CONTRASEÑA ==================

document.getElementById('recuperar').addEventListener('click', function (event) {
  event.preventDefault();
  document.getElementById('recuperar_c').style.display = 'flex';
});

document.querySelector('.oculto').addEventListener('click', function () {
  document.getElementById("recuperar_c").style.display = 'none';
});

document.getElementById('send_recover').addEventListener('click', async function (event) {
  event.preventDefault();
  clearErrors();

  const email = document.getElementById("email").value;
  const errorElement = document.getElementById("email-error");

  if (!validateEmail(email)) {
    errorElement.textContent = "El correo electrónico es obligatorio y debe ser válido.";
    errorElement.style.visibility = "visible";
    return;
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/seguridad/recuperar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (!res.ok || data.Estado === "Error") {
      mostrarMensaje(data.Mensaje || "Error al enviar el correo de recuperación");
      return;
    }

    mostrarMensaje(data.Mensaje || "Correo de recuperación enviado correctamente");
    document.getElementById("recuperar_c").style.display = 'none';
  } catch (err) {
    console.error("Error al enviar la solicitud de recuperación:", err);
    mostrarMensaje("No se pudo enviar el correo de recuperación");
  }
});
// ================== FUNCIÓN DE MENSAJES ==================
function mostrarMensaje(mensaje) {
  const mensajeBox = document.createElement("div");
  mensajeBox.textContent = mensaje;
  mensajeBox.style.position = "fixed";
  mensajeBox.style.top = "20px";
  mensajeBox.style.right = "20px";
  mensajeBox.style.padding = "12px 18px";
  mensajeBox.style.backgroundColor = "#333";
  mensajeBox.style.color = "#fff";
  mensajeBox.style.borderRadius = "8px";
  mensajeBox.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  mensajeBox.style.zIndex = "9999";

  document.body.appendChild(mensajeBox);

  setTimeout(() => {
    mensajeBox.remove();
  }, 4000);
}

