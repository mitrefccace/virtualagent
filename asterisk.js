var config = require('./private/config.json');
var AsteriskManager = require('asterisk-manager');
var io = require('socket.io-client');
var socket = io.connect('http://localhost:'+config.port, {
    reconnect: true
});


var ami = new AsteriskManager(
    config.asterisk.port,
    config.asterisk.host,
    config.asterisk.user,
    config.asterisk.password,
    true);

ami.keepConnected();

setTimeout(()=>{
    if(!ami.connected())
        console.log('Asterisk Connection Failure');
},1000);

ami.on('connect', function (evt) {
    console.log('Connected to Asterisk');
});

//socket.emit("newCall", data);

ami.on('dialend', function (evt) {
    console.log('dialend')
});

ami.on('hangup', function (evt) {
    console.log('hangup')
});

function sendAmiAction(obj) {
    ami.action(obj, function (err, res) {
        if (err) {
            logger.error('AMI Action error ' + err);
        }

    });

}
