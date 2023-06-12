const pool = require("../../../database/db");
const bcryptjs = require('bcryptjs');
const cloudinary = require('cloudinary').v2;


const vistaUsuarios = (req, res) => {
    // Puedes acceder al ID del usuario desde req.userId
    pool.query(
      "SELECT usuarios.*, perfil.* FROM usuarios JOIN perfil ON usuarios.idperfil = perfil.idperfil",
      function (error, results, fields) {
        if (error) throw error;
  
        // Consulta adicional a la tabla "perfil"
        pool.query('SELECT * FROM perfil WHERE estado = "Activo"', function (errorPerfil, perfiles, fieldsPerfil) {
          if (errorPerfil) throw errorPerfil;
  
          // Agregar la URL de la imagen de Cloudinary a cada objeto de usuario
          results.forEach(user => {
            user.imagenURL = cloudinary.url(user.imagen);
          });
  
          res.render("usuarios", { usuarios: results, perfiles: perfiles });
        });
      }
    );
  };
  


// Configurar Cloudinary
cloudinary.config({
    cloud_name: 'dc4rcnqkl',
    api_key: '741854327165235',
    api_secret: 'iaeqAwrqS3Ae2VkwrO496j5Otcs'
  });

  
  const postUsuarios = async (req, res) => {
    try {
      const { dni_usuario, nombre, usuario, password, cargo } = req.body;
      const estado_usuario = "Activo";
      const fileBuffer = req.file ? req.file.buffer : null; // Obtener el buffer del archivo si se subió una imagen, de lo contrario, establecerlo como null
  
      // Verificar si el DNI ya existe en la base de datos
      const dniQuery = 'SELECT dni_usuario FROM usuarios WHERE dni_usuario = ?';
      pool.query(dniQuery, [dni_usuario], async (err, results) => {
        if (err) {
          console.error('Error al ejecutar la consulta SQL:', err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
  
        if (results.length > 0) {
          // Si se encuentra un usuario con el mismo DNI, enviar un error
          return res.status(400).json({ error: 'El DNI ya está en uso' });
        }
  
        // Encriptar la contraseña
        const hashedPassword = await bcryptjs.hash(password, 8);
  
        if (fileBuffer) {
          // Subir la imagen a Cloudinary utilizando upload_stream
          cloudinary.uploader.upload_stream({ resource_type: "auto" }, async (error, cloudinaryUpload) => {
            if (error) {
              console.error('Error al subir la imagen a Cloudinary:', error);
              return res.status(500).json({ error: 'Error interno del servidor' });
            }
  
            // Obtener la URL de la imagen subida a Cloudinary
            const imagen = cloudinaryUpload.secure_url;
  
            // Realizar la consulta SQL para insertar los datos
            const insertQuery = 'INSERT INTO usuarios (dni_usuario, nombre, usuario, password, imagen, estado_usuario, idperfil) VALUES (?, ?, ?, ?, ?, ?, ?)';
            const insertValues = [dni_usuario, nombre, usuario, hashedPassword, imagen, estado_usuario, cargo];
  
            // Ejecutar la consulta SQL de inserción
            pool.query(insertQuery, insertValues, (err, results) => {
              if (err) {
                console.error('Error al ejecutar la consulta SQL:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
              }
  
              // Enviar una respuesta exitosa
              res.json({ message: 'Datos guardados exitosamente' });
            });
          }).end(fileBuffer); // Pasar el buffer del archivo a upload_stream
        } else {
          // Si no se subió una imagen, realizar la consulta SQL sin la columna de imagen
          const insertQuery = 'INSERT INTO usuarios (dni_usuario, nombre, usuario, password, estado_usuario, idperfil) VALUES (?, ?, ?, ?, ?, ?)';
          const insertValues = [dni_usuario, nombre, usuario, hashedPassword, estado_usuario, cargo];
  
          // Ejecutar la consulta SQL de inserción
          pool.query(insertQuery, insertValues, (err, results) => {
            if (err) {
              console.error('Error al ejecutar la consulta SQL:', err);
              return res.status(500).json({ error: 'Error interno del servidor' });
            }
  
            // Enviar una respuesta exitosa
            res.json({ message: 'Datos guardados exitosamente' });
          });
        }
      });
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  

  
  

  const vistaUsuariosbyID = (req, res) => {
    const id = req.params.id;
  
    // Realizar la consulta SELECT utilizando JOIN y el ID del usuario
    pool.query('SELECT usuarios.*, perfil.* FROM usuarios JOIN perfil ON usuarios.idperfil = perfil.idperfil WHERE usuarios.idusuario = ?', [id], function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los datos" });
      } else {
        // Enviar los datos obtenidos como respuesta en formato JSON
        res.json(results);
      }
    });
  }

  const putUsuariobyUd = function (req, res) {
    const idusuario = req.params.id;
  
    try {
      const { dni_usuario, nombre, usuario, idperfil, estado_usuario } = req.body;
  
      // Comprobar si el DNI ya existe en la base de datos (excluyendo al usuario actual)
      const dniQuery = 'SELECT dni_usuario FROM usuarios WHERE dni_usuario = ? AND idusuario != ?';
      pool.query(dniQuery, [dni_usuario, idusuario], (err, dniResults) => {
        if (err) {
          console.error('Error al ejecutar la consulta SQL:', err);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
  
        if (dniResults.length > 0) {
          // Si otro usuario tiene el mismo DNI, enviar un error
          return res.status(400).json({ error: 'El DNI ya está en uso' });
        }
  
        // Actualizar el registro del usuario
        const updateQuery = 'UPDATE usuarios SET dni_usuario = ?, nombre = ?, usuario = ?, idperfil = ?, estado_usuario = ? WHERE idusuario = ?';
        const updateValues = [dni_usuario, nombre, usuario, idperfil, estado_usuario, idusuario];
        pool.query(updateQuery, updateValues, (err, updateResults) => {
          if (err) {
            console.error('Error al ejecutar la consulta SQL:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
          }
  
          // Enviar una respuesta exitosa
          res.json({ message: 'Usuario actualizado correctamente' });
        });
      });
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  
  const perfilJson2 = (req, res) => {
    // Puedes acceder al ID del usuario desde req.userId
    pool.query("SELECT * FROM perfil", function (error, results, fields) {
        if (error) {
            console.error(error);
            res.status(500).send("Error al obtener los datos");
        } else {
            // Enviar los datos obtenidos como respuesta en formato JSON
            res.json(results);
        }
    });
}
module.exports = { vistaUsuarios, postUsuarios , vistaUsuariosbyID , putUsuariobyUd , perfilJson2 };
