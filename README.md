# Kinect4RPi

NodeJS server to capture Xbox 360 Kinect in real time on a Raspberry Pi 3b+.

# How to use
Starts:
- clone this repository
- enter `sudo npm install express node-webcam fluent-ffmpeg base-64 sqlite3 fs path cheerio`
- enter `sudo apt install fswebcam motion -y`
- enter `sudo chmod +x createDB.sh` change the data in the script according to your needs. The password must be in Base64 to work with server authentication. Use atob("desired password") in the web browser console for a quick conversion and then put it in the script to generate the database in sqlite3.
- enter `sudo sh createDB.sh`, if there's an error, create a directory with `sudo mkdir BD` on server root path and run again.
- enter `sudo service motion start` and check with `service motion status` if there any problem just give root access permission with `sudo chmod -R 777 /var/log/motion` and run again
- enter `motion start` and check on web browser if there's a live broadcast on `http://ip_raspberry:8081`, should be working right
 
Way 1:
- enter `sudo chmod +x config.sh` to give executable permission
- enter `sudo ./config.sh` or `sudo sh config.sh` and wait until RPi reboots. (videodev, gspca_main and gspca_kinect will start)


Way 2:
- enter `sudo chmod +x loadModules.sh` to grant executable permission
- enter `sudo ./loadModules.sh` or `sudo sh loadModules.sh`

Way 3:
Run these commands separately:
- `modprobe videodev`
- `modprobe gspca_main`
- `modprobe gspca_kinect`

Ends:
- check if `/dev/video0` exists and then enter `sudo node run.js`
- go to http://ip_raspberry_host:443/ then enter the "password" to access the page where the Kinect real-time transmission is shown.
- go to http://ip_raspberry_host:443/capture?type={image|video} if you want one of the behaviors only
  
# How does it work

Generate a JPG image with fswebcam and post it to the URL.
Generate a realtime stream with the motion command from the `/dev/video0` input which is easily usable in a static html page by calling it with `<img src="ip_source:motion_port">`
