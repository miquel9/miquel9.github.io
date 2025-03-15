// Conversor de Word a PDF
document.addEventListener("DOMContentLoaded", function() {
    // Añadir evento al botón de conversión
    const convertBtn = document.getElementById('convert-to-pdf-btn');
    if (convertBtn) {
        convertBtn.addEventListener('click', convertirWordAPDF);
    }
});

// Función para convertir Word a PDF
function convertirWordAPDF() {
    const fileInput = document.getElementById('word-file-input');
    const statusDiv = document.getElementById('conversion-status');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, selecciona un archivo Word (.doc o .docx)',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return;
    }
    
    const wordFile = fileInput.files[0];
    const fileName = wordFile.name.replace(/\.[^/.]+$/, ""); // Nombre sin extensión
    
    // Mostrar estado de carga
    statusDiv.innerHTML = '<p>Convirtiendo archivo, por favor espere...</p>';
    
    // Mostrar diálogo de carga
    Swal.fire({
        title: 'Convirtiendo a PDF',
        text: 'Por favor espere...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append("inputFile", wordFile);
    
    // Enviar a la API de Cloudmersive
    fetch("https://api.cloudmersive.com/convert/docx/to/pdf", {
        method: "POST",
        headers: {
            "Apikey": "5ecf9f63-4cd5-4db6-9eb4-2625f7f5e319"
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error en la conversión: ${response.statusText}`);
        }
        return response.blob();
    })
    .then(pdfBlob => {
        // Crear enlace para descargar el PDF
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(pdfBlob);
        downloadLink.download = `${fileName}.pdf`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Actualizar estado
        statusDiv.innerHTML = '<p class="success">¡Conversión exitosa! El PDF ha sido descargado.</p>';
        
        // Cerrar diálogo de carga y mostrar éxito
        Swal.fire({
            title: 'PDF generado',
            text: 'El documento PDF ha sido generado correctamente',
            icon: 'success',
            confirmButtonText: 'OK'
        });
    })
    .catch(error => {
        console.error('Error al convertir a PDF:', error);
        statusDiv.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        
        Swal.fire({
            title: 'Error',
            text: 'No se pudo convertir el documento a PDF: ' + error.message,
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
}