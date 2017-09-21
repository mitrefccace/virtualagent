var config = require('./private/config.json');
var AsteriskManager = require('asterisk-manager');
var io = require('socket.io-client');
var decode = require('./decode');

// Array for keeping track of which Virtual Agents are registered.
var virtualAgents = [];

// Socket for communications to virtual agent
var socketPath = decode(config.protocol) + '://localhost:' + decode(config.port);
var socket = io.connect(socketPath, {
    reconnect: true,
    secure: true,
    rejectUnauthorized: false
});

console.log("Asterisk configs:");
console.log("    port: " + decode(config.asterisk.port));
console.log("    host: " + decode(config.asterisk.host));
console.log("    user: " + decode(config.asterisk.user));
console.log("    pass: " + decode(config.asterisk.amipw));


var ami = new AsteriskManager(
    decode(config.asterisk.port),
    decode(config.asterisk.host),
    decode(config.asterisk.user),
    decode(config.asterisk.password),
    true);

ami.keepConnected();

setTimeout(() => {
    if (!ami.connected())
        console.log('Asterisk Connection Failure');
}, 1000);

ami.on('connect', function (evt) {
    console.log('Connected to Asterisk');
});

ami.on('newstate', function (evt) {
    console.log('\nIncoming Newstate event');
    if (evt.channelstate === "5") {

        // Get the extension of the ringing line        
        var extString = evt.channel;
        var extension = extString.split(/[\/,-]/)[1];
        
        // Check if extension belongs to a registered Virtual Agent, else ignore the call
        if (virtualAgents.indexOf(extension) > -1) {
            console.log("##### INCOMING CALL RINGING FOR " + extension);
            
            // Emit newCall event for virtual agent to answer the call
            socket.emit("newCall", {"extension":extension, "evt": evt});

            // Force hang up after max record seconds expire, see config.json
            setTimeout(function () {
                ami.action({
                    "Action": "Hangup",
                    "ActionID": evt.uniqueid,
                    "Channel": evt.channel,
                    "Cause": 1
                }, function (err, res) {});
            }, parseInt(decode(config.videomail.maxrecordsecs)) * 1000);

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
    if (virtualAgents.indexOf(data.extension) == -1)
        virtualAgents.push(data.extension)

    // Add Agent to the MailQueue
    ami.action({
        "Action": "QueueAdd",
        "Interface": "PJSIP/" + data.extension,
        "Paused": "false",
        "Queue": "MailQueue"
    }, function (err, res) {});
}).on('QueueRemove', (data) => {
    
    // Delete from virtualAgent Array
    for (var i = virtualAgents.length - 1; i >= 0; i--) {
        if (virtualAgents[i] === data.extension) {
            virtualAgents.splice(i, 1);
        }
    }
    // Remove Agent from the MailQueue
    ami.action({
        "Action": "QueueRemove",
        "Interface": "PJSIP/" + data.extension,
        "Queue": "MailQueue"
    }, function (err, res) {});
});