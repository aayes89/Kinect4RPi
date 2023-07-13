const express = require('express');
const app = express();
const NodeWebcam = require('node-webcam');

// camera configuration
const webcamOptions = {
  width: 640,
  height: 480,
  device: '/dev/video0',
  callbackReturn: 'buffer',
  verbose: false
};
const Webcam = NodeWebcam.create(webcamOptions);

// Path for the real-time image
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

// starts server
const server = app.listen(8080, () => {
  console.log('Listening on: http://localhost:8080');
});

// handle server interrupts
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server stoped');
    process.exit();
  });
});
