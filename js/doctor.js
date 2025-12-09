/* ==========================================================
   CARGAR INFORMACIÓN DEL DOCTOR LOGUEADO
   ========================================================== */

function obtenerSesion() {
    return JSON.parse(localStorage.getItem("sesion"));
}

let usuario = obtenerSesion();

if (!usuario || usuario.tipo !== "doctor") {
    // Si NO hay sesión o no es doctor → redirigir
    window.location.href = "../login.html";
}

// Insertar datos en la interfaz
document.addEventListener("DOMContentLoaded", () => {
    let nombreDoc = document.getElementById("doctorNombre");
    let tipoDoc = document.getElementById("doctorTipo");

    if (nombreDoc) nombreDoc.textContent = usuario.nombres + " " + usuario.apellidos;
    if (tipoDoc) tipoDoc.textContent = usuario.tipo.toUpperCase();
});

/* ==========================================================
   BASE DE DATOS LOCAL (Simulación en localStorage)
   ========================================================== */

if (!localStorage.getItem("citas")) localStorage.setItem("citas", JSON.stringify([]));
if (!localStorage.getItem("pacientesAsignados")) localStorage.setItem("pacientesAsignados", JSON.stringify([]));
if (!localStorage.getItem("reportes")) localStorage.setItem("reportes", JSON.stringify([]));
if (!localStorage.getItem("emergencias")) localStorage.setItem("emergencias", JSON.stringify([]));
if (!localStorage.getItem("chats")) localStorage.setItem("chats", JSON.stringify([]));

/* ==========================================================
   1. MOSTRAR CITAS DEL DOCTOR
   ========================================================== */

function cargarCitas() {
    let tabla = document.getElementById("tablaCitas");
    if (!tabla) return;

    let citas = JSON.parse(localStorage.getItem("citas"));

    citas
        .filter(c => c.doctor === usuario.correo)
        .forEach(cita => {
            let row = document.createElement("tr");

            row.innerHTML = `
                <td>${cita.fecha}</td>
                <td>${cita.hora}</td>
                <td>${cita.pacienteNombre}</td>
                <td>${cita.estado}</td>
            `;

            tabla.appendChild(row);
        });
}

cargarCitas();

/* ==========================================================
   2. PACIENTES ASIGNADOS
   ========================================================== */

function cargarPacientesAsignados() {
    let contenedor = document.getElementById("listaPacientes");
    if (!contenedor) return;

    let pacientes = JSON.parse(localStorage.getItem("pacientesAsignados"));

    pacientes
        .filter(p => p.doctor === usuario.correo)
        .forEach(p => {
            let item = document.createElement("div");
            item.classList.add("item");

            item.innerHTML = `
                <h3>${p.nombre}</h3>
                <p>DNI: ${p.dni}</p>
            `;

            contenedor.appendChild(item);
        });
}

cargarPacientesAsignados();

/* ==========================================================
   3. REPORTE MÉDICO
   ========================================================== */

function cargarPacientesEnSelect() {
    let select = document.getElementById("selectPacientes");
    if (!select) return;

    let pacientes = JSON.parse(localStorage.getItem("pacientesAsignados"));

    pacientes
        .filter(p => p.doctor === usuario.correo)
        .forEach(p => {
            let option = document.createElement("option");
            option.value = p.correo;
            option.textContent = p.nombre;
            select.appendChild(option);
        });
}

cargarPacientesEnSelect();

let formReporte = document.getElementById("formReporte");

if (formReporte) {
    formReporte.addEventListener("submit", function (e) {
        e.preventDefault();

        let diag = document.getElementById("diag").value;
        let obs = document.getElementById("obs").value;
        let rec = document.getElementById("rec").value;
        let pacienteCorreo = document.getElementById("selectPacientes").value;

        let reportes = JSON.parse(localStorage.getItem("reportes"));

        reportes.push({
            doctor: usuario.correo,
            paciente: pacienteCorreo,
            diagnostico: diag,
            observaciones: obs,
            recomendaciones: rec,
            fecha: new Date().toLocaleString()
        });

        localStorage.setItem("reportes", JSON.stringify(reportes));

        alert("Reporte médico guardado correctamente");
        formReporte.reset();
    });
}

/* ==========================================================
   4. EMERGENCIAS
   ========================================================== */

function cargarEmergencias() {
    let tabla = document.getElementById("tablaEmergencias");
    if (!tabla) return;

    let emergencias = JSON.parse(localStorage.getItem("emergencias"));

    emergencias.forEach((e, index) => {
        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${e.pacienteNombre}</td>
            <td>${e.hora}</td>
            <td>
                <button class="btn-atender" onclick="marcarAtendida(${index})">
                    Marcar como atendida
                </button>
            </td>
        `;

        tabla.appendChild(row);
    });
}

cargarEmergencias();

function marcarAtendida(i) {
    let emergencias = JSON.parse(localStorage.getItem("emergencias"));
    emergencias.splice(i, 1);
    localStorage.setItem("emergencias", JSON.stringify(emergencias));
    window.location.reload();
}

/* ==========================================================
   5. CHAT CON PACIENTE
   ========================================================== */

function cargarChat() {
    let contenedor = document.getElementById("chatMensajes");
    if (!contenedor) return;

    let chats = JSON.parse(localStorage.getItem("chats"));
    
    let mensajes = chats.filter(m => m.doctor === usuario.correo);

    mensajes.forEach(m => {
        let p = document.createElement("p");
        p.classList.add("msg", m.emisor);

        p.textContent = m.texto;

        contenedor.appendChild(p);
    });
}

cargarChat();

// Enviar mensaje
let btnEnviar = document.getElementById("btnEnviar");

if (btnEnviar) {
    btnEnviar.addEventListener("click", () => {
        let input = document.getElementById("inputMensaje");
        let texto = input.value.trim();
        if (texto === "") return;

        let chats = JSON.parse(localStorage.getItem("chats"));

        chats.push({
            doctor: usuario.correo,
            paciente: "cualquiera", // luego lo ajustamos
            texto: texto,
            emisor: "doctor",
            hora: new Date().toLocaleTimeString()
        });

        localStorage.setItem("chats", JSON.stringify(chats));

        input.value = "";
        cargarChat();
        window.location.reload();
    });
}
