# Kinect4RPi

NodeJS server to capture Xbox 360 Kinect in real time on a Raspberry Pi 3b+.
# How to use
- clone this repository
- enter `sudo npm install express node-webcam`
- enter `sudo apt install fswebcam`
 
Way 1:

- enter `sudo chmod +x config.sh` to give executable permission
- enter `sudo ./config.sh` and wait until RPi reboots. (videodev, gspca_main and gspca_kinect will start)
- check if `/dev/video0` exists and then enter `sudo node server.js`
- go to http://localhost:443/video to view a real-time captured image from the Kinect.

Way 2:

- enter `sudo chmod +x loadModules.sh` to grant executable permission
- enter `sudo ./loadModules.sh` 
- check if `/dev/video0` exists and then enter `sudo node server.js`
- go to http://localhost:443/video to view a real-time captured image from the Kinect.

Way 3:

Run these commands separately:
- `modprobe videodev`
- `modprobe gspca_main`
- `modprobe gspca_kinect`
- check if `/dev/video0` exists and then enter `sudo node server.js`
- go to http://localhost:443/video to view a real-time captured image from the Kinect.
