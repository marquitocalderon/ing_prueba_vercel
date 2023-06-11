const express = require('express');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');

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

// Conexión a la base de datos
const sequelize = new Sequelize('bnmxuag9lgcoiibiecvm', 'uqsdhfl6trbt0nne', 'LhwQ5Tb4vrD6TJa8gk8k', {
  host: 'bnmxuag9lgcoiibiecvm-mysql.services.clever-cloud.com',
  dialect: 'mysql',
});

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

// Configuración de la estrategia de autenticación local
passport.use(new LocalStrategy(
  {
    usernameField: 'usuario',
    passwordField: 'password',
  },
  async (usuario, password, done) => {
    try {
      const [user] = await sequelize.query('SELECT * FROM usuarios WHERE usuario = :usuario', {
        replacements: { usuario },
        type: sequelize.QueryTypes.SELECT
      });

      if (!user || !(await bcryptjs.compare(password, user.password))) {
        return done(null, false, { message: 'Usuario o contraseña incorrectos' });
      }

      if (user.estado_usuario === 'Inactivo') {
        return done(null, false, { message: 'Tu cuenta está inactiva' });
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
    const [user] = await sequelize.query('SELECT * FROM usuarios WHERE idusuario = :id', {
      replacements: { id },
      type: sequelize.QueryTypes.SELECT
    });
    done(null, user);
  } catch (error) {
    done(error);
  }})

  // Middleware para verificar la autenticación
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
  res.render('login');
});

app.get('/login', (req, res) => {
  // Renderiza el formulario de inicio de sesión
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/principal',
  failureRedirect: '/login',
}));

app.get('/principal', ensureAuthenticated, (req, res) => {
  // Esta ruta solo está disponible para usuarios autenticados
  res.render('principal');
});

app.get('/principal/prueba', ensureAuthenticated, (req, res) => {
  // Esta ruta solo está disponible para usuarios autenticados
  res.render('prueba');
});
app.get('/principal/prueba2', ensureAuthenticated, (req, res) => {
  // Esta ruta solo está disponible para usuarios autenticados
  res.render('prueba2');
});

// Resto de tus rutas...

// Sincronización del modelo y conexión a la base de datos
(async () => {
  try {
    await sequelize.sync();
    console.log('Modelo Usuario sincronizado correctamente');
    
    // Aquí puedes ejecutar el código adicional que necesites

    app.listen(app.get('port'), () => {
      console.log(`Servidor corriendo en el puerto ${app.get('port')}`);
    });
  } catch (error) {
    console.error('Error al sincronizar el modelo:', error.message);
  }
})();
