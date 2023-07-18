
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
const bodyParser = require('body-parser');

const motionRuta = "http://localhost:8081";
const port = 443;

// Camera configuration
const webcamOptions = {
  width: 640,
  height: 480,
  device: '/dev/video0',
  callbackReturn: 'buffer',
  verbose: false
};
const Webcam = NodeWebcam.create(webcamOptions);

const app = express();

// Generate a random secret key for session storage
const secret = crypto.randomBytes(32).toString('hex');

// Configure session storage
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

// Configure local authentication strategy
passport.use(new LocalStrategy(
  (username, password, done) => {
    const query = `SELECT password FROM users WHERE username = ?`;
    db.get(query, [username], (err, row) => {
      if (err) {
        return done(err);
      }

      if (!row) {
        console.log(`Failed login attempt for user: ${username}`);
        return done(null, false, { message: 'User not found' });
      }

      const dbPassword = row.password;
      console.log('Password in database: ' + dbPassword);
      console.log('Decoded password: ' + b64.decode(dbPassword));
      console.log('Password entered: ' + password);

      if (password === b64.decode(dbPassword)) {
        console.log(`Successful login for user: ${username}`);
        return done(null, { username: username });
      } else {
        console.log(`Failed login attempt for user: ${username}`);
        return done(null, false, { message: 'Incorrect password' });
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
  successRedirect: '/cam.html',
  failureRedirect: '/login',
}));

// Function to ensure the user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

app.get('/js/scripts.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'js', 'scripts.js'));
});
app.get('/js/crud.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'js', 'crud.js'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'index.html'));
});

app.get('/cam.html', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'www', 'cam.html'));
});


app.get('/configs', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'www','backend', 'crud.html'));
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
        console.log('Finished');
        writeToLog('Finished');
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

// Route to get all users
app.get('/users', (req, res) => {
  const query = 'SELECT id, username FROM users';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching users' });
      return;
    }
    res.json(rows);
  });
});

// Route to create a new user
app.post('/users', (req, res) => {
  const { username, password } = req.body;
  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.run(query, [username,b64.encode(password)], (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error creating user' });
      return;
    }
    res.json({ message: 'User created successfully' });
  });
});

// Route to update a user by ID
app.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const { username, password } = req.body;
  const query = 'UPDATE users SET username = ?, password = ? WHERE id = ?';
  db.run(query, [username, b64.encode(password), id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error updating user' });
      return;
    }
    res.json({ message: 'User updated successfully' });
  });
});

// Route to delete a user by ID
app.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  const query = 'DELETE FROM users WHERE id = ?';
  db.run(query, [id], (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Error deleting user' });
      return;
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Start the server
const server = app.listen(port, () => {
  console.log('Server is running at http://localhost:' + port);
});

// Handle server interruptions
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing the database:', err);
    }
    server.close(() => {
      console.log('Server stopped');
      process.exit();
    });
  });
});

function writeToLog(message) {
  const logFilePath = 'logs.txt';

  fs.appendFile(logFilePath, message + '\n', (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}
