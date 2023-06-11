const express = require('express');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');
const mysql = require('mysql2');
const { Sequelize, DataTypes } = require('sequelize');
const { vistaPrincipal, postVistaprincipal } = require('./src/controllers/principal');

const app = express();

// Configuración de la aplicación Express
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'src/public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Passport y sesión
app.use(session({
  secret: 'markus',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Configuración de express-flash
const flash = require('express-flash');
const sequelize = require('./database/basededatos');
app.use(flash());

// Conexión a la base de datos


// Definición del modelo de usuario
const Usuario = sequelize.define('Usuario', {
  idusuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dni_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  usuario: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imagen: {
    type: DataTypes.STRING,
  },
  estado_usuario: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  idperfil: {
    type: DataTypes.INTEGER,
  },
}, {
  tableName: 'usuarios',
  timestamps: false, // Si la tabla no tiene timestamps createdAt y updatedAt
});

// Configuración de Passport y sesión
passport.use(new LocalStrategy(
  {
    usernameField: 'usuario',
    passwordField: 'password',
    passReqToCallback: true, // Pasar la solicitud a la devolución de llamada para acceder a req.flash()
  },
  async (req, usuario, password, done) => {
    try {
      const user = await Usuario.findOne({
        where: {
          usuario: usuario,
        },
      });

      if (!user || !(await bcryptjs.compare(password, user.password))) {
        req.flash('error', 'Usuario o contraseña incorrectos'); // Guardar el mensaje de error en req.flash()
        return done(null, false);
      }

      if (user.estado_usuario === 'Inactivo') {
        req.flash('error', 'Tu cuenta está inactiva'); // Guardar el mensaje de error en req.flash()
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Configuración de la serialización y deserialización del usuario
passport.serializeUser((user, done) => {
  done(null, user.idusuario);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Usuario.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});


// Middleware para verificar la autenticación
const ensureAuthenticated = (req, res, next) => {
if (req.isAuthenticated()) {
  return next();
}

res.redirect('/login');
};

// Rutas
app.get('/', (req, res) => {
// Renderiza el formulario de inicio de sesión
res.render('login', { messages: req.flash('error') }); // Pasar mensajes de error a la vista
});

app.get('/login', (req, res) => {
// Renderiza el formulario de inicio de sesión
res.render('login', { messages: req.flash('error') }); // Pasar mensajes de error a la vista
});

app.post('/login', passport.authenticate('local', {
successRedirect: '/principal',
failureRedirect: '/login',
failureFlash: true, // Habilitar mensajes flash en caso de fallo de autenticación
}));

app.get('/principal', ensureAuthenticated ,vistaPrincipal);
app.post('/principal', ensureAuthenticated ,postVistaprincipal);

app.get('/principal/prueba', ensureAuthenticated, (req, res) => {
// Esta ruta solo está disponible para usuarios autenticados
res.render('prueba');
});

app.get('/principal/prueba2', ensureAuthenticated, (req, res) => {
// Esta ruta solo está disponible para usuarios autenticados
res.render('prueba2');
});


app.get('/salir', ensureAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error al destruir la sesión:', err);
      }
      res.redirect(303, '/login');
    });
  });
});


// Resto de tus rutas...

// Sincronizar el modelo con la base de datos y luego iniciar el servidor
sequelize.sync().then(() => {
app.listen(app.get('port'), () => {
  console.log(`Servidor corriendo en el puerto ${app.get('port')}`);
});
});
