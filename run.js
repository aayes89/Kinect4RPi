
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bd = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const b64 = require('base-64');
const fs = require('fs');
const NodeWebcam = require('node-webcam');
const ffmpeg = require('fluent-ffmpeg');

const motionRuta = "http://localhost:8081";
const port = 443;

// camera configuration
const webcamOptions = {
  width: 640,
  height: 480,
  device: '/dev/video0',
  callbackReturn: 'buffer',
  verbose: false
};
const Webcam = NodeWebcam.create(webcamOptions);

const app = express();

// Generar una clave secreta aleatoria
function generateRandomSecret() {
  return crypto.randomBytes(32).toString('hex');
}

const secret = generateRandomSecret();

// Configurar el almacenamiento de sesiones
app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: false
}));

app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// SQLite database configuration
const dbPath = path.join(__dirname, 'BD', 'db.db');
const db = new bd.Database(dbPath);

// Configurar la estrategia de autenticación local
passport.use(new LocalStrategy(
  (username, password, done) => {
    const query = `SELECT password FROM users WHERE username = ?`;
    db.get(query, [username], (err, row) => {

      if (err) {
        return done(err);
      }

      if (!row) {
        console.log(`Intento de inicio de sesión fallido para el usuario: ${username}`);
        return done(null, false, { message: 'Usuario no encontrado' });
      }

      const dbPassword = row.password;

      if (password === b64.decode(dbPassword)) {
        console.log(`Inicio de sesión exitoso para el usuario: ${username}`);
        return done(null, { username: username });
      } else {
        console.log(`Intento de inicio de sesión fallido para el usuario: ${username}`);
        return done(null, false, { message: 'Contraseña incorrecta' });
      }
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  done(null, { username: username });
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/cam.html', // Redirigir a la página cam.html si el inicio de sesión es exitoso
  failureRedirect: '/login', // Redirigir a la página de inicio de sesión si el inicio de sesión falla
}));

// Función para asegurar que el usuario está autenticado
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login'); // Redirigir a la página de inicio de sesión si no está autenticado
  }
}
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

app.get('js/scripts.js', (req, res) => {
  res.sendFile(path.join(__dirname,'www/js','scripts.js'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

app.get('/cam.html', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'cam.html'));
});

app.get('/capture', ensureAuthenticated, (req, res) => {
  const { type } = req.query;

  if (type === 'image') {
    Webcam.capture('image', (err, buffer) => {
      if (err) {
        console.error(err);
        writeToLog(err + 'Error capturing image');
        res.status(500).send('Error capturing image');
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': buffer.length
      });
      res.end(buffer);
    });
  } else if (type === 'video') {
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'chunked',
    });

    ffmpeg(motionRuta)
      .inputFormat('mjpeg')
      .outputOptions(['-f mpegts', '-codec:v mpeg1video', '-b:v 800k', '-r 30', '-s 640x480'])
      .output('pipe', { end: true })
      .on('data', (data) => {
        app.emit('motion-stream', data);
      })
      .on('end', () => {
        console.log('Ha finalizado');
        writeToLog('Ha finalizado');
      })
      .on('start', cmdLine => console.log('start', cmdLine))
      .on('error', error => console.log('error', error))
      .on('codecData', codec => console.log('codecData', codec))
      .on('stderr', stderr => console.log('stderr', stderr))
      .run();
  } else {
    writeToLog('Invalid type parameter');
    res.status(400).send('Invalid type parameter');
  }
});

// Inicia el servidor
const server = app.listen(port, () => {
  console.log('Servidor en funcionamiento en http://localhost:' + port);
});

// Manejar interrupciones del servidor
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error al cerrar la base de datos:', err);
    }
    server.close(() => {
      console.log('Servidor detenido');
      process.exit();
    });
  });
});

function writeToLog(message) {
  const logFilePath = 'logs.txt';

  fs.appendFile(logFilePath, message + '\n', (err) => {
    if (err) {
      console.error('Error al escribir en el archivo de registro:', err);
    }
  });
}
