# Kinect4RPi

NodeJS server to capture Xbox 360 Kinect in real time on a Raspberry Pi 3b+.

# How to use
Starts:
- clone this repository
- enter `sudo npm install express node-webcam fluent-ffmpeg base-64 sqlite3 fs path cheerio`
- enter `sudo apt install fswebcam motion`
 
Way 1:
- enter `sudo chmod +x config.sh` to give executable permission
- enter `sudo ./config.sh` and wait until RPi reboots. (videodev, gspca_main and gspca_kinect will start)


Way 2:
- enter `sudo chmod +x loadModules.sh` to grant executable permission
- enter `sudo ./loadModules.sh` 

Way 3:
Run these commands separately:
- `modprobe videodev`
- `modprobe gspca_main`
- `modprobe gspca_kinect`

Ends:
- generate the sqlite database for the server, change the data on script for your needs. The password need to be on Base64 to work with the server auth. Use atob("password") on Web browser console to quick conversion and then put into database.
- check if `/dev/video0` exists and then enter `sudo node run.js`
- go to http://ip_host:443/ then enter the password to access the page where the Kinect real-time transmission is shown.
  
# How does it work

Generate a JPG image with fswebcam and post it to the URL.
Generates a realtime broadcast from `/dev/video0` input easily used on html format with `<img src="ip_source:motion_port">`
