const express = require('express');
const app = express();
const NodeWebcam = require('node-webcam');

// Configuración de la cámara
const webcamOptions = {
  width: 640,
  height: 480,
  device: '/dev/video0',
  callbackReturn: 'buffer',
  verbose: false
};
const Webcam = NodeWebcam.create(webcamOptions);

// Ruta para obtener la imagen en tiempo real
app.get('/video', (req, res) => {
  Webcam.capture('image', (err, buffer) => {
    if (err) {
      console.error(err);
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': buffer.length
    });
    res.end(buffer);
  });
});

// Iniciar el servidor
const server = app.listen(443, () => {
  console.log('Servidor escuchando en el puerto 443');
});

// Manejar la interrupción del servidor
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Servidor detenido');
    process.exit();
  });
});
