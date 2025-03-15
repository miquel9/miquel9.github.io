// Obtiene los productos en el carrito del localStorage
let productosEnCarrito = JSON.parse(localStorage.getItem("productos-en-carrito")) || [];

// Selección de elementos del DOM
const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const contenedorTotalConIVA = document.querySelector("#total-con-iva");

// Función para cargar los productos en el carrito
function cargarProductosCarrito() {
    if (productosEnCarrito.length > 0) {
        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");

        contenedorCarritoProductos.innerHTML = "";

        productosEnCarrito.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imagen}" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Cantidad</small>
                    <p>${producto.cantidad}</p>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>${producto.precio}€</p>
                </div>
                <div class="carrito-producto-medidas">
                    <small>Medidas</small>
                    <p>Alto: ${producto.alto}cm, Largo: ${producto.ancho}cm</p>
                </div>
                <div class="carrito-producto-color">
                    <small>Color</small>
                    <p>${producto.color || 'N/A'}</p>
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>${(producto.precio * producto.cantidad).toFixed(2)}€</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
            `;
            contenedorCarritoProductos.append(div);
        });

        actualizarBotonesEliminar();
        calcularTotal();
    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }
}

// Función para actualizar los botones de eliminar
function actualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", eliminarDelCarrito);
    });
}

// Función para eliminar un producto del carrito
function eliminarDelCarrito(e) {
    Toastify({
        text: "Producto eliminado",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: "linear-gradient(to right, #4b33a8, #785ce9)",
            borderRadius: "2rem",
            textTransform: "uppercase",
            fontSize: ".75rem"
        },
        offset: {
            x: '1.5rem',
            y: '1.5rem'
        },
        onClick: function() {}
    }).showToast();

    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);

    productosEnCarrito.splice(index, 1);
    cargarProductosCarrito();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

// Función para vaciar el carrito
function vaciarCarrito() {
    Swal.fire({
        title: '¿Estás seguro?',
        icon: 'question',
        html: `Se van a borrar ${productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0)} productos.`,
        showCancelButton: true,
        focusConfirm: false,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
            productosEnCarrito.length = 0;
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            cargarProductosCarrito();
            calcularTotal();
        }
    });
}

// Función para calcular el total del carrito
function calcularTotal() {
    let totalSinIVA = 0;
    let totalConIVA = 0;
    const herrajePrecio = parseFloat(document.getElementById("herraje-precio").value) || 0;

    productosEnCarrito.forEach(producto => {
        totalSinIVA += producto.precio * producto.cantidad;
    });

    // Añadir el precio del herraje al total sin IVA
    totalSinIVA += herrajePrecio;
    
    // Calcular el total con IVA (aplicando IVA a todo, incluyendo extras)
    totalConIVA = totalSinIVA * 1.21; // Asume un IVA del 21%

    document.getElementById("total-sin-iva-valor").innerText = `${totalSinIVA.toFixed(2)}€`;
    document.getElementById("total-con-iva-valor").innerText = `${totalConIVA.toFixed(2)}€`;
}

// Event listener para actualizar el total cuando se cambia el precio del herraje
document.getElementById("herraje-precio").addEventListener("input", calcularTotal);

// Función para guardar el pedido
function guardarPedido() {
    const herrajePrecio = parseFloat(document.getElementById("herraje-precio").value) || 0;
    const totalProductos = productosEnCarrito.reduce((acc, producto) => acc + producto.precio * producto.cantidad, 0);
    
    // Sumar el precio de herraje al total sin IVA
    const totalSinIVA = totalProductos + herrajePrecio;
    // Aplicar IVA al total (incluyendo extras)
    const totalConIVA = totalSinIVA * 1.21;

    let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    let archivados = JSON.parse(localStorage.getItem("archivados")) || [];
    
    // Obtener el ID más alto entre pedidos activos y archivados
    let maxId = 0;
    
    if (pedidos.length > 0) {
        const maxPedidoId = Math.max(...pedidos.map(p => p.id));
        maxId = Math.max(maxId, maxPedidoId);
    }
    
    if (archivados.length > 0) {
        const maxArchivadoId = Math.max(...archivados.map(p => p.id));
        maxId = Math.max(maxId, maxArchivadoId);
    }
    
    // Modificar los productos para incluir los extras
    const productosConExtras = productosEnCarrito.map(producto => ({
        ...producto,
        extras: 0 // Inicializar extras para cada producto
    }));

    // Si hay extras, añadirlos como un elemento separado
    if (herrajePrecio > 0) {
        productosConExtras.push({
            id: 'extras-' + Date.now(),
            titulo: 'Extras',
            precio: herrajePrecio,
            cantidad: 1,
            extras: herrajePrecio
        });
    }

    // Crear el nuevo pedido con un ID único
    const nuevoPedido = {
        id: maxId + 1,
        fecha: new Date().toISOString(),
        productos: productosConExtras,
        nombreCliente: '', // Campo para ser rellenado después
        totalConIVA: totalConIVA
    };

    pedidos.push(nuevoPedido);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));

    productosEnCarrito = [];
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    cargarProductosCarrito();

    Swal.fire({
        title: 'Pedido guardado',
        text: 'El pedido ha sido guardado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
}

// Añade un evento click al botón de guardar pedido
document.getElementById("guardar-pedido").addEventListener("click", guardarPedido);

// Llama a la función cargarProductosCarrito para cargar los productos al inicio
cargarProductosCarrito();
// Event listeners
botonVaciar.addEventListener("click", vaciarCarrito);