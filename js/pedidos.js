// Obtiene los pedidos del localStorage
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

// Selección de elementos del DOM
const contenedorPedidos = document.getElementById("contenedor-pedidos");
const eliminarTodosPedidosBtn = document.getElementById("eliminar-todos-pedidos");
const searchPedidosInput = document.getElementById("search-pedidos-input");

// Función para cargar los pedidos
function cargarPedidos(pedidosFiltrados = null) {
    const pedidosAMostrar = pedidosFiltrados || pedidos;
    
    if (pedidosAMostrar.length > 0) {
        // Ordenar los pedidos por fecha (el más antiguo primero)
        pedidosAMostrar.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        contenedorPedidos.innerHTML = pedidosAMostrar.map((pedido) => {
            // Calcular el precio total sin IVA y el precio de los extras
            const totalSinIVA = pedido.productos.reduce((total, producto) => total + producto.precio, 0);
            const precioExtras = pedido.productos.reduce((total, producto) => total + (producto.extras || 0), 0);
        
            return `
                <div class="pedido">
                    <div class="pedido-header">
                        <h3>Pedido ${pedido.id} - ${new Date(pedido.fecha).toLocaleString()}</h3>
                        <div class="pedido-actions">
                            <button class="exportar-word" data-id="${pedido.id}">
                                <i class="bi bi-file-earmark-word"></i> Presupuesto
                            </button>
                            <button class="exportar-factura" data-id="${pedido.id}">
                                <i class="bi bi-file-earmark-text"></i> Factura
                            </button>
                            <button class="archivar-pedido" data-id="${pedido.id}" title="Archivar pedido">
                                <i class="bi bi-archive"></i>
                            </button>
                            <button class="eliminar-pedido" data-id="${pedido.id}" title="Eliminar pedido">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="cliente-info-container">
                        <input type="text" class="nombre-cliente" data-id="${pedido.id}" value="${pedido.nombreCliente || ''}" placeholder="Información del cliente">
                        <input type="text" class="telefono-cliente" data-id="${pedido.id}" value="${pedido.telefonoCliente || ''}" placeholder="Teléfono de contacto">
                    </div>
                    <input type="email" class="email-cliente" data-id="${pedido.id}" value="${pedido.emailCliente || ''}" placeholder="Correo electrónico">
                    <input type="text" class="detalles-extras" data-id="${pedido.id}" value="${pedido.detallesExtras || ''}" placeholder="Detalles de los extras">
                    <ul>
                        ${pedido.productos.map(producto => {
                            // Para productos normales (no extras)
                            if (producto.titulo !== "Extras") {
                                return `<li>
                                    ${producto.titulo} - 
                                    ${producto.alto !== undefined && producto.ancho !== undefined ? `Medidas: Alto ${producto.alto} cm, Largo ${producto.ancho} cm` : ''}
                                    ${producto.color !== undefined ? `, Color: ${getColorName(producto.color)}` : ''}
                                    , Precio: ${producto.precio.toFixed(2)}€
                                    ${producto.extras !== undefined && producto.extras > 0 ? `, Extras: ${producto.extras.toFixed(2)}€` : ''}
                                </li>`;
                            } 
                            // Para productos de tipo "Extras"
                            else {
                                return `<li>
                                    ${producto.titulo}${pedido.detallesExtras ? `: ${pedido.detallesExtras}` : ''} - Precio: ${producto.precio.toFixed(2)}€
                                </li>`;
                            }
                        }).join('')}
                    </ul>
                    <p>Precio total con IVA: ${pedido.totalConIVA.toFixed(2)}€</p>
                    <p>Precio total sin IVA: ${totalSinIVA.toFixed(2)}€</p>
                </div>
            `;
        }).join('');

        // Añadir eventos a los botones de archivar
        document.querySelectorAll('.archivar-pedido').forEach(boton => {
            boton.addEventListener('click', archivarPedido);
        });

        // Añadir eventos a los botones de eliminar
        document.querySelectorAll('.eliminar-pedido').forEach(boton => {
            boton.addEventListener('click', eliminarPedido);
        });

        // Añadir eventos a los campos de texto para guardar el nombre del cliente
        document.querySelectorAll('.nombre-cliente').forEach(input => {
            input.addEventListener('change', guardarNombreCliente);
        });

        // Añadir eventos a los campos de texto para guardar el teléfono del cliente
        document.querySelectorAll('.telefono-cliente').forEach(input => {
            input.addEventListener('change', guardarTelefonoCliente);
        });

        // Añadir eventos a los campos de texto para guardar el correo electrónico del cliente
        document.querySelectorAll('.email-cliente').forEach(input => {
            input.addEventListener('change', guardarEmailCliente);
        });

        // Añadir eventos a los campos de texto para guardar los detalles de extras
        document.querySelectorAll('.detalles-extras').forEach(input => {
            input.addEventListener('change', guardarDetallesExtras);
        });


        // En los event listeners de pedidos.js, cambiar:
        
        // Para presupuesto
        document.querySelectorAll('.exportar-word').forEach(boton => {
            boton.addEventListener('click', handleExportarPresupuesto);
        });
        
        // Para factura
        document.querySelectorAll('.exportar-factura').forEach(boton => {
            boton.addEventListener('click', handleExportarFactura);
        });
        
        // Y actualizar los handlers
        async function handleExportarPresupuesto(e) {
            const idPedido = e.currentTarget.dataset.id;
            const pedido = pedidos.find(p => p.id === parseInt(idPedido));
            await exportarPresupuestoWord(pedido);
        }
        
        async function handleExportarFactura(e) {
            const idPedido = e.currentTarget.dataset.id;
            const pedido = pedidos.find(p => p.id === parseInt(idPedido));
            await exportarFacturaWord(pedido);
        }
    } else {
        contenedorPedidos.innerHTML = "<p>No hay pedidos guardados.</p>";
    }
}

// Función para archivar un pedido
function archivarPedido(e) {
    const idPedido = e.currentTarget.getAttribute('data-id');
    console.log('ID del pedido a archivar:', idPedido);

    Swal.fire({
        title: '¿Archivar pedido?',
        text: "El pedido se moverá a la sección de archivados",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, archivar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Encontrar el pedido a archivar
            const pedidoAArchivar = pedidos.find(pedido => pedido.id === parseInt(idPedido));
            
            if (pedidoAArchivar) {
                // Obtener los pedidos archivados actuales
                let archivados = JSON.parse(localStorage.getItem("archivados")) || [];
                
                // Añadir el pedido a los archivados
                archivados.push(pedidoAArchivar);
                
                // Guardar los archivados actualizados
                localStorage.setItem("archivados", JSON.stringify(archivados));
                
                // Eliminar el pedido de la lista de pedidos activos
                pedidos = pedidos.filter(pedido => pedido.id !== parseInt(idPedido));
                localStorage.setItem("pedidos", JSON.stringify(pedidos));
                
                // Recargar la lista de pedidos
                cargarPedidos();

                Swal.fire(
                    'Archivado!',
                    'El pedido ha sido archivado correctamente.',
                    'success'
                );
            }
        }
    });
}


// Actualizar la función para exportar presupuesto a Word
async function handleExportarPresupuesto(e) {
    const idPedido = e.currentTarget.dataset.id;
    const pedido = pedidos.find(p => p.id === parseInt(idPedido));
    
    if (!pedido) return;
    
    try {
        await exportarPresupuestoWord(pedido);
        
        Swal.fire({
            title: 'Presupuesto generado',
            text: 'El presupuesto ha sido generado correctamente',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    } catch (error) {
        console.error('Error al generar presupuesto:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo generar el presupuesto: ' + error.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Actualizar la función para exportar factura a Word
async function handleExportarFactura(e) {
    const idPedido = e.currentTarget.dataset.id;
    const pedido = pedidos.find(p => p.id === parseInt(idPedido));
    
    if (!pedido) return;
    
    try {
        await exportarFacturaWord(pedido);
        
        Swal.fire({
            title: 'Factura generada',
            text: 'La factura ha sido generada correctamente',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    } catch (error) {
        console.error('Error al generar factura:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo generar la factura: ' + error.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Función para manejar la exportación de Factura
function handleExportarFactura(e) {
    const idPedido = e.currentTarget.getAttribute('data-id');
    const pedido = pedidos.find(p => p.id === parseInt(idPedido));
    
    if (!pedido) return;
    
    try {
        console.log("Intentando exportar factura...");
        console.log("facturaUtils disponible:", window.facturaUtils !== undefined);
        console.log("docx disponible:", typeof docx !== 'undefined');
        
        if (window.facturaUtils) {
            console.log("Métodos disponibles en facturaUtils:", Object.keys(window.facturaUtils));
            console.log("exportarFacturaWord es función:", typeof window.facturaUtils.exportarFacturaWord === 'function');
        } else {
            console.error("facturaUtils no está definido");
        }
        
        // Usar la función de exportación desde factura.js
        if (window.facturaUtils && typeof window.facturaUtils.exportarFacturaWord === 'function') {
            window.facturaUtils.exportarFacturaWord(pedido)
                .then(() => {
                    // Mostrar mensaje de éxito cuando el documento se genera correctamente
                    Swal.fire({
                        title: 'Factura generada',
                        text: 'La factura ha sido generada correctamente',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                })
                .catch(error => {
                    console.error('Error al generar factura:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo generar la factura: ' + error.message,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                });
        } else {
            throw new Error("La función de exportación de facturas no está disponible");
        }
    } catch (error) {
        console.error('Error al exportar factura:', error);
        console.error('Detalles del error:', error.message);
        console.error('Stack trace:', error.stack);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo generar la factura: ' + error.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Función para guardar el nombre del cliente
function guardarNombreCliente(e) {
    const idPedido = e.target.getAttribute('data-id');
    const nombreCliente = e.target.value;

    pedidos = pedidos.map(pedido => {
        if (pedido.id === parseInt(idPedido)) {
            return { ...pedido, nombreCliente: nombreCliente };
        }
        return pedido;
    });

    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    Swal.fire({
        title: 'Información guardada', 
        text: 'La información del cliente ha sido guardada correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
}

// Función para guardar el teléfono del cliente
function guardarTelefonoCliente(e) {
    const idPedido = e.target.getAttribute('data-id');
    const telefonoCliente = e.target.value;

    pedidos = pedidos.map(pedido => {
        if (pedido.id === parseInt(idPedido)) {
            return { ...pedido, telefonoCliente: telefonoCliente };
        }
        return pedido;
    });

    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    Swal.fire({
        title: 'Información guardada', 
        text: 'El teléfono del cliente ha sido guardado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
}

// Función para guardar los detalles de extras
function guardarDetallesExtras(e) {
    const idPedido = e.target.getAttribute('data-id');
    const detallesExtras = e.target.value;

    pedidos = pedidos.map(pedido => {
        if (pedido.id === parseInt(idPedido)) {
            return { ...pedido, detallesExtras: detallesExtras };
        }
        return pedido;
    });

    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    Swal.fire({
        title: 'Información guardada', 
        text: 'Los detalles de extras han sido guardados correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
}

// Función para guardar el correo electrónico del cliente
function guardarEmailCliente(e) {
    const idPedido = e.target.getAttribute('data-id');
    const emailCliente = e.target.value;

    pedidos = pedidos.map(pedido => {
        if (pedido.id === parseInt(idPedido)) {
            return { ...pedido, emailCliente: emailCliente };
        }
        return pedido;
    });

    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    Swal.fire({
        title: 'Información guardada', 
        text: 'El correo electrónico del cliente ha sido guardado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
}

// ELIMINAR ESTAS LÍNEAS:
// Añadir en la función cargarPedidos, junto con los otros event listeners:
// document.querySelectorAll('.email-cliente').forEach(input => {
//     input.addEventListener('change', guardarEmailCliente);
// });

// Añade un evento input a la barra de búsqueda de pedidos
if (searchPedidosInput) {
    searchPedidosInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm === '') {
            cargarPedidos(); // Si el término de búsqueda está vacío, mostrar todos los pedidos
        } else {
            const pedidosFiltrados = pedidos.filter(pedido => {
                // Buscar en nombre del cliente
                if (pedido.nombreCliente && pedido.nombreCliente.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                
                // Buscar en detalles de extras
                if (pedido.detallesExtras && pedido.detallesExtras.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                
                // Buscar en productos
                return pedido.productos.some(producto => 
                    producto.titulo.toLowerCase().includes(searchTerm) ||
                    (producto.color && getColorName(producto.color).toLowerCase().includes(searchTerm))
                );
            });
            cargarPedidos(pedidosFiltrados);
        }
    });
}

// Función para obtener el nombre del color con su porcentaje
function getColorName(colorValue) {
    switch(colorValue) {
        case "0":
        case 0:
            return "Blanco y plata (0%)";
        case "15":
        case 15:
            return "Bronce (15%)";
        case "35":
        case 35:
            return "Madera (35%)";
        case "25":
        case 25:
            return "Colores (25%)";
        default:
            return colorValue; // Si no coincide con ninguno, devolver el valor original
    }
}

// Función para eliminar un pedido
function eliminarPedido(e) {
    const idPedido = e.currentTarget.getAttribute('data-id');
    console.log('ID del pedido a eliminar:', idPedido);

    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo!'
    }).then((result) => {
        if (result.isConfirmed) {
            pedidos = pedidos.filter(pedido => pedido.id !== parseInt(idPedido));
            localStorage.setItem("pedidos", JSON.stringify(pedidos));
            cargarPedidos();

            Swal.fire(
                'Eliminado!',
                'El pedido ha sido eliminado.',
                'success'
            );
        }
    });
}

// Función para eliminar todos los pedidos
function eliminarTodosPedidos() {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar todos!'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('pedidos');
            pedidos = [];
            cargarPedidos();

            Swal.fire(
                'Eliminados!',
                'Todos los pedidos han sido eliminados.',
                'success'
            );
        }
    });
}
// Añade un evento click al botón de eliminar todos los pedidos
eliminarTodosPedidosBtn.addEventListener("click", eliminarTodosPedidos);

// Llama a la función cargarPedidos para cargar los pedidos al inicio
cargarPedidos();
