/* ==========================================================
   SISTEMA DE REGISTRO, LOGIN Y SESIÓN
   ========================================================== */

// Si nunca se creó un array de usuarios, inicializarlo
if (!localStorage.getItem("usuarios")) {
    localStorage.setItem("usuarios", JSON.stringify([]));
}

/* ==========================================================
   REGISTRO DE USUARIO
   ========================================================== */

let registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Datos del registro
        let nombres = document.getElementById("regNombres").value;
        let apellidos = document.getElementById("regApellidos").value;
        let dni = document.getElementById("regDni").value;
        let correo = document.getElementById("regCorreo").value;
        let tipo = document.getElementById("regTipo").value;
        let contrasena = document.getElementById("regContrasena").value;

        let usuarios = JSON.parse(localStorage.getItem("usuarios"));

        // Validar si el correo ya existe
        let existe = usuarios.some(u => u.correo === correo);
        if (existe) {
            alert("El correo ya está registrado.");
            return;
        }

        // Crear usuario
        let nuevoUsuario = {
            nombres,
            apellidos,
            dni,
            correo,
            tipo,
            contrasena
        };

        usuarios.push(nuevoUsuario);

        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        alert("Registro exitoso. Ahora puedes iniciar sesión.");

        // Limpiar formulario
        registerForm.reset();

        // Ir al login
        window.location.href = "login.html";
    });
}

/* ==========================================================
   LOGIN (INGRESAR)
   ========================================================== */

let loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        let correo = document.getElementById("loginCorreo").value;
        let contrasena = document.getElementById("loginContrasena").value;

        let usuarios = JSON.parse(localStorage.getItem("usuarios"));

        // Buscar usuario por correo y contraseña
        let usuario = usuarios.find(u => u.correo === correo && u.contrasena === contrasena);

        if (!usuario) {
            alert("Correo o contraseña incorrectos.");
            return;
        }

        // Guardar sesión
        localStorage.setItem("sesion", JSON.stringify(usuario));

        // Redirigir según tipo
        if (usuario.tipo === "paciente") {
            window.location.href = "paciente/dashboard_paciente.html";
        } else {
            window.location.href = "doctor/dashboard_doctor.html";
        }
    });
}

/* ==========================================================
   CERRAR SESIÓN
   ========================================================== */

function cerrarSesion() {
    localStorage.removeItem("sesion");
    window.location.href = "../login.html";
}
