var config = require('./private/config.json');
var AsteriskManager = require('asterisk-manager');
var io = require('socket.io-client');


var virtualAgents = [];

var pendingHangup = null;
var socketPath = config.protocol + '://localhost:' + config.port;
var socket = io.connect(socketPath, {
    reconnect: true,
    secure: true,
    rejectUnauthorized: false
});

console.log("Asterisk configs:");
console.log("    port: " + config.asterisk.port);
console.log("    host: " + config.asterisk.host);
console.log("    user: " + config.asterisk.user);
console.log("    pass: " + config.asterisk.password);


var ami = new AsteriskManager(
    config.asterisk.port,
    config.asterisk.host,
    config.asterisk.user,
    config.asterisk.password,
    true);

ami.keepConnected();

setTimeout(() => {
    if (!ami.connected())
        console.log('Asterisk Connection Failure');
}, 1000);

ami.on('connect', function (evt) {
    console.log('Connected to Asterisk');
});

ami.on('dialend', function (evt) {
    console.log('\nIncoming DialEnd event');
});

ami.on('hangup', function (evt) {
    console.log('\nIncoming Hangup event');
});

ami.on('newstate', function (evt) {
    console.log('\nIncoming Newstate event');
    if (evt.channelstate === "5") {
        
        var extString = evt.channel;
        var extension = extString.split(/[\/,-]/)[1];
        console.log("Incoming call for extension: " + extension);
        
        if (virtualAgents.indexOf(extension) > -1) {
            
            console.log("##### INCOMING CALL RINGING, INSERT SOCKET.IO EMIT HERE");
            socket.emit("newCall", extension);
            
            setTimeout(function () {
                ami.action({
                    "Action": "Hangup",
                    "ActionID": evt.uniqueid,
                    "Channel": evt.channel,
                    "Cause": 1
                }, function (err, res) {});
            }, config.videomail.maxrecordsecs * 1000);

        }
    }
});


/////////////////////////////////////
//      Socket Event Listeners     //
/////////////////////////////////////

socket.on('connect', () => {
    
    // Register with the Socket to join the AMI Listener Room
    socket.emit('registerAMIListener');
}).on('QueueAdd', (data) => {

    // Add the extension to the virtualAgents Array if it doesn't exist
    if (virtualAgents.indexOf(ext) == -1)
        virtualAgents.push(data.ext)

    ami.action({
        "Action": "QueueAdd",
        "Interface": "PJSIP/" + data.ext,
        "Paused": "false",
        "Queue": "MailQueue"
    }, function (err, res) {});
}).on('QueueRemove', (data) => {
    
    // Delete from virtualAgent Array
    for (var i = virtualAgents.length - 1; i >= 0; i--) {
        if (virtualAgents[i] === data.ext) {
            virtualAgents.splice(i, 1);
        }
    }

    ami.action({
        "Action": "QueueRemove",
        "Interface": "PJSIP/" + data.ext,
        "Queue": "MailQueue"
    }, function (err, res) {});
});