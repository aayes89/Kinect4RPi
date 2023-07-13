const express = require('express');
const app = express();
const NodeWebcam = require('node-webcam');
const ffmpeg = require('fluent-ffmpeg');


// camera configuration
const webcamOptions = {
  width: 640,
  height: 480,
  device: '/dev/video0',
  callbackReturn: 'buffer',
  verbose: false
};
const Webcam = NodeWebcam.create(webcamOptions);

// Path for the real-time image capture
app.get('/capture', (req, res) => {
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

// Path for the real-time video capture
app.get('/video', (req,res)=>{
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Connection': 'keep-alive',
    'Transfer-Encoding': 'chunked',
});
const ffmpegCommand = ffmpeg()
    .input(webcamOptions.device)
    .inputFormat('v4l2')
    .inputOptions(['-s ' + webcamOptions.width + 'x'+ webcamOptions.height])
    .outputOptions('-preset ultrafast')
    .outputFormat('mp4')
    .videoCodec('copy')
    .outputFPS(30);

  ffmpegCommand.on('error', (err) => {
    console.error('Video broadcast error:', err.message);
  });

  ffmpegCommand.on('end', () => {
    console.log('Video broadcast finished!');
  });

  ffmpegCommand.pipe(res, { end: true });
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
