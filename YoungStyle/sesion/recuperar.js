const params = new URLSearchParams(window.location.search);
const token = params.get("token");

document.getElementById("login_form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nueva = document.getElementById("nueva").value;
    const confirmar = document.getElementById("confirmar").value;

    if (nueva !== confirmar) {
        alert("Las contraseñas no coinciden");
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/seguridad/reset_password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, nueva, confirmar })
        });

        const data = await response.json();

        if (!response.ok || data.Estado === "Error") {
            alert(data.Mensaje || "Error al recuperar la contraseña");
            return;
        }

        alert("Contraseña actualizada exitosamente");
        window.location.href = "../sesion/sesion_cliente.html";
    } catch (error) {
        console.error(error);
        alert("Ocurrió un error al intentar recuperar la contraseña");
    }
});
