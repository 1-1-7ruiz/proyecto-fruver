document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("register_form");

  // ========= FUNCIONES AUXILIARES PARA ERRORES =========
  function showError(element, message) {
    element.textContent = message;
    element.classList.add("active"); // activa el fade-in
  }

  function hideError(element) {
    element.textContent = "";
    element.classList.remove("active"); // activa el fade-out
  }

  function clearErrors() {
    document.querySelectorAll(".error").forEach((el) => hideError(el));
  }

  // ========= VALIDACIONES =========
  function validateDocumento() {
    const documento = document.getElementById("documento").value.trim();
    const errorElement = document.getElementById("documento-error");
    if (!/^\d{6,15}$/.test(documento)) {
      showError(errorElement, "El documento debe ser numérico y tener entre 6 y 15 dígitos.");
      return false;
    }
    hideError(errorElement);
    return true;
  }

  function validateName() {
    const nombres = document.getElementById("nombres").value.trim();
    const errorElement = document.getElementById("name-error");
    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,50}$/.test(nombres)) {
      showError(errorElement, "El nombre solo debe contener letras y espacios (2-50 caracteres).");
      return false;
    }
    hideError(errorElement);
    return true;
  }

  function validateLastName() {
    const apellidos = document.getElementById("apellidos").value.trim();
    const errorElement = document.getElementById("last_name-error");
    if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,50}$/.test(apellidos)) {
      showError(errorElement, "El apellido solo debe contener letras y espacios (2-50 caracteres).");
      return false;
    }
    hideError(errorElement);
    return true;
  }

  function validatePhone() {
    const telefono = document.getElementById("telefono").value.trim();
    const errorElement = document.getElementById("phone-error");
    if (!/^\d{10}$/.test(telefono)) {
      showError(errorElement, "El N° Celular debe tener 10 dígitos.");
      return false;
    }
    hideError(errorElement);
    return true;
  }

  function validateEmail() {
    const email = document.getElementById("email").value.trim();
    const errorElement = document.getElementById("email-error");
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showError(errorElement, "El correo electrónico no es válido.");
      return false;
    }
    hideError(errorElement);
    return true;
  }

  function validateDireccion() {
    const direccion = document.getElementById("direccion").value.trim();
    const errorElement = document.getElementById("direccion-error");
    if (!direccion) {
      showError(errorElement, "La dirección es obligatoria.");
      return false;
    }
    hideError(errorElement);
    return true;
  }

  function validatePassword() {
    const contraseña = document.getElementById("contraseña").value;
    const errorElement = document.getElementById("password-error");

    const regex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/;

    if (!regex.test(contraseña)) {
      showError(
        errorElement,
        "La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y un carácter especial."
      );
      return false;
    }
    hideError(errorElement);
    return true;
  }

  function validateRePassword() {
    const password = document.getElementById("contraseña").value;
    const rePassword = document.getElementById("re_password").value;
    const errorElement = document.getElementById("re_password-error");
    if (rePassword !== password) {
      showError(errorElement, "Las contraseñas no coinciden.");
      return false;
    }
    hideError(errorElement);
    return true;
  }

  // ========= SUBMIT =========
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearErrors();

    let isValid = true;

    isValid = validateDocumento() && isValid;
    isValid = validateName() && isValid;
    isValid = validateLastName() && isValid;
    isValid = validatePhone() && isValid;
    isValid = validateEmail() && isValid;
    isValid = validateDireccion() && isValid;
    isValid = validatePassword() && isValid;
    isValid = validateRePassword() && isValid;

    if (!isValid) return;

    // ========= Enviar al backend =========
    const documento = form.elements["documento"].value;
    const nombres = form.elements["nombres"].value;
    const apellidos = form.elements["apellidos"].value;
    const telefono = form.elements["telefono"].value;
    const email = form.elements["email"].value;
    const direccion = form.elements["direccion"].value;
    const contraseña = form.elements["contraseña"].value;

    try {
      const res = await fetch("http://127.0.0.1:8000/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documento,
          nombres,
          apellidos,
          telefono,
          email,
          direccion,
          contraseña,
        }),
      });

      const data = await res.json();
      console.log("Respuesta backend:", data);

      if (res.ok) {
        document.getElementById("registro-exitoso").style.display = "flex";
      } else {
        alert("Error en el registro: " + JSON.stringify(data));
      }
    } catch (err) {
      alert("Error de conexión con el servidor: " + err.message);
    }
  });

  // ========= CERRAR E INICIAR SESION =========

  document.getElementById("iniciar_sesion").addEventListener("click",function(){
    window.location.href= "sesion_cliente.html";
  })

  // ========= CERRAR VENTANA DE ÉXITO =========
  document.querySelector(".close").addEventListener("click", function () {
    document.getElementById("registro-exitoso").style.display = "none";
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.getElementById("registro-exitoso").style.display = "none";
    }
  });
});
