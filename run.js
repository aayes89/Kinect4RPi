

const express = require('express');
const app = express();
//const http = require('http');
const b64 = require('base-64');
const bd = require('sqlite3');
const fs = require('fs');
const path = require('path');
const NodeWebcam = require('node-webcam');
const ffmpeg = require('fluent-ffmpeg');
const motionRuta = "http://localhost:8081";
const port = 443;
//const outputServer ='http://localhost:443/capture?type=video.mp4';

// camera configuration
const webcamOptions = {
  width: 640,
  height: 480,
  device: '/dev/video0',
  callbackReturn: 'buffer',
  verbose: false
};
const Webcam = NodeWebcam.create(webcamOptions);


app.use(express.urlencoded({extended: true}));
// Path for real-time image or video capture
app.use(express.static('www'));
//app.use(express.static(path.join(__dirname,'www')));

app.post('/login', (req, res) => {
  const password = req.body.password;

writeToLog('The captured is: '+password);;

  const db = new bd.Database('BD/db.db', (err) => {
    if (err) {
      console.error(err.message);
writeToLog(err.message + ': Error en el servidor sqlite3');
      return res.status(500).send('Error en el servidor');
    }

    const query = `SELECT password FROM users`;
    db.get(query, [], (err, row) => {
      db.close();

      if (err) {
        console.error(err.message);
writeToLog(err.message);
        return res.status(500).send('Error en el servidor');
      }

      if (!row) {
writeToLog('No se encontró el uusuario');
        return res.send('No se encontró el usuario');
      }
writeToLog('DB pass: '+row.password);
      const encodedPassword = row.password;
writeToLog('Encoded :'+encodedPassword);
      if (password === b64.decode(encodedPassword)) {
        res.redirect('cam.html');
      } else {
        res.send('Contraseña incorrecta. Intenta nuevamente.');
      }
    });
  });
});

app.get('/capture', (req, res) => {
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
	res.sendFile(path.join(__dirname, 'www', 'cam.html'))
  /*  res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Connection': 'keep-alive',
      'Transfer-Encoding': 'chunked',
    });

ffmpeg(motionRuta)
.inputFormat('mjpeg')
//.inputOptions('-s '+webcamOptions.width+'x'+webcamOptions.height)
//.output(outputServer)
.outputOptions(['-f mpegts','-codec:v mpeg1video','-b:v 800k','-r 30','-s 640x480'])
//'-c:v','h264_omx')
.output('pipe',{end: true})
.on('data', (data)=>{
	app.emit('motion-stream',data);
})
.on('end', ()=>{
	console.log('Ha finalizado');
	writeToLog('Ha finalizado');
})
.on('start', cmdLine => console.log('start',cmdLine))
.on('error', error=>console.log('error',error))
.on('codecData',codec=>console.log('codecData',codec))
.on('stderr', stderr=>console.log('stderr',stderr))
.run();
*/

  } else {
writeToLog('Invalid type parameter');
    res.status(400).send('Invalid type parameter');
  }
});

// starts server
 const server = app.listen(port, () => {
	writeToLog('Listening on port: '+port);
	console.log('Listening on: http://localhost:'+port);
 });

// handle server interrupts
process.on('SIGINT', () => {
  server.close(() => {
writeToLog('Server stoped');
    console.log('Server stopped');
    process.exit();
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
