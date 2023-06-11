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



module.exports = { vistaPerfil, perfilJson, postPerfil , vistaPerfilID };
