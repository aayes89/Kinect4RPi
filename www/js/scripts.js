 const video = document.getElementById('videoPlayer');
      const socket = io();

      socket.on('motion-stream', (data) => {
        const arrayBuffer = new Uint8Array(data).buffer;
        const blob = new Blob([arrayBuffer], { type: 'video/mp4' });
        const videoURL = URL.createObjectURL(blob);
        video.src = videoURL;
      });
