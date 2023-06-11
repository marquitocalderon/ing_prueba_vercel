const express = require("express");
const session = require("express-session");
const pool = require("../../database/db");
const bcryptjs = require("bcryptjs");
const { vistaPerfil, postPerfil, vistaPerfilID, putVista, perfilJson } = require("../controllers/admin/registrarperfiles");
const { vistaUsuarios } = require("../controllers/admin/registrarusuarios");

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

  const idperfil = user.cargo; // Corregir el acceso al campo 'cargo' en lugar de 'idperfil'

  if (
    (idperfil === "Administrador" && req.path.startsWith("/admin")) ||
    (idperfil === "Caja" && req.path.startsWith("/caja")) ||
    (idperfil === "Almacen" && req.path.startsWith("/almacen"))
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
    "SELECT * FROM usuarios INNER JOIN perfil ON usuarios.idperfil = perfil.idperfil WHERE usuario = ?",
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

      if (user.estado_usuario === "Inactivo") {
        return res.redirect("/login");
      }

      req.session.user = {
        id: user.idusuario,
        cargo: user.cargo
      }; // Almacena el ID y cargo del usuario en la sesión
    console.log(user.cargo)
      switch (user.cargo) {
        case "Administrador":
          res.redirect("/admin");
          break;
        case "Caja":
          res.redirect("/caja");
          break;
        case "Almacen":
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
router.get("/admin/perfilesjson", protectRoute, perfilJson);
router.get("/admin/perfiles/:id", vistaPerfilID);
router.put('/admin/perfiles/:id', function (req, res) {
  const idPerfil = req.params.id; // Obtener el ID del perfil del cuerpo de la solicitud
  const nuevoCargo = req.body.cargo; // Obtener el nuevo cargo del cuerpo de la solicitud
  const estado = req.body.estado;

  // Verificar si existe otro perfil con el mismo cargo
  pool.query('SELECT * FROM perfil WHERE cargo = ? AND idperfil <> ?', [nuevoCargo, idPerfil], function (error, results, fields) {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Error al verificar el cargo del perfil" });
    } else {
      if (results.length > 0) {
        // Ya existe otro perfil con el mismo cargo, enviar una respuesta de error
        res.status(400).json({ error: "Ya existe otro perfil con el mismo cargo" });
      } else {
        // No existe otro perfil con el mismo cargo, realizar la consulta UPDATE
        pool.query('UPDATE perfil SET cargo = ?, estado = ? WHERE idperfil = ?', [nuevoCargo, estado, idPerfil], function (error, results, fields) {
          if (error) {
            console.error(error);
            res.status(500).json({ error: "Error al actualizar el perfil" });
          } else {
            // Actualización exitosa, enviar una respuesta de éxito
            console.log('Datos actualizados exitosamente');
            res.send('Datos actualizados exitosamente');
          }
        });
      }
    }
  });
});

router.get("/admin/usuarios", protectRoute, vistaUsuarios);



router.post("/admin/perfiles", postPerfil);













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
