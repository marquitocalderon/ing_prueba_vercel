const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('proyecto', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

const vistaPrincipal = (req, res) => {
  // Esta ruta solo está disponible para usuarios autenticados

  const query = 'SELECT * FROM unidad';

  sequelize
    .query(query, { type: sequelize.QueryTypes.SELECT })
    .then((results) => {
      // Renderizar los resultados en la variable "results"
      res.render('principal', { results });
    })
    .catch((error) => {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).send('Error de servidor');
    });
};

const postVistaprincipal = (req, res) => {
  // Esta ruta solo está disponible para usuarios autenticados

  const nombreUnidad = req.body.nombre_unidad;
  const estadoUnidad = req.body.estado_unidad;

  const query = 'INSERT INTO unidad (nombre_unidad, estado_unidad) VALUES (?, ?)';

  sequelize
    .query(query, { replacements: [nombreUnidad, estadoUnidad] })
    .then(() => {
      // La inserción se realizó correctamente
      res.send('Inserción exitosa');
    })
    .catch((error) => {
      console.error('Error al ejecutar la consulta:', error);
      res.status(500).send('Error de servidor');
    });
};

// Exportar las funciones
module.exports = { vistaPrincipal, postVistaprincipal };
