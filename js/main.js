// filepath: /c:/Users/Miquel/Documents/desarrollodeapss/ventaYT_APP/1000000000000)/2a oportunidadyt/js/main.js
// Selección de elementos del DOM
const contenedorProductos = document.querySelector("#contenedor-productos");
const addProductButton = document.getElementById("agregar-producto");
const modalAddProduct = document.getElementById("modal-add-product");
const cerrarModalAddProduct = document.getElementById("cerrar-modal-add-product");
const guardarProductoButton = document.getElementById("guardar-producto");

// Cargar productos desde localStorage o productos.json
let productos = JSON.parse(localStorage.getItem("productos")) || [];

// Fetch para obtener los datos del archivo productos.json si no hay productos en localStorage
if (productos.length === 0) {
    fetch("./js/productos.json")
        .then(response => response.json()) // Convierte la respuesta a JSON
        .then(data => {
            productos = data; // Asigna los datos obtenidos a la variable productos
            cargarProductos(productos); // Llama a la función cargarProductos con los datos obtenidos
        });
}

// Selección de elementos del DOM
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector("#titulo-principal");
let botonesAgregar = document.querySelectorAll(".producto-agregar");
const numerito = document.querySelector("#numerito");
const seccionVentanas = document.querySelector("#seccion-ventanas");
const resultado = document.querySelector("#resultado");
let productoSeleccionado = null;
const searchInput = document.querySelector("#search-input");

// Añade un evento click a cada botón de categoría
botonesCategorias.forEach(boton => boton.addEventListener("click", (e) => {
    botonesCategorias.forEach(boton => boton.classList.remove("active")); // Remueve la clase active de todos los botones
    e.currentTarget.classList.add("active"); // Añade la clase active al botón clicado

    const categoriaId = e.currentTarget.id;
    if (categoriaId === "todos") {
        cargarProductos(productos);
        tituloPrincipal.innerText = "Todos los productos";
    } else {
        const productosFiltrados = productos.filter(producto => producto.categoria.id === categoriaId);
        cargarProductos(productosFiltrados);
        const categoriaNombre = productosFiltrados[0]?.categoria.nombre || "Categoría";
        tituloPrincipal.innerText = categoriaNombre;
    }
}));

// Añade un evento input a la barra de búsqueda
searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const productosFiltrados = productos.filter(producto => 
        producto.titulo.toLowerCase().includes(searchTerm) ||
        producto.categoria.nombre.toLowerCase().includes(searchTerm)
    );
    cargarProductos(productosFiltrados);
});

// Función para cargar productos
function cargarProductos(productosElegidos) {
    const preciosGuardados = JSON.parse(localStorage.getItem("precios-guardados")) || {};
    contenedorProductos.innerHTML = productosElegidos.map(producto => {
        const precioGuardado = preciosGuardados[producto.id];
        if (precioGuardado) {
            producto.precioAlto = precioGuardado.precioAlto;
            producto.precioAncho = precioGuardado.precioAncho;
            producto.precioHerraje = precioGuardado.precioHerraje;
            producto.constanteAdicional = precioGuardado.constanteAdicional;
        }
        return `
            <div class="producto">
                <img class="producto-imagen" src="${producto.imagen}" alt="${producto.titulo}" data-id="${producto.id}">
                <div class="producto-detalles">
                    <h3 class="producto-titulo">${producto.titulo}</h3>
                    ${producto.categoria.id === "herrajes" ? `
                        <p class="producto-precio">Precio de Herraje: <input type="number" value="${producto.precioHerraje || 0}" class="precio-herraje" data-id="${producto.id}">€</p>
                        <button class="producto-agregar" data-id="${producto.id}">Agregar al carrito</button>
                    ` : `
                        ${["cristales", "mallorquinas", "mosquiteras", "persianas"].includes(producto.categoria.id) ? `
                            <p class="producto-precio">Precio por metro cuadrado: <input type="number" value="${producto.precioAlto}" class="precio-alto" data-id="${producto.id}">€</p>
                        ` : `
                            <p class="producto-precio">Precio de alto: <input type="number" value="${producto.precioAlto}" class="precio-alto" data-id="${producto.id}">€</p>
                            <p class="producto-precio">Precio de largo: <input type="number" value="${producto.precioAncho}" class="precio-ancho" data-id="${producto.id}">€</p>
                            <p class="producto-precio">Constante Adicional: <input type="number" value="${producto.constanteAdicional || 0}" class="constante-adicional" data-id="${producto.id}">€</p>
                        `}
                        <button class="producto-calcular" data-id="${producto.id}">Calcular precio</button>
                    `}
                    <button class="guardar-precio" data-id="${producto.id}">Guardar constantes</button>
                    <button class="eliminar-producto" data-id="${producto.id}">Eliminar producto</button>
                </div>
            </div>
        `;
    }).join("");

    // Event listeners para los inputs de precio
    document.querySelectorAll(".precio-alto").forEach(input => {
        input.addEventListener("change", (e) => {
            const idProducto = e.currentTarget.getAttribute("data-id");
            const producto = productos.find(p => p.id === idProducto);
            producto.precioAlto = parseFloat(e.currentTarget.value);
        });
    });

    document.querySelectorAll(".precio-ancho").forEach(input => {
        input.addEventListener("change", (e) => {
            const idProducto = e.currentTarget.getAttribute("data-id");
            const producto = productos.find(p => p.id === idProducto);
            producto.precioAncho = parseFloat(e.currentTarget.value);
        });
    });

    document.querySelectorAll(".precio-herraje").forEach(input => {
        input.addEventListener("change", (e) => {
            const idProducto = e.currentTarget.getAttribute("data-id");
            const producto = productos.find(p => p.id === idProducto);
            producto.precioHerraje = parseFloat(e.currentTarget.value);
        });
    });

    document.querySelectorAll(".constante-adicional").forEach(input => {
        input.addEventListener("change", (e) => {
            const idProducto = e.currentTarget.getAttribute("data-id");
            const producto = productos.find(p => p.id === idProducto);
            producto.constanteAdicional = parseFloat(e.currentTarget.value);
        });
    });

    // Event listeners para los botones de guardar
    document.querySelectorAll(".guardar-precio").forEach(boton => {
        boton.addEventListener("click", (e) => {
            const idProducto = e.currentTarget.getAttribute("data-id");
            const producto = productos.find(p => p.id === idProducto);
            guardarPrecio(producto);
        });
    });

    // Event listeners para los botones de calcular
    document.querySelectorAll(".producto-calcular").forEach(boton => {
        boton.addEventListener("click", (e) => {
            const idProducto = e.currentTarget.getAttribute("data-id");
            const producto = productos.find(p => p.id === idProducto);
            abrirModal(producto);
        });
    });

    // Event listeners para los botones de agregar al carrito
    document.querySelectorAll(".producto-agregar").forEach(boton => {
        boton.addEventListener("click", (e) => {
            const idProducto = e.currentTarget.getAttribute("data-id");
            const producto = productos.find(p => p.id === idProducto);
            agregarHerrajeAlCarrito(producto);
        });
    });

    // Event listeners para los botones de eliminar
    document.querySelectorAll(".eliminar-producto").forEach(boton => {
        boton.addEventListener("click", (e) => {
            const idProducto = e.currentTarget.getAttribute("data-id");
            eliminarProducto(idProducto);
        });
    });

    actualizarBotonesAgregar(); // Llama a la función actualizarBotonesAgregar
    actualizarImagenesVentanas(); // Llama a la función actualizarImagenesVentanas
}

// Función para guardar el precio en localStorage
// Añade esta función al inicio del archivo
let fileHandle;

async function getFileHandle() {
    if (!fileHandle) {
        try {
            fileHandle = await window.showOpenFilePicker({
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] }
                }],
                startIn: 'downloads'
            });
            return fileHandle[0];
        } catch (error) {
            console.error('Error accessing file:', error);
            return null;
        }
    }
    return fileHandle[0];
}

// Modifica la función guardarPrecio
async function guardarPrecio(producto) {
    const preciosGuardados = JSON.parse(localStorage.getItem("precios-guardados")) || {};
    if (["cristales", "mallorquinas", "mosquiteras", "persianas", "herrajes"].includes(producto.categoria.id)) {
        preciosGuardados[producto.id] = {
            precioAlto: producto.precioAlto,
            precioHerraje: producto.precioHerraje
        };
    } else {
        preciosGuardados[producto.id] = {
            precioAlto: producto.precioAlto,
            precioAncho: producto.precioAncho,
            constanteAdicional: producto.constanteAdicional
        };
    }
    
    try {
        const handle = await getFileHandle();
        if (handle) {
            const writable = await handle.createWritable();
            await writable.write(JSON.stringify(productos, null, 2));
            await writable.close();
            
            localStorage.setItem("precios-guardados", JSON.stringify(preciosGuardados));
            
            Toastify({
                text: "Productos guardados en archivo y constantes guardadas",
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
        }
    } catch (error) {
        console.error('Error saving file:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo guardar el archivo',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Event listeners para el modal de añadir producto
addProductButton.addEventListener("click", () => {
    modalAddProduct.style.display = "flex";
});

cerrarModalAddProduct.addEventListener("click", () => {
    modalAddProduct.style.display = "none";
});

// Modifica la función de guardar nuevo producto
guardarProductoButton.addEventListener("click", () => {
    const nuevoTitulo = document.getElementById("nuevo-titulo").value;
    const nuevaImagen = document.getElementById("nueva-imagen").value;
    const nuevaCategoria = document.getElementById("nuevo-apartado").value;

    if (nuevoTitulo && nuevaImagen && nuevaCategoria) {
        const nuevoProducto = {
            id: `producto-${Date.now()}`,
            titulo: nuevoTitulo,
            imagen: nuevaImagen,
            categoria: {
                nombre: nuevaCategoria.replace(/-/g, ' '),
                id: nuevaCategoria
            },
            precioAlto: 0,
            precioAncho: 0,
            precioHerraje: nuevaCategoria === "herrajes" ? 0 : undefined,
            constanteAdicional: 0
        };

        productos.push(nuevoProducto);
        localStorage.setItem("productos", JSON.stringify(productos));
        cargarProductos(productos);
        
        // Limpiar campos
        document.getElementById("nuevo-titulo").value = "";
        document.getElementById("nueva-imagen").value = "";
        document.getElementById("nuevo-apartado").value = "";
        
        modalAddProduct.style.display = "none";

        Swal.fire({
            title: 'Éxito',
            text: 'Producto añadido correctamente',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    } else {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, completa todos los campos',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
});

// Declaración de la variable productosEnCarrito
let productosEnCarrito;

// Obtiene los productos en el carrito del localStorage
let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");

if (productosEnCarritoLS) {
    productosEnCarrito = JSON.parse(productosEnCarritoLS); // Asigna los productos obtenidos a la variable productosEnCarrito
    actualizarNumerito(); // Llama a la función actualizarNumerito
} else {
    productosEnCarrito = []; // Asigna un array vacío a la variable productosEnCarrito
}

// Función para agregar un producto al carrito
function agregarAlCarrito(e) {
    const idBoton = e.currentTarget.id; // Obtiene el id del botón clicado
    const productoAgregado = productos.find(producto => producto.id === idBoton); // Busca el producto en el array de productos

    if(productosEnCarrito.some(producto => producto.id === idBoton)) {
        const index = productosEnCarrito.findIndex(producto => producto.id === idBoton); // Busca el índice del producto en el carrito
        productosEnCarrito[index].cantidad++; // Incrementa la cantidad del producto en el carrito
    } else {
        productoAgregado.cantidad = 1; // Asigna una cantidad de 1 al producto
        productosEnCarrito.push(productoAgregado); // Añade el producto al carrito
    }

    actualizarNumerito(); // Llama a la función actualizarNumerito

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito)); // Guarda el carrito en el localStorage

}

// Función para actualizar el numerito del carrito
function actualizarNumerito() {
    let nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0); // Suma las cantidades de los productos en el carrito
    numerito.innerText = nuevoNumerito; // Actualiza el texto del numerito
}

// Función para abrir el modal
function abrirModal(producto) {
    productoSeleccionado = producto;
    const modal = document.getElementById("modal-calcular-precio");
    modal.style.display = "flex";
    document.getElementById("resultado-precio").innerText = "";
    document.getElementById("agregar-al-carrito").style.display = "none";

    // Mostrar u ocultar la opción de color según la categoría del producto
    const colorContainer = document.getElementById("color-container");
    if (producto.categoria.id === "cristales") {
        colorContainer.style.display = "none";
    } else {
        colorContainer.style.display = "block";
    }

    // Mostrar u ocultar las opciones de alto y largo según la categoría del producto
    const altoContainer = document.getElementById("alto-container");
    const largoContainer = document.getElementById("largo-container");
    if (producto.categoria.id === "herrajes") {
        altoContainer.style.display = "none";
        largoContainer.style.display = "none";
    } else {
        altoContainer.style.display = "block";
        largoContainer.style.display = "block";
    }

    // Mostrar u ocultar la opción de constante adicional según la categoría del producto
    const constanteAdicionalContainer = document.getElementById("constante-adicional-container");
    if (["cristales", "mallorquinas", "mosquiteras", "persianas", "herrajes"].includes(producto.categoria.id)) {
        constanteAdicionalContainer.style.display = "none";
    } else {
        constanteAdicionalContainer.style.display = "block";
    }
}

// Función para cerrar el modal
function cerrarModal() {
    const modal = document.getElementById("modal-calcular-precio");
    modal.style.display = "none";
    productoSeleccionado = null;
}

function calcularPrecio() {
    const alto = parseFloat(document.getElementById("alto").value); 
    const largo = parseFloat(document.getElementById("largo").value);
    const color = parseFloat(document.getElementById("color").value);
    const constanteAdicional = productoSeleccionado.constanteAdicional || 0; // Obtener la constante adicional del producto

    if (isNaN(alto) || isNaN(largo) || alto <= 0 || largo <= 0) {
        document.getElementById("resultado-precio").innerText = "Por favor, introduce valores válidos.";
        return;
    }

    let precio;
    if (productoSeleccionado.categoria.id === "cristales") {
        const area = (alto/100) * (largo/100);
        precio = area * productoSeleccionado.precioAlto; // Asume que precioAlto es el precio por metro cuadrado
    } else if (["mallorquinas", "mosquiteras", "persianas"].includes(productoSeleccionado.categoria.id)) {
        // Calcular precio por metro cuadrado
        const area = (alto/100) * (largo/100);
        precio = area * productoSeleccionado.precioAlto * (1 + color / 100); // Asume que precioAlto es el precio por metro cuadrado
    } else {
        // Calcular precio por metro lineal con constante adicional
        precio = ((((alto/10) * productoSeleccionado.precioAlto) + ((largo/10) * productoSeleccionado.precioAncho))+ constanteAdicional) * (1 + color / 100);
    }

    const precioConDosDecimales = precio.toFixed(2);
    document.getElementById("resultado-precio").innerText = `Precio calculado: ${precioConDosDecimales}€`;
    document.getElementById("agregar-al-carrito").style.display = "block";
}

// Event listeners
document.getElementById("calcular-precio").addEventListener("click", calcularPrecio);
// Función para agregar al carrito con el precio calculado y las medidas
function agregarAlCarritoConPrecio() {
    const precioCalculado = parseFloat(document.getElementById("resultado-precio").innerText.replace("Precio calculado: ", "").replace("€", ""));
    const alto = parseFloat(document.getElementById("alto").value);
    const largo = parseFloat(document.getElementById("largo").value);
    const colorSelect = document.getElementById("color");
    const color = colorSelect ? colorSelect.options[colorSelect.selectedIndex].text : 'N/A';

    const productoConMedidas = {
        ...productoSeleccionado,
        precio: precioCalculado,
        alto: alto,
        ancho: largo,
        color: color,
        cantidad: 1, // Asegura que la cantidad inicial sea 1
        id: `${productoSeleccionado.id}-${Date.now()}` // Genera un ID único para cada producto
    };

    productosEnCarrito.push(productoConMedidas);
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    actualizarNumerito();
    cerrarModal();

    // Mostrar mensaje de confirmación
    Swal.fire({
        title: 'Producto añadido',
        text: 'El producto ha sido añadido al carrito correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
}

// Función para eliminar un producto con confirmación
function eliminarProducto(idProducto) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            productos = productos.filter(producto => producto.id !== idProducto);
            localStorage.setItem("productos", JSON.stringify(productos));
            cargarProductos(productos);
            Swal.fire(
                'Eliminado',
                'El producto ha sido eliminado.',
                'success'
            );
        }
    });
}

// Event listeners
document.getElementById("calcular-precio").addEventListener("click", calcularPrecio);
document.getElementById("agregar-al-carrito").addEventListener("click", agregarAlCarritoConPrecio);
document.getElementById("cerrar-modal").addEventListener("click", cerrarModal);

// Cargar productos al inicio
cargarProductos(productos);

// Función para agregar herrajes al carrito directamente
function agregarHerrajeAlCarrito(producto) {
    // Para herrajes, usamos el precio fijo establecido
    const precioHerraje = producto.precioHerraje || 0;
    
    const productoParaCarrito = {
        ...producto,
        precio: precioHerraje,
        cantidad: 1,
        id: `${producto.id}-${Date.now()}` // Genera un ID único para cada producto
    };
    
    productosEnCarrito.push(productoParaCarrito);
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    actualizarNumerito();
    
    // Mostrar mensaje de confirmación
    Swal.fire({
        title: 'Producto añadido',
        text: 'El herraje ha sido añadido al carrito correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
}
