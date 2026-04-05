// ==============================
// 1. Selección de tipo de service
// ==============================
function selectServiceType(tipo) {
    document.getElementById('card-abierto').classList.remove('selected-abierto');
    document.getElementById('card-cerrado').classList.remove('selected-cerrado');
    document.getElementById('check-abierto').innerText = '';
    document.getElementById('check-cerrado').innerText = '';

    if(tipo === 'abierto') {
        document.getElementById('card-abierto').classList.add('selected-abierto');
        document.getElementById('check-abierto').innerText = '✓';
    } else {
        document.getElementById('card-cerrado').classList.add('selected-cerrado');
        document.getElementById('check-cerrado').innerText = '✓';
    }

    document.getElementById('err-service-type').classList.remove('show');
}

// ==============================
// 2. Navegación entre pasos
// ==============================
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

// ==============================
// 3. Validación
// ==============================
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

// ==============================
// 4. Subida de imagen a Cloudinary
// ==============================
async function subirImagen(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default"); // ✅ tu preset

    const res = await fetch("https://api.cloudinary.com/v1_1/ddyvr3ini/image/upload", {
        method: "POST",
        body: formData
    });

    const data = await res.json();
    return data.secure_url; // 🔥 link final
}

// ==============================
// 5. Envío final del formulario
// ==============================
async function submitForm() {

    const categoriasSeleccionadas = Array.from(document.querySelectorAll('#categorias input:checked')).map(cb => cb.value);
    if (categoriasSeleccionadas.length === 0) {
        document.getElementById('err-categorias').classList.add('show');
        return;
    }
    document.getElementById('err-categorias').classList.remove('show');

    const btn = document.getElementById('btnSubmit');
    btn.innerText = '⏳ Enviando datos...';
    btn.disabled = true;

    try {
        // 📸 Obtener imagen
        const files = document.getElementById('foto')?.files;
let imageUrls = [];

// 🔴 VALIDACIÓN (ACÁ VA)
if (files.length > 3) {
    alert("Podés subir máximo 3 imágenes");
    btn.innerText = '✓ Enviar solicitud';
    btn.disabled = false;
    return;
}

// 🟢 SUBIDA
if (files.length > 0) {
    btn.innerText = '📤 Subiendo imágenes...';

    for (let i = 0; i < files.length; i++) {
        const url = await subirImagen(files[i]);
        imageUrls.push(url);
    }
}

        // 📦 Armar datos
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
            foto: imageUrl // 🔥 ahora es URL, no base64
        };

        const scriptURL = 'https://script.google.com/macros/s/AKfycbxDCcFNOEmtsLezzKIiAZXsfaa9rGKah3IbOTZBENW5apUxmj1bPZkG9WWySZ_kk0ulbQ/exec';

        await fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors', // 🔥 evita CORS
            body: JSON.stringify(data)
        });

        // ✅ éxito
        document.getElementById('card-3').classList.remove('visible');
        document.getElementById('success').classList.add('visible');
        document.querySelector('.progress-wrap').style.display = 'none';

    } catch (error) {
        alert('Error al enviar. Probá de nuevo.');
        btn.innerText = '✓ Intentar de nuevo';
        btn.disabled = false;
        console.error(error);
    }
}
