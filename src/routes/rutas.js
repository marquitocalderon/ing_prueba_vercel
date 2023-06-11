const express = require("express");
const session = require("express-session");
const pool = require("../../database/db");
const bcryptjs = require("bcryptjs");
const { vistaPerfil } = require("../controllers/admin/registrarperfiles");

const router = express.Router();

// Configurar express-session
router.use(
  session({
    secret: "tu_secreto_aqui",
    resave: false,
    saveUninitialized: true
  })
);

function protectRoute(req, res, next) {
  const user = req.session.user; // Obtener los datos del usuario de la sesión

  if (!user) {
    // Si el usuario no ha iniciado sesión, redirigir a la página de login
    return res.redirect("/login");
  }

  const idperfil = user.idperfil;

  if (
    (idperfil === 1 && req.path.startsWith("/admin")) ||
    (idperfil === 2 && req.path.startsWith("/caja")) ||
    (idperfil === 3 && req.path.startsWith("/almacen"))
  ) {
    req.userId = user.id; // Agregar el ID del usuario al objeto de solicitud (req)
    next(); // Permitir el acceso
  } else {
    // Perfil no autorizado para acceder a esta ruta
    res.redirect("/login");
  }
}

router.get("/", (req, res) => {
  res.render("login");
});

router.get("/login", (req, res) => {
  res.render("login");
});

// Enrutador de login
router.post("/login", (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.render("login", {
      message: "Por favor, ingrese usuario y contraseña"
    });
  }

  pool.query(
    "SELECT * FROM usuarios WHERE usuario = ?",
    [usuario],
    (error, results) => {
      if (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
      }

      const user = results[0];
      if (!user || !bcryptjs.compareSync(password, user.password)) {
        return res.redirect("/login");
      }

      if (user.estado === "Inactivo") {
        return res.redirect("/login");
      }

      req.session.user = user; // Almacena todos los datos del usuario en la sesión

      const idPerfil = user.idperfil;
      switch (idPerfil) {
        case 1:
          res.redirect("/admin");
          break;
        case 2:
          res.redirect("/caja");
          break;
        case 3:
          res.redirect("/almacen");
          break;
        default:
          res.redirect("/login");
      }
    }
  );
});

// Middleware de protección de rutas
router.get("/admin", protectRoute, (req, res) => {
  // Puedes acceder al ID del usuario desde req.userId
  res.render("admin");
});

router.get("/admin/perfiles", protectRoute, vistaPerfil);

router.get("/caja", protectRoute, (req, res) => {
  res.render("caja");
});

router.get("/salir", (req, res) => {
  // Eliminar la sesión del usuario
  req.session.destroy((error) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }

    // Redirigir al usuario a la página de inicio de sesión
    res.redirect("/login");
  });
});







// //doble formulario

// router.get("/doble", getDoble)
// router.post("/guardarClienteYVenta",postDoble)

module.exports = router
;
