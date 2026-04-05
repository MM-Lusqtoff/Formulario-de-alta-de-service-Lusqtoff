// 1. Lógica para seleccionar el Tipo de Service (Corregida)
function selectServiceType(tipo) {
    // Reseteamos estilos
    document.getElementById('card-abierto').classList.remove('selected-abierto');
    document.getElementById('card-cerrado').classList.remove('selected-cerrado');
    document.getElementById('check-abierto').innerText = '';
    document.getElementById('check-cerrado').innerText = '';

    // Aplicamos estilo al seleccionado
    if(tipo === 'abierto') {
        document.getElementById('card-abierto').classList.add('selected-abierto');
        document.getElementById('check-abierto').innerText = '✓';
    } else {
        document.getElementById('card-cerrado').classList.add('selected-cerrado');
        document.getElementById('check-cerrado').innerText = '✓';
    }

    // Ocultar error si existía
    document.getElementById('err-service-type').classList.remove('show');
}

// 2. Lógica para navegar entre los pasos
function goTo(pasoDestino) {
    let pasoActual = 1;
    if(document.getElementById('card-2').classList.contains('visible')) pasoActual = 2;
    if(document.getElementById('card-3').classList.contains('visible')) pasoActual = 3;

    if (pasoDestino > pasoActual) {
        if (!validarPaso(pasoActual)) return;
    }

    document.getElementById('card-1').classList.remove('visible');
    document.getElementById('card-2').classList.remove('visible');
    document.getElementById('card-3').classList.remove('visible');

    document.getElementById('card-' + pasoDestino).classList.add('visible');

    document.getElementById('step-num').innerText = pasoDestino;
    document.getElementById('ps1').className = pasoDestino >= 1 ? 'progress-step active' : 'progress-step';
    document.getElementById('ps2').className = pasoDestino >= 2 ? (pasoDestino > 2 ? 'progress-step done' : 'progress-step active') : 'progress-step';
    document.getElementById('ps3').className = pasoDestino >= 3 ? 'progress-step active' : 'progress-step';
    if(pasoDestino > 1) document.getElementById('ps1').className = 'progress-step done';
}

// 3. Validación
function setError(id, hayError) {
    const input = document.getElementById(id);
    const mensaje = document.getElementById('err-' + id);
    if(input) input.classList.toggle('error', hayError);
    if(mensaje) mensaje.classList.toggle('show', hayError);
}

function validarPaso(paso) {
    let esValido = true;

    if (paso === 1) {
        const serviceSeleccionado = document.querySelector('input[name="service-type"]:checked');
        if (!serviceSeleccionado) {
            document.getElementById('err-service-type').classList.add('show');
            esValido = false;
        }

        const campos = ['nombre', 'cumple', 'email', 'telefono', 'whatsapp'];
        campos.forEach(campo => {
            const valor = document.getElementById(campo).value.trim();
            setError(campo, valor === '');
            if(valor === '') esValido = false;
        });
    }

    if (paso === 2) {
        const campos = ['fantasía', 'tipo-local', 'direccion', 'localidad', 'provincia', 'dias', 'horarios'];
        campos.forEach(campo => {
            const valor = document.getElementById(campo).value.trim();
            setError(campo, valor === '');
            if(valor === '') esValido = false;
        });
    }

    return esValido;
}

// 4. ENVÍO FINAL (ACTUALIZADO CON IMÁGENES)
function submitForm() {

    const categoriasSeleccionadas = Array.from(document.querySelectorAll('#categorias input:checked')).map(cb => cb.value);
    if (categoriasSeleccionadas.length === 0) {
        document.getElementById('err-categorias').classList.add('show');
        return;
    }
    document.getElementById('err-categorias').classList.remove('show');

    const btn = document.getElementById('btnSubmit');
    btn.innerText = '⏳ Enviando datos...';
    btn.disabled = true;

    // 🆕 NUEVO: obtenemos la imagen del input
    const fileInput = document.getElementById('foto'); // ← IMPORTANTE: tiene que existir en el HTML
    const file = fileInput ? fileInput.files[0] : null;

    // 🆕 NUEVO: si hay imagen la convertimos a base64
    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const base64 = e.target.result.split(',')[1];

            // enviamos con imagen
            enviarDatos(base64, file.name);
        };

        reader.readAsDataURL(file);

    } else {
        // enviamos sin imagen
        enviarDatos(null, null);
    }

    // 🆕 NUEVA FUNCIÓN (NO EXISTÍA ANTES)
    function enviarDatos(base64, fileName) {

        const data = {
            serviceType: document.querySelector('input[name="service-type"]:checked').value,
            nombre: document.getElementById('nombre').value,
            cumple: document.getElementById('cumple').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            whatsapp: document.getElementById('whatsapp').value,
            local: document.getElementById('fantasía').value,
            tipo: document.getElementById('tipo-local').value,
            direccion: document.getElementById('direccion').value,
            localidad: document.getElementById('localidad').value,
            provincia: document.getElementById('provincia').value,
            telLocal: document.getElementById('tel-local').value,
            dias: document.getElementById('dias').value,
            horarios: document.getElementById('horarios').value,
            categorias: categoriasSeleccionadas.join(', '),
            observaciones: document.getElementById('observaciones').value,

            // 🆕 NUEVO: datos de la imagen
            foto: base64,
            nombreArchivo: fileName
        };

        const scriptURL = 'https://script.google.com/macros/s/AKfycbxDCcFNOEmtsLezzKIiAZXsfaa9rGKah3IbOTZBENW5apUxmj1bPZkG9WWySZ_kk0ulbQ/exec';

        fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(data)
        })
        .then(() => {
            
            document.getElementById('card-3').classList.remove('visible');
            document.getElementById('success').classList.add('visible');
            document.querySelector('.progress-wrap').style.display = 'none';
        })
        .catch(error => {
            alert('Hubo un error de conexión.');
            btn.innerText = '✓ Intentar de nuevo';
            btn.disabled = false;
        });
    }
}
