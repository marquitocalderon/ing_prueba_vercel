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
      const fileBuffer = req.file.buffer; // Obtener el buffer del archivo
  
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
      });
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  



module.exports = { vistaUsuarios, postUsuarios };
