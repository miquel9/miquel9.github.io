// Funciones de exportación para pedidos

// Función para exportar a Word
// Cambiar el nombre de la función en presupuesto.js
async function exportarPresupuestoWord(pedido) {
    if (!pedido) return;
    
    try {
        console.log("Iniciando exportación a Word...");
        
        // Verificar si la biblioteca está disponible
        if (typeof docx === 'undefined') {
            console.error("La biblioteca docx no está disponible");
            throw new Error("La biblioteca docx no está disponible");
        }
        
        // Cargar la imagen del logo
        let logoImageData;
        try {
            const response = await fetch("https://navarretealum.com/images/logo.png");
            logoImageData = await response.arrayBuffer();
        } catch (error) {
            console.warn("No se pudo cargar el logo, se usará texto en su lugar", error);
        }
        
        // Crear documento completo
        const doc = new docx.Document({
            styles: {
                default: {
                    document: {
                        run: {
                            font: "Arial"
                        }
                    }
                }
            },
            sections: [{
                properties: {},
                children: [
                    // Encabezado con logo y datos de la empresa
                    logoImageData ? 
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.LEFT,
                        children: [
                            new docx.ImageRun({
                                data: logoImageData,
                                transformation: {
                                    width: 600,
                                    height: 150
                                }
                            })
                        ]
                    }) :
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.LEFT,
                        children: [
                            new docx.TextRun({
                                text: "NAVARRETE HNOS ALUMINIO",
                                bold: true,
                                size: 28,
                                color: "808080" // Color gris
                            })
                        ]
                    }),
                    
                    // Línea de separación
                    new docx.Paragraph({
                        border: {
                            bottom: { color: "auto", space: 1, style: "single", size: 6 }
                        }
                    }),
                    
                    // Datos de la empresa
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "NAVARRETE HERMANOS CARPINTERÍA DE ALUMINIO SL",
                                size: 20
                            })
                        ]
                    }),
                    
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "C/ DOLORES MARQUES 25",
                                size: 20
                            })
                        ]
                    }),
                    
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "46020 VALENCIA (Valencia)",
                                size: 20
                            })
                        ]
                    }),
                    
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Tel.: 963620916/656817520",
                                size: 20
                            })
                        ]
                    }),
                    
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "info@navarretealum.com",
                                size: 20
                            })
                        ]
                    }),
                    
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "www.navarretealum.com",
                                size: 20
                            })
                        ]
                    }),
                    
                    // Espacio
                    new docx.Paragraph({}),
                    
                    // Tabla con información del presupuesto y cliente
                    new docx.Table({
                        width: {
                            size: 100,
                            type: "pct"
                        },
                        borders: {
                            top: { style: docx.BorderStyle.SINGLE, size: 1 },
                            bottom: { style: docx.BorderStyle.SINGLE, size: 1 },
                            left: { style: docx.BorderStyle.SINGLE, size: 1 },
                            right: { style: docx.BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: docx.BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: docx.BorderStyle.SINGLE, size: 1 }
                        },
                        rows: [
                            new docx.TableRow({
                                children: [
                                    new docx.TableCell({
                                        width: {
                                            size: 50,
                                            type: "pct"
                                        },
                                        children: [
                                            new docx.Paragraph({
                                                children: [
                                                    new docx.TextRun({
                                                        text: "Nº PRESUPUESTO",
                                                        bold: true,
                                                        size: 20
                                                    })
                                                ]
                                            }),
                                            new docx.Paragraph({
                                                children: [
                                                    new docx.TextRun({
                                                        text: `A-${String(pedido.id).padStart(5, '0')}`,
                                                        size: 20
                                                    })
                                                ]
                                            })
                                        ]
                                    }),
                                    new docx.TableCell({
                                        width: {
                                            size: 50,
                                            type: "pct"
                                        },
                                        children: [
                                            new docx.Paragraph({
                                                children: [
                                                    new docx.TextRun({
                                                        text: "Fecha",
                                                        bold: true,
                                                        size: 20
                                                    })
                                                ]
                                            }),
                                            new docx.Paragraph({
                                                children: [
                                                    new docx.TextRun({
                                                        text: `${new Date(pedido.fecha).toLocaleDateString()}`,
                                                        size: 20
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            }),
                            new docx.TableRow({
                                children: [
                                    new docx.TableCell({
                                        columnSpan: 2,
                                        children: [
                                            new docx.Paragraph({
                                                children: [
                                                    new docx.TextRun({
                                                        text: `${pedido.nombreCliente || 'Sin especificar'}`,
                                                        bold: true,
                                                        size: 20
                                                    })
                                                ]
                                            }),
                                            new docx.Paragraph({
                                                children: [
                                                    new docx.TextRun({
                                                        text: `Tel: ${pedido.telefonoCliente || ''}`,
                                                        size: 20
                                                    })
                                                ]
                                            }),
                                            new docx.Paragraph({
                                                children: [
                                                    new docx.TextRun({
                                                        text: `Email: ${pedido.emailCliente || ''}`,
                                                        size: 20
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ]
                            })
                        ]
                    }),
                    
                    // Espacio
                    new docx.Paragraph({}),
                    
                    // Tabla de productos
                    new docx.Table({
                        width: {
                            size: 100,
                            type: "pct"
                        },
                        borders: {
                            top: { style: docx.BorderStyle.SINGLE, size: 1 },
                            bottom: { style: docx.BorderStyle.SINGLE, size: 1 },
                            left: { style: docx.BorderStyle.SINGLE, size: 1 },
                            right: { style: docx.BorderStyle.SINGLE, size: 1 },
                            insideHorizontal: { style: docx.BorderStyle.SINGLE, size: 1 },
                            insideVertical: { style: docx.BorderStyle.SINGLE, size: 1 }
                        },
                        rows: [
                            // Encabezados
                            new docx.TableRow({
                                children: [
                                    new docx.TableCell({
                                        width: {
                                            size: 15,
                                            type: "pct"
                                        },
                                        children: [new docx.Paragraph({
                                            children: [new docx.TextRun({ text: "Referencia", bold: true })]
                                        })]
                                    }),
                                    new docx.TableCell({
                                        width: {
                                            size: 45,
                                            type: "pct"
                                        },
                                        children: [new docx.Paragraph({
                                            children: [new docx.TextRun({ text: "Descripción", bold: true })]
                                        })]
                                    }),
                                    new docx.TableCell({
                                        width: {
                                            size: 10,
                                            type: "pct"
                                        },
                                        children: [new docx.Paragraph({
                                            children: [new docx.TextRun({ text: "Cant.", bold: true })]
                                        })]
                                    }),
                                    new docx.TableCell({
                                        width: {
                                            size: 10,
                                            type: "pct"
                                        },
                                        children: [new docx.Paragraph({
                                            children: [new docx.TextRun({ text: "€/U", bold: true })]
                                        })]
                                    }),
                                    new docx.TableCell({
                                        width: {
                                            size: 10,
                                            type: "pct"
                                        },
                                        children: [new docx.Paragraph({
                                            children: [new docx.TextRun({ text: "€/SubT", bold: true })]
                                        })]
                                    }),
                                    new docx.TableCell({
                                        width: {
                                            size: 10,
                                            type: "pct"
                                        },
                                        children: [new docx.Paragraph({
                                            children: [new docx.TextRun({ text: "B.Imp.", bold: true })]
                                        })]
                                    })
                                ]
                            }),
                            
                            // Filas de productos
                            ...pedido.productos.filter(producto => producto.titulo !== "Extras").map((producto, index) => {
                                let descripcion = producto.titulo;
                                if (producto.alto !== undefined && producto.ancho !== undefined) {
                                    descripcion += ` de ${producto.alto}x${producto.ancho}cm`;
                                }
                                if (producto.color) {
                                    descripcion += `, ${producto.color}`;
                                }
                                
                                return new docx.TableRow({
                                    children: [
                                        new docx.TableCell({
                                            children: [new docx.Paragraph({
                                                children: [new docx.TextRun({ text: `PROD${index + 1}` })]
                                            })]
                                        }),
                                        new docx.TableCell({
                                            children: [new docx.Paragraph({
                                                children: [new docx.TextRun({ text: descripcion })]
                                            })]
                                        }),
                                        new docx.TableCell({
                                            children: [new docx.Paragraph({
                                                alignment: docx.AlignmentType.CENTER,
                                                children: [new docx.TextRun({ text: "1.00" })]
                                            })]
                                        }),
                                        new docx.TableCell({
                                            children: [
                                                new docx.Paragraph({
                                                    alignment: docx.AlignmentType.RIGHT,
                                                    children: [new docx.TextRun({ text: `${producto.precio.toFixed(2)}` })]
                                                })
                                            ]
                                        }),
                                        new docx.TableCell({
                                            children: [
                                                new docx.Paragraph({
                                                    alignment: docx.AlignmentType.RIGHT,
                                                    children: [new docx.TextRun({ text: `${producto.precio.toFixed(2)}` })]
                                                })
                                            ]
                                        }),
                                        new docx.TableCell({
                                            children: [
                                                new docx.Paragraph({
                                                    alignment: docx.AlignmentType.RIGHT,
                                                    children: [new docx.TextRun({ text: `${producto.precio.toFixed(2)}` })]
                                                })
                                            ]
                                        })
                                    ]
                                });
                            }),
                            
                            // Añadir una única fila para los extras
                            ...(pedido.productos.some(p => p.titulo === "Extras") ? [
                                new docx.TableRow({
                                    children: [
                                        new docx.TableCell({
                                            children: [new docx.Paragraph({
                                                children: [new docx.TextRun({ text: "OTROS" })]
                                            })]
                                        }),
                                        new docx.TableCell({
                                            children: [new docx.Paragraph({
                                                children: [new docx.TextRun({ text: `Extras: ${pedido.detallesExtras || "-"}` })]
                                            })]
                                        }),
                                        new docx.TableCell({
                                            children: [new docx.Paragraph({
                                                alignment: docx.AlignmentType.CENTER,
                                                children: [new docx.TextRun({ text: "1.00" })]
                                            })]
                                        }),
                                        new docx.TableCell({
                                            children: [
                                                new docx.Paragraph({
                                                    alignment: docx.AlignmentType.RIGHT,
                                                    children: [new docx.TextRun({ 
                                                        text: `${pedido.productos.filter(p => p.titulo === "Extras").reduce((total, p) => total + p.precio, 0).toFixed(2)}` 
                                                    })]
                                                })
                                            ]
                                        }),
                                        new docx.TableCell({
                                            children: [
                                                new docx.Paragraph({
                                                    alignment: docx.AlignmentType.RIGHT,
                                                    children: [new docx.TextRun({ 
                                                        text: `${pedido.productos.filter(p => p.titulo === "Extras").reduce((total, p) => total + p.precio, 0).toFixed(2)}` 
                                                    })]
                                                })
                                            ]
                                        }),
                                        new docx.TableCell({
                                            children: [
                                                new docx.Paragraph({
                                                    alignment: docx.AlignmentType.RIGHT,
                                                    children: [new docx.TextRun({ 
                                                        text: `${pedido.productos.filter(p => p.titulo === "Extras").reduce((total, p) => total + p.precio, 0).toFixed(2)}` 
                                                    })]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ] : []),
                        ]
                    }),
                    
                    // Espacio
                    new docx.Paragraph({}),
                    
                    // Tabla de totales
                    new docx.Table({
                        width: {
                            size: 100,
                            type: "pct"
                        },
                        borders: {
                            top: { style: docx.BorderStyle.SINGLE, size: 1 },
                            bottom: { style: docx.BorderStyle.SINGLE, size: 1 },
                            left: { style: docx.BorderStyle.SINGLE, size: 1 },
                            right: { style: docx.BorderStyle.SINGLE, size: 1 }
                        },
                        rows: [
                            new docx.TableRow({
                                children: [
                                    new docx.TableCell({
                                        width: {
                                            size: 25,
                                            type: "pct"
                                        },
                                        children: [new docx.Paragraph({
                                            children: [new docx.TextRun({ text: "Base Imponible", bold: true })]
                                        })]
                                    }),
                                    new docx.TableCell({
                                        width: {
                                            size: 25,
                                            type: "pct"
                                        },
                                        children: [new docx.Paragraph({
                                            children: [new docx.TextRun({ text: "% I.V.A.", bold: true })]
                                        })]
                                    }),
                                    new docx.TableCell({
                                        width: {
                                            size: 25,
                                            type: "pct"
                                        },
                                        children: [new docx.Paragraph({
                                            children: [new docx.TextRun({ text: "I.V.A.", bold: true })]
                                        })]
                                    }),
                                    new docx.TableCell({
                                        width: {
                                            size: 25,
                                            type: "pct"
                                        },
                                        children: [new docx.Paragraph({
                                            children: [new docx.TextRun({ text: "TOTAL", bold: true })]
                                        })]
                                    })
                                ]
                            }),
                            new docx.TableRow({
                                children: [
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({
                                            alignment: docx.AlignmentType.CENTER,
                                            children: [new docx.TextRun({ 
                                                text: `${pedido.productos.reduce((total, producto) => total + producto.precio, 0).toFixed(2)}€` 
                                            })]
                                        })]
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({
                                            alignment: docx.AlignmentType.CENTER,
                                            children: [new docx.TextRun({ text: "21%" })]
                                        })]
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({
                                            alignment: docx.AlignmentType.CENTER,
                                            children: [new docx.TextRun({ 
                                                text: `${(pedido.totalConIVA - pedido.productos.reduce((total, producto) => total + producto.precio, 0)).toFixed(2)}€` 
                                            })]
                                        })]
                                    }),
                                    new docx.TableCell({
                                        children: [new docx.Paragraph({
                                            alignment: docx.AlignmentType.CENTER,
                                            children: [new docx.TextRun({ 
                                                text: `${pedido.totalConIVA.toFixed(2)}€`,
                                                bold: true
                                            })]
                                        })]
                                    })
                                ]
                            })
                        ]
                    }),
                    
                    // Espacio
                    new docx.Paragraph({}),
                    
                    // Forma de pago
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Forma de pago:",
                                bold: true,
                                size: 22
                            })
                        ]
                    }),
                    
                    // Espacio
                    new docx.Paragraph({}),
                    
                    // Banco / C.C.C.
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Banco / C.C.C.:",
                                bold: true,
                                size: 22
                            })
                        ]
                    }),
                    
                    // Espacio
                    new docx.Paragraph({}),
                    new docx.Paragraph({}),
                    
                    // Observaciones
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Observaciones:",
                                bold: true,
                                size: 22
                            })
                        ]
                    }),
                    
                    // Espacio
                    new docx.Paragraph({}),
                    
                    // Pie de página
                    new docx.Paragraph({
                        alignment: docx.AlignmentType.CENTER,
                        children: [
                            new docx.TextRun({
                                text: "Este presupuesto tiene una validez de 30 días.",
                                italics: true,
                                size: 20
                            })
                        ]
                    })
                ]
            }]
        });
        
        // Generar el blob y descargarlo
        // Modify the return statement in exportarPresupuestoWord
        return docx.Packer.toBlob(doc).then(blob => {
            console.log("Documento generado, intentando descargar...");
            
            // Crear un enlace de descarga y hacer clic en él
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style.display = "none";
            a.href = url;
            a.download = `Presupuesto_${pedido.nombreCliente || 'Cliente'}_${new Date().toLocaleDateString().replace(/\//g, '-')}.docx`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            // Add success message
            Swal.fire({
                title: 'Presupuesto generado',
                text: 'El presupuesto en Word se ha creado correctamente',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            
            return true;
        });
    } catch (error) {
        console.error('Error al generar Word:', error);
        throw error;
    }
}

// Al final del archivo, añadir:
// Hacer que la función sea accesible globalmente
window.exportarPresupuestoWord = exportarPresupuestoWord;

// Exportar las funciones
window.exportUtils = {
    exportarPedidoWord: exportarPedidoWord,
};