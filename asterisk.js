var config = require('./private/config.json');
var AsteriskManager = require('asterisk-manager');
var io = require('socket.io-client');
var socket = io.connect('http://localhost:' + config.port, {
    reconnect: true
});

console.log("Asterisk configs:");
console.log("port: " + config.asterisk.port);
console.log("host: " + config.asterisk.host);
console.log("user: " + config.asterisk.user);
console.log("pass: " + config.asterisk.password);


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
    console.log(JSON.stringify(evt));
});

ami.on('hangup', function (evt) {
    console.log('\nIncoming Hangup event');
    console.log(JSON.stringify(evt));
});

ami.on('newstate', function (evt) {
    console.log('\nIncoming Newstate event');
    console.log(JSON.stringify(evt));
    
    if (evt.channelstate === "5") {
        console.log("##### INCOMING CALL RINGING, INSERT SOCKET.IO EMIT HERE");
        socket.emit("newCall", evt);
        
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