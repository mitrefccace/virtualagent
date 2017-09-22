var config = require('./private/config.json');
var decode = require('./decode');
const amiListener = 'amiListener';

function Socket(io) {
    
    io.on('connection', (socket) => {
        console.log("Connected to Socket");

        socket.on('register-virtualagent', (extension) => {
            console.log('VA ' + extension + ' is now Registered.');

            // Save extension to the socket connection            
            socket['myExtension'] = extension;
            socket.join(extension);
            
            var jssipData = {
                "ws": "wss://"+decode(config.asterisk.fqdn)+"/ws",
                "sipUri": "sip:"+extension+"@"+decode(config.asterisk.fqdn),
                "pw": decode(config.asterisk.extpw),
                "stun": decode(config.asterisk.stun)
            };

            io.to(amiListener).emit('QueueAdd', {'extension': extension});
            io.to(socket.id).emit('registerJssip', jssipData);
        });

        socket.on('registerAMIListener', ()=> {
            socket.join(amiListener);
        });

        socket.on('newCall', (data) => {
            console.log("Firing newCall to " + data.extension);
            io.to(data.extension).emit('newCall', data.evt);
        });

        // Handle disconnects, removes Agents from MailQueue.
        socket.on('disconnect', () => {
            var extension = socket['myExtension'];
            console.log('VA ' + extension + ' has disconnected...');
            socket.leave(extension);
            io.to(amiListener).emit('QueueRemove', {'extension': extension});
        });
    });
};

module.exports = Socket;