var config = require('./private/config.json');
var AsteriskManager = require('asterisk-manager');


var ami = new AsteriskManager(
    config.asterisk.port,
    config.asterisk.host,
    config.asterisk.user,
    config.asterisk.password,
    true);

ami.keepConnected();


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