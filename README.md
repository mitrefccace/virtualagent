![](adsmall.png)

# Virtual Agent  

Virtual Agent is a component of ACE Direct used to record video mail. The Virtual Agent's intent is to run on an unattended browser within the call center or on a virtualized windows environment. The Virtual Agent automatically answers Video Mail Queue calls, Records the Video Stream, Uploads the video (.webm) to the Server, and Inserts a record into a mySQL database table.  

### Getting Started
To install virtual agent, follow the README.md file in the autoinstall folder. The instructions for manual install are also provided below for reference.
1. Clone this repository
1. Download and install [Node.js](https://nodejs.org/en/)
1. Install the required Node.js modules: cd into the virtualagent directory, run `npm install`
1. Move the web dependencies to the public/assets directory, run `npm run build`
1. To start the Virtual Agent node server manually, run `npm start`

### SSL Configuration
1. This software uses SSL which requires a valid key and certificate
1. The location of the SSL key and certificate is specified in the ~/dat/config.json by using the common:https:certificate and common:https:private_key parameters in the form of folder/file (e.g., /home/centos/ssl/mycert.pem and /home/centos/ssl/mykey.pem)

### Accessing the Virtual Agent
1. Go to: https://`<hostname:port>`/
1. Select the extension for the Virtual Agent
