document.addEventListener('DOMContentLoaded', () => {
    mostrarContadorUsuarios();
    mostrarContadorProductos();
    mostrarContadorVentas();
    ventasMensual();

    document.getElementById("cerrar_sesion").addEventListener("click", cerrar_sesion); 
});

async function mostrarContadorUsuarios() {
    try {
        const response = await fetch('http://127.0.0.1:8000/user/contar_activos');
        if (!response.ok) {
            throw new Error('Error al obtener el contador de usuarios');
        }
        const data = await response.json();
        document.querySelector('#contador strong').textContent = data.total_usuarios;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function mostrarContadorProductos() {
    try {
        const response = await fetch('http://127.0.0.1:8000/productos/contar_productos');
        if (!response.ok) {
            throw new Error('Error al obtener el contador de productos');
        }
        const data = await response.json();
        document.querySelector('#contador_p strong').textContent = data.total_usuarios;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function mostrarContadorVentas() {
    try {
        const response= await fetch('http://127.0.0.1:8000/ventas/reporteVenta');
        if(!response.ok){
            throw new Error('Error al obtener la suma de ventas');
        }
        const data=await response.json();
        console.log(data);
        document.querySelector('#contador_v strong').textContent=data.total_ventas;
        
    }catch(error){
        console.error('Error:',error);
    }
}

async function ventasMensual() {
    try{
        const response= await fetch('http://127.0.0.1:8000/ventas/contar');
        if(!response.ok){
            throw new Error('Error al obtener la cuenta  de ventas');  
        }
        const data=await response.json();
        console.log(data);
        document.querySelector('#venta_mensual strong').textContent=data.total_ventas;
    }
    catch(error){
        console.error('Error:',error);
    }
}


function cerrar_sesion() {
    // Eliminar el estado de logueo
    localStorage.removeItem("logueado");

    
    window.location.href = "../principal/principal.html";
}






