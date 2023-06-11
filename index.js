const express = require('express');
const path = require('path');
const pool = require('./src/basededatos');
const session = require('express-session');


const app = express();
const router = require('./src/routes/rutas');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'src/public')));

app.use(session({
  secret: 'markus',
  resave: false,
  saveUninitialized: false,
}));



// Conexión a la base de datos
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('¡Conexión exitosa a la base de datos!');
    connection.release();
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
  }
})();

// Rutas
app.use(router);

app.listen(app.get('port'), () => {
  console.log(`Servidor corriendo en el puerto ${app.get('port')}`);
});
