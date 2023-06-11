const express = require('express')
const pool = require('./database/db')
const bodyParser = require('body-parser');
const app = express(); 


app.use(bodyParser.json());app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());



/*----------------------------------------------------------------------------------------------------------------*/

app.use('/src', express.static('src'))
app.use('/src', express.static(__dirname + '/src'))

/*
Estas líneas de código indican a la aplicación Express que utilice los archivos estáticos (como archivos CSS, imágenes, scripts) que se encuentran en el directorio "src".


POR EJEMPLO EN TU HTMK O DONDE VAS USAR PONES ESTO href="/src/css/pregunta1.css"
quedaria asi ------------->   <link rel="stylesheet" href="/src/css/pregunta1.css">
 */

/*----------------------------------------------------------------------------------------------------------------*/



/*----------------------------------------------------------------------------------------------------------------*/
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, './src/views'),
  path.join(__dirname, './src/views/admin'),
  path.join(__dirname, './src/views/caja')
]);
console.log(app.get('view engine'))

/* 
app.set('view engine', 'ejs');
ESTO SIRVE PARA EL MOTOR DE PLANTILAS PARA EL FRONTED CON QUE VAN A TRABAJAR SOLO PARA PRUEBA PUSE HBS PARA USAR POR EJEMPLOS index.ejs , pero en caso de usar hbs  solo cambiar a "ejs" a "hbs" , si pones html no te dejara

app.set('views', path.join(__dirname, './src/views'));
esto sirve para buscar la informacion del html




*/



/*----------------------------------------------------------------------------------------------------------------*/

/*----------------------------------------------------------------------------------------------------------------*/
// ENLAZAR LAS RUTAS DESDE LA CARPTA ROUTES PERO PRIMERO TIENES QUE IMPORTAR EL ARCHIVO
 const rutas = require('./src/routes/rutas');
 app.use(rutas)




/*----------------------------------------------------------------------------------------------------------------*/


//PRUEBA DE LA CONEXION A LA BASE DE DATOS MYSQL
pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      return;
    }
    else{
        console.log('Conexión a la base de datos de mysql con éxito!');
    }
})

// El puerto de local host para ver en el navegador
app.listen(3000, () => {
    console.log("El servidor esta corriendo el puerto 3000 ---> " + "http://localhost:3000/");
});