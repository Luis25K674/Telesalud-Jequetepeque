/* ==========================================================
   OBTENER SESIÓN ACTIVA
   ========================================================== */

function obtenerSesion() {
    return JSON.parse(localStorage.getItem("sesion"));
}

let usuario = obtenerSesion();

// Si no hay sesión → redirigir
if (!usuario || usuario.tipo !== "paciente") {
    window.location.href = "../login.html";
}


/* ==========================================================
   MOSTRAR DATOS DEL PACIENTE EN TODAS LAS PÁGINAS
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    let nombre = document.getElementById("pacienteNombre");
    let tipo = document.getElementById("pacienteTipo");

    if (nombre) nombre.textContent = usuario.nombres + " " + usuario.apellidos;
    if (tipo) tipo.textContent = usuario.tipo.toUpperCase();

    // Datos de información personal
    let infoNombre = document.getElementById("infoNombre");
    let infoCorreo = document.getElementById("infoCorreo");
    let infoDni = document.getElementById("infoDni");

    if (infoNombre) infoNombre.textContent = usuario.nombres + " " + usuario.apellidos;
    if (infoCorreo) infoCorreo.textContent = usuario.correo;
    if (infoDni) infoDni.textContent = usuario.dni;
});


/* ==========================================================
   BASES EN LOCALSTORAGE
   ========================================================== */

if (!localStorage.getItem("usuarios")) localStorage.setItem("usuarios", JSON.stringify([]));
if (!localStorage.getItem("citas")) localStorage.setItem("citas", JSON.stringify([]));
if (!localStorage.getItem("reportes")) localStorage.setItem("reportes", JSON.stringify([]));
if (!localStorage.getItem("chats")) localStorage.setItem("chats", JSON.stringify([]));
if (!localStorage.getItem("emergencias")) localStorage.setItem("emergencias", JSON.stringify([]));


/* ==========================================================
   LISTAR DOCTORES DISPONIBLES PARA RESERVAR CITA
   ========================================================== */

function cargarDoctores() {
    let contenedor = document.getElementById("listaDoctores");
    if (!contenedor) return;

    let usuarios = JSON.parse(localStorage.getItem("usuarios"));
    let doctores = usuarios.filter(u => u.tipo === "doctor");

    doctores.forEach(doc => {
        let card = document.createElement("div");
        card.classList.add("item");

        card.innerHTML = `
            <h3>${doc.nombres} ${doc.apellidos}</h3>
            <p><b>Correo:</b> ${doc.correo}</p>

            <label>Fecha:</label>
            <input type="date" id="fecha-${doc.correo}">

            <label>Hora:</label>
            <input type="time" id="hora-${doc.correo}">

            <button class="btn btn-primary" onclick="reservarCita('${doc.correo}', '${doc.nombres} ${doc.apellidos}')">
                Reservar cita
            </button>
        `;

        contenedor.appendChild(card);
    });
}

cargarDoctores();


/* ==========================================================
   RESERVAR CITA
   ========================================================== */

function reservarCita(correoDoctor, nombreDoctor) {

    let fecha = document.getElementById(`fecha-${correoDoctor}`).value;
    let hora = document.getElementById(`hora-${correoDoctor}`).value;

    if (!fecha || !hora) {
        alert("Seleccione fecha y hora.");
        return;
    }

    let citas = JSON.parse(localStorage.getItem("citas"));

    // Verificar si el doctor ya tiene cita en esa fecha y hora
    let conflicto = citas.some(c =>
        c.doctor === correoDoctor &&
        c.fecha === fecha &&
        c.hora === hora
    );

    if (conflicto) {
        alert("Ese horario ya fue reservado para este doctor.");
        return;
    }

    let nuevaCita = {
        pacienteCorreo: usuario.correo,
        pacienteNombre: usuario.nombres + " " + usuario.apellidos,
        doctor: correoDoctor,
        doctorNombre: nombreDoctor,
        fecha,
        hora,
        estado: "Pendiente"
    };

    citas.push(nuevaCita);
    localStorage.setItem("citas", JSON.stringify(citas));

    alert("Cita reservada correctamente.");
}


/* ==========================================================
   HISTORIAL MÉDICO DEL PACIENTE
   ========================================================== */

function cargarHistorial() {
    let tabla = document.getElementById("tablaHistorial");
    if (!tabla) return;

    let citas = JSON.parse(localStorage.getItem("citas"));
    let reportes = JSON.parse(localStorage.getItem("reportes"));

    let misCitas = citas.filter(c => c.pacienteCorreo === usuario.correo);

    misCitas.forEach(cita => {
        let row = document.createElement("tr");

        // Buscar si esta cita ya tiene reporte
        let reporte = reportes.find(r =>
            r.paciente === usuario.correo &&
            r.doctor === cita.doctor &&
            r.fecha.includes(cita.fecha)
        );

        row.innerHTML = `
            <td>${cita.fecha}</td>
            <td>${cita.doctorNombre}</td>
            <td>${cita.estado}</td>
            <td>${reporte ? "<button class='btn btn-light' onclick='verReporte(`" + reporte.diagnostico + "`, `" + reporte.observaciones + "`, `" + reporte.recomendaciones + "`)'>Ver</button>" : "Sin reporte"}</td>
        `;

        tabla.appendChild(row);
    });
}

cargarHistorial();


/* ==========================================================
   VER REPORTE MÉDICO (ALERTA)
   ========================================================== */

function verReporte(diag, obs, rec) {
    alert(
        "📋 REPORTE MÉDICO\n\n" +
        "Diagnóstico:\n" + diag + "\n\n" +
        "Observaciones:\n" + obs + "\n\n" +
        "Recomendaciones:\n" + rec
    );
}


/* ==========================================================
   CHAT PACIENTE → DOCTOR
   ========================================================== */

function cargarChat() {
    let contenedor = document.getElementById("chatMensajes");
    if (!contenedor) return;

    let chats = JSON.parse(localStorage.getItem("chats"));

    let mensajes = chats.filter(m =>
        m.paciente === usuario.correo
    );

    mensajes.forEach(m => {
        let p = document.createElement("p");
        p.classList.add("msg", m.emisor);
        p.textContent = m.texto;
        contenedor.appendChild(p);
    });
}

cargarChat();


/* ENVIAR MENSAJE */

let btnEnviar = document.getElementById("btnEnviar");

if (btnEnviar) {
    btnEnviar.addEventListener("click", () => {

        let input = document.getElementById("inputMensaje");
        let texto = input.value.trim();

        if (texto === "") return;

        let chats = JSON.parse(localStorage.getItem("chats"));

        chats.push({
            paciente: usuario.correo,
            doctor: "todos", // puedes cambiar a doctor asignado luego
            texto,
            emisor: "paciente",
            hora: new Date().toLocaleTimeString()
        });

        localStorage.setItem("chats", JSON.stringify(chats));

        input.value = "";
        window.location.reload();
    });
}


/* ==========================================================
   ACTIVAR ALERTA DE EMERGENCIA (SI LO USAS DESPUÉS)
   ========================================================== */

function activarEmergencia() {
    let emergencias = JSON.parse(localStorage.getItem("emergencias"));

    emergencias.push({
        pacienteCorreo: usuario.correo,
        pacienteNombre: usuario.nombres + " " + usuario.apellidos,
        hora: new Date().toLocaleTimeString()
    });

    localStorage.setItem("emergencias", JSON.stringify(emergencias));

    alert("⚠ Emergencia enviada al doctor.");
}
