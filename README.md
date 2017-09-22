# Virtual Agent  

Virtual Agent is a component of ACE Direct used to record video mail. The Virtual Agent's intent is to run on an unattended browser within the call center or on a virtualized windows environment. The Virtual Agent automatically answers Video Mail Queue calls, Records the Video Stream, Uploads the video (.webm) to the Server, and Inserts a record into a mySQL database table.  

### Getting Started
1. Clone this repository
1. Download and install [Node.js](https://nodejs.org/en/)
1. Install the required Node.js modules: cd into the virtualagent directory, run `npm install`
1. To start the Virtual Agent node server manually, run `npm start`

### SSL Configuration
1. This software uses SSL which requires a valid key and certificate
1. The location of the SSL key and certificate can be specified in the config.json by using the ssl:cert and ssl:key parameters in the form of folder/file (e.g., ssl/mycert.pem and ssl/mykey.pem)

### Configuration
1. The Virtual Agent configuration file is _private/config.json_. All values in the file are hashed using Base64 encoding for protection of sensitive information.
1. Use the _Hashconfig_ tool to modify values in the config.json file. This tool is available in a separate repo.
1. The _config.json_ file includes the following parameters:
    * _port_ - The port to use for Virtual Agent
    * _protocol_ - http or https
    * _ssl:key_ - File path for the SSL key, https only
    * _ssl:cert_ - File path for the SSL cert, https only
    * _videomail:maxrecordsecs_ - Maximum length of a videomail recording, default 95 seconds
    * _mysql:host_ - IP address for mysql server
    * _mysql:port_ - mysql port number, default 3306
    * _mysql:user_ - mysql username
    * _mysql:password_ - mysql password
    * _mysql:database_ - Database name for videomail
    * _mysql:videomailtable_ - Table name for the videomail records
    * _asterisk:port_ - Port for the Asterisk server
    * _asterisk:host_ - IP for the Asterisk server
    * _asterisk:user_ - Username for the Asterisk server
    * _asterisk:amipw_ - Password for the Asterisk server
    * _asterisk:fqdn_ - Fully Qualified Domain Name for the Asterisk server
    * _asterisk:extpw_ - Password for the Mail Queue extensions 
    * _asterisk:stun_ - The location of the stun server

### Accessing the Virtual Agent
1. Go to: https://`<hostname:port>`/
1. Select the extension for the Virtual Agent




<p align="center">
    <img src='adsmall.png'/>
</p>