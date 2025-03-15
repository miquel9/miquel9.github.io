// Obtiene los pedidos archivados del localStorage
let archivados = JSON.parse(localStorage.getItem("archivados")) || [];

// Selección de elementos del DOM
const contenedorArchivados = document.getElementById("contenedor-archivados");
const eliminarTodosArchivadosBtn = document.getElementById("eliminar-todos-archivados");
const searchArchivadosInput = document.getElementById("search-archivados-input");

// Función para cargar los pedidos archivados
function cargarArchivados(archivadosFiltrados = null) {
    const archivadosAMostrar = archivadosFiltrados || archivados;
    
    if (archivadosAMostrar.length > 0) {
        // Ordenar los pedidos por fecha (el más antiguo primero)
        archivadosAMostrar.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        contenedorArchivados.innerHTML = archivadosAMostrar.map((pedido) => {
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
                            <button class="restaurar-pedido" data-id="${pedido.id}" title="Restaurar pedido">
                                <i class="bi bi-arrow-counterclockwise"></i>
                            </button>
                            <button class="eliminar-archivado" data-id="${pedido.id}" title="Eliminar permanentemente">
                                <i class="bi bi-trash-fill"></i>
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

        // Añadir eventos a los botones de eliminar
        document.querySelectorAll('.eliminar-archivado').forEach(boton => {
            boton.addEventListener('click', eliminarArchivado);
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

        // Update the event listeners section in cargarArchivados function
        document.querySelectorAll('.exportar-word').forEach(boton => {
            boton.addEventListener('click', handleExportarPresupuesto);
        });

        // In the cargarArchivados function, after adding other event listeners
        document.querySelectorAll('.exportar-factura').forEach(boton => {
            boton.addEventListener('click', handleExportarFactura);
        });

        // Add this line to attach event listeners to the restore buttons
        document.querySelectorAll('.restaurar-pedido').forEach(boton => {
            boton.addEventListener('click', restaurarPedido);
        });
    } else {
        contenedorArchivados.innerHTML = "<p>No hay pedidos archivados.</p>";
    }
}

// Función para manejar la exportación a PDF
function handleExportarPDF(e) {
    const idPedido = e.currentTarget.getAttribute('data-id');
    const pedido = archivados.find(p => p.id === parseInt(idPedido));
    
    if (!pedido) return;
    
    try {
        // Usar la función de exportación desde export.js
        if (window.exportUtils && typeof window.exportUtils.exportarPedidoPDF === 'function') {
            window.exportUtils.exportarPedidoPDF(pedido);
        } else {
            throw new Error("La función de exportación a PDF no está disponible");
        }
    } catch (error) {
        console.error('Error al exportar a PDF:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo generar el PDF',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Función para manejar la exportación a Word
function handleExportarWord(e) {
    const idPedido = e.currentTarget.getAttribute('data-id');
    const pedido = archivados.find(p => p.id === parseInt(idPedido));
    
    if (!pedido) return;
    
    try {
        // Usar la función de exportación desde export.js
        if (window.exportUtils && typeof window.exportUtils.exportarPedidoWord === 'function') {
            window.exportUtils.exportarPedidoWord(pedido)
                .then(() => {
                    // Mostrar mensaje de éxito cuando el documento se genera correctamente
                    Swal.fire({
                        title: 'Presupuesto generado',
                        text: 'El documento Word ha sido generado correctamente',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                })
                .catch(error => {
                    console.error('Error al generar Word:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudo generar el documento Word',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                });
        } else {
            throw new Error("La función de exportación a Word no está disponible");
        }
    } catch (error) {
        console.error('Error al exportar a Word:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo generar el documento Word',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
}

// Función para guardar el nombre del cliente
function guardarNombreCliente(e) {
    const idPedido = e.target.getAttribute('data-id');
    const nombreCliente = e.target.value;

    archivados = archivados.map(pedido => {
        if (pedido.id === parseInt(idPedido)) {
            return { ...pedido, nombreCliente: nombreCliente };
        }
        return pedido;
    });

    localStorage.setItem("archivados", JSON.stringify(archivados));
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

    archivados = archivados.map(pedido => {
        if (pedido.id === parseInt(idPedido)) {
            return { ...pedido, telefonoCliente: telefonoCliente };
        }
        return pedido;
    });

    localStorage.setItem("archivados", JSON.stringify(archivados));
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

    archivados = archivados.map(pedido => {
        if (pedido.id === parseInt(idPedido)) {
            return { ...pedido, detallesExtras: detallesExtras };
        }
        return pedido;
    });

    localStorage.setItem("archivados", JSON.stringify(archivados));
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

    archivados = archivados.map(pedido => {
        if (pedido.id === parseInt(idPedido)) {
            return { ...pedido, emailCliente: emailCliente };
        }
        return pedido;
    });

    localStorage.setItem("archivados", JSON.stringify(archivados));
    Swal.fire({
        title: 'Información guardada', 
        text: 'El correo electrónico del cliente ha sido guardado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
    });
}

// Añade un evento input a la barra de búsqueda de pedidos archivados
if (searchArchivadosInput) {
    searchArchivadosInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm === '') {
            cargarArchivados(); // Si el término de búsqueda está vacío, mostrar todos los pedidos
        } else {
            const archivadosFiltrados = archivados.filter(pedido => {
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
            cargarArchivados(archivadosFiltrados);
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

// Función para eliminar un pedido archivado
function eliminarArchivado(e) {
    const idPedido = e.currentTarget.getAttribute('data-id');
    const pedido = archivados.find(p => p.id === parseInt(idPedido));
    
    if (!pedido) return;
    
    // Get client name or default text
    const clientName = pedido.nombreCliente || 'Cliente sin nombre';
    // Get date formatted
    const pedidoDate = new Date(pedido.fecha).toLocaleString();
    
    Swal.fire({
        title: '¿Eliminar permanentemente?',
        html: `
            <p>Estás a punto de eliminar el pedido de <strong>${clientName}</strong></p>
            <p>Fecha: ${pedidoDate}</p>
            <p>Total: ${pedido.totalConIVA.toFixed(2)}€</p>
            <p class="text-danger">Esta acción no se puede deshacer.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar permanentemente',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            archivados = archivados.filter(p => p.id !== parseInt(idPedido));
            localStorage.setItem("archivados", JSON.stringify(archivados));
            cargarArchivados();

            Swal.fire(
                'Eliminado',
                'El pedido ha sido eliminado permanentemente.',
                'success'
            );
        }
    });
}

// Add a new function to restore orders
function restaurarPedido(e) {
    const idPedido = e.currentTarget.getAttribute('data-id');
    const pedido = archivados.find(p => p.id === parseInt(idPedido));
    
    if (!pedido) return;
    
    // Get client name or default text
    const clientName = pedido.nombreCliente || 'Cliente sin nombre';
    
    Swal.fire({
        title: '¿Restaurar pedido?',
        html: `
            <p>Estás a punto de restaurar el pedido de <strong>${clientName}</strong> a la lista de pedidos activos.</p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, restaurar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Get current active orders
            let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
            
            // Add the order back to active orders
            pedidos.push(pedido);
            
            // Save updated active orders
            localStorage.setItem("pedidos", JSON.stringify(pedidos));
            
            // Remove from archived orders
            archivados = archivados.filter(p => p.id !== parseInt(idPedido));
            localStorage.setItem("archivados", JSON.stringify(archivados));
            
            // Reload archived orders
            cargarArchivados();

            Swal.fire(
                'Restaurado',
                'El pedido ha sido restaurado a la lista de pedidos activos.',
                'success'
            );
        }
    });
}

// Update the eliminarTodosArchivados function to be more informative
function eliminarTodosArchivados() {
    if (archivados.length === 0) {
        Swal.fire(
            'Sin pedidos',
            'No hay pedidos archivados para eliminar.',
            'info'
        );
        return;
    }
    
    Swal.fire({
        title: '¿Eliminar todos los pedidos archivados?',
        html: `
            <p>Estás a punto de eliminar <strong>${archivados.length} pedidos archivados</strong>.</p>
            <p class="text-danger">Esta acción no se puede deshacer.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar todos',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('archivados');
            archivados = [];
            cargarArchivados();

            Swal.fire(
                'Eliminados',
                'Todos los pedidos archivados han sido eliminados permanentemente.',
                'success'
            );
        }
    });
}

// Añade un evento click al botón de eliminar todos los pedidos archivados
eliminarTodosArchivadosBtn.addEventListener("click", eliminarTodosArchivados);

// Llama a la función cargarArchivados para cargar los pedidos archivados al inicio
cargarArchivados();

// Reemplazar la función handleExportarPresupuesto
async function handleExportarPresupuesto(e) {
    const idPedido = e.currentTarget.dataset.id;
    const pedido = archivados.find(p => p.id === parseInt(idPedido));
    
    if (!pedido) return;
    
    try {
        // Verificar si la función está disponible en el ámbito global
        if (typeof window.exportarPresupuestoWord === 'function') {
            await window.exportarPresupuestoWord(pedido);
        } else if (typeof exportarPresupuestoWord === 'function') {
            await exportarPresupuestoWord(pedido);
        } else {
            throw new Error("La función de exportación de presupuesto no está disponible");
        }
        
        Swal.fire({
            title: 'Presupuesto generado',
            text: 'El presupuesto en Word se ha creado correctamente',
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

// Actualizar la función para manejar la exportación de facturas
async function handleExportarFactura(e) {
    const idPedido = e.currentTarget.dataset.id;
    const pedido = archivados.find(p => p.id === parseInt(idPedido));
    
    if (!pedido) return;
    
    try {
        // Verificar si la función está disponible en el ámbito global
        if (typeof window.exportarFacturaWord === 'function') {
            await window.exportarFacturaWord(pedido);
        } else if (typeof exportarFacturaWord === 'function') {
            await exportarFacturaWord(pedido);
        } else {
            throw new Error("La función de exportación de factura no está disponible");
        }
        
        Swal.fire({
            title: 'Factura generada',
            text: 'La factura en Word se ha creado correctamente',
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

// Replace this at the end of the file
document.addEventListener("DOMContentLoaded", function() {
    cargarArchivados();
    
    // Add event listener for search input
    if (searchArchivadosInput) {
        // Use the existing search functionality instead of buscarArchivados
        searchArchivadosInput.addEventListener("input", (e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm === '') {
                cargarArchivados(); // If search term is empty, show all orders
            } else {
                const archivadosFiltrados = archivados.filter(pedido => {
                    // Search in client name
                    if (pedido.nombreCliente && pedido.nombreCliente.toLowerCase().includes(searchTerm)) {
                        return true;
                    }
                    
                    // Search in extras details
                    if (pedido.detallesExtras && pedido.detallesExtras.toLowerCase().includes(searchTerm)) {
                        return true;
                    }
                    
                    // Search in products
                    return pedido.productos.some(producto => 
                        producto.titulo.toLowerCase().includes(searchTerm) ||
                        (producto.color && getColorName(producto.color).toLowerCase().includes(searchTerm))
                    );
                });
                cargarArchivados(archivadosFiltrados);
            }
        });
    }
    
    // Add event listener for delete all button
    if (eliminarTodosArchivadosBtn) {
        eliminarTodosArchivadosBtn.addEventListener("click", eliminarTodosArchivados);
    }
});
