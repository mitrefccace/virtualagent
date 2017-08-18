var config = require('./private/config.json');
var AsteriskManager = require('asterisk-manager');
var io = require('socket.io-client');
var socket = io.connect('http://localhost:' + config.port, {
    reconnect: true
});

console.log("Asterisk configs:");
console.log("port: " + config.asterisk.port);
console.log("port: " + config.asterisk.host);
console.log("port: " + config.asterisk.user);
console.log("port: " + config.asterisk.password);


var ami = new AsteriskManager(
    5038,
    "172.21.1.100",
    "ad-asterisk",
    "ad-asterisk",
    true);

ami.keepConnected();

setTimeout(() => {
    if (!ami.connected())
        console.log('Asterisk Connection Failure');
}, 1000);

ami.on('connect', function (evt) {
    console.log('Connected to Asterisk');

    ami.action({
        "Action": "QueueAdd",
        "Interface": "PJSIP/80001",
        "Paused": "false",
        "Queue": "MailQueue"
    }, function (err, res) {});



});

//socket.emit("newCall", data);

/*
ami.on('managerevent', function (evt) {
    console.log(JSON.stringify(evt));

});
*/

ami.on('dialend', function (evt) {
    console.log('\nIncoming DialEnd event');
});

ami.on('hangup', function (evt) {
    console.log('\nIncoming Hangup event');
});

ami.on('newstate', function (evt) {
    console.log('\nIncoming Newstate event');
    
    if (evt.channelstate === "5") {
        console.log("##### INCOMING CALL RINGING, INSERT SOCKET.IO EMIT HERE");
        
    }
});

function sendAmiAction(obj) {
    ami.action(obj, function (err, res) {
        if (err) {
            // logger.error('AMI Action error ' + err);
            console.log('AMI Action error ' + JSON.stringify(err));
        }

    });

}