const pool = require("../../../database/db");

const vistaPerfil = (req, res) => {
    // Puedes acceder al ID del usuario desde req.userId
    pool.query("SELECT * FROM perfil", function (error, results, fields) {
        if (error) {
            console.error(error);
            res.status(500).send("Error al obtener los datos");
        } else {
            // Enviar los datos obtenidos a la vista "perfil"
            res.render("perfil", { perfiles: results });
        }
    });
}

const perfilJson = (req, res) => {
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

const postPerfil = (req, res) => {
    const cargo = req.body.cargo;
    const estado = "Activo";
     


    // Verificar si el perfil ya está registrado
    pool.query(
        'SELECT * FROM perfil WHERE cargo = ?',
        [cargo],
        function (error, results, fields) {
            if (error) {
                console.error(error);
                res.status(500).send('Error al verificar el cargo');
            } else {
                if (results.length > 0) {
                    // El perfil ya está registrado
                    console.log('Perfil ya registrado');
                    res.status(400).send('El perfil ya está registrado');
                } else {
                    // El perfil no está registrado, realizar la inserción en la base de datos
                    pool.query(
                        'INSERT INTO perfil (cargo, estado) VALUES (?, ?)',
                        [cargo, estado],
                        function (error, results, fields) {
                            if (error) {
                                console.error(error);
                                res.status(500).send('Error al insertar los datos');
                            } else {
                                console.log('Datos insertados exitosamente');
                                res.send('Datos insertados exitosamente');
                            }
                        }
                    );
                }
            }
        }
    );
}


const vistaPerfilID = (req, res) =>{
    const id = req.params.id;
  
    // Realizar la consulta SELECT específica utilizando el ID
    pool.query('SELECT * FROM perfil WHERE idperfil = ?', [id], function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener los datos" });
      } else {
        // Enviar los datos obtenidos como respuesta en formato JSON
        res.json(results);
      }
    });
  }


  const putVistaPerfil = (req, res) => {
    const idPerfil = req.params.id; // Obtener el ID del perfil del cuerpo de la solicitud
    const nuevoCargo = req.body.cargo; // Obtener el nuevo cargo del cuerpo de la solicitud
    const estado = req.body.estado;
  
    console.log(idPerfil)
    // Verificar si existe otro perfil con el mismo cargo
    pool.query(
      'SELECT * FROM perfil WHERE cargo = ? AND idperfil <> ?',
      [nuevoCargo, idPerfil],
      function (error, results, fields) {
        if (error) {
          console.error(error);
          res.status(500).json({ error: "Error al verificar el cargo del perfil" });
        } else {
          if (results.length > 0) {
            // Ya existe otro perfil con el mismo cargo, enviar una respuesta de error
            res.status(400).json({ error: "Ya existe otro perfil con el mismo cargo" });
          } else {
            // No existe otro perfil con el mismo cargo, realizar la consulta UPDATE
            pool.query(
              'UPDATE perfil SET cargo = ?, estado = ? WHERE idperfil = ?',
              [nuevoCargo, estado, idPerfil],
              function (error, results, fields) {
                if (error) {
                  console.error(error);
                  res.status(500).json({ error: "Error al actualizar el perfil" });
                } else {
                  // Actualización exitosa, enviar una respuesta de éxito
                  console.log('Datos actualizados exitosamente');
                  res.send('Datos actualizados exitosamente');
                }
              }
            );
          }
        }
      }
    );
  };
  



module.exports = { vistaPerfil, perfilJson, postPerfil , vistaPerfilID , putVistaPerfil };
