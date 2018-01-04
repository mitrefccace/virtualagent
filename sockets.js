//var config = require('./private/config.json');
var config = require('/home/centos/dat/config.json');
var decode = require('./decode');
var redis = require("redis");
const amiListener = 'amiListener';

// Contains the extension (e.g. 90001) mapped to the VRS number (e.g. 7171234567)
// Redis will double map these key values meaning both will exist
// key:value 90001:7035551234 and 7035551234:90001
var rExtensionToVrs = 'extensionToVrs';

// Create a connection to Redis
var redisClient = redis.createClient(decode(config.database_servers.redis.port), decode(config.database_servers.redis.host));

redisClient.on("error", function (err) {
	console.log("Redis connection error" + err);
});

redisClient.auth(decode(config.database_servers.redis.auth));

redisClient.on('connect', function () {
	console.log("Connected to Redis");
});

function Socket(io) {
    
    io.on('connection', (socket) => {
        console.log("Connected to Socket");

        socket.on('register-virtualagent', (extension) => {
            console.log('VA ' + extension + ' is now Registered.');

            // Save extension to the socket connection            
            socket['myExtension'] = extension;
            socket.join(extension);
            
            var jssipData = {
                "ws": "wss://"+decode(config.asterisk.sip.public)+":" + decode(config.asterisk.sip..ws_port) + "/ws",
                "sipUri": "sip:"+extension+"@"+decode(config.asterisk.sip.public),
                "pw": decode(config.asterisk.extensions.secret),
                "stun": decode(config.asterisk.sip.stun)
            };

            io.to(amiListener).emit('QueueAdd', {'extension': extension});
            io.to(socket.id).emit('registerJssip', jssipData);
        });

        socket.on('registerAMIListener', ()=> {
            socket.join(amiListener);
        });

        socket.on('newCall', (data) => {
            console.log("Firing newCall to " + data.extension);
			redisClient.hget('extensionToVrs', data.evt.connectedlinenum, function (err, callbacknum) {
                if(err){
                    console.log("Error: " + err);
				}else{
                    data.evt.callbacknum = callbacknum || data.evt.connectedlinenum;				
					io.to(data.extension).emit('newCall', data.evt);
				}
			});
        });

        socket.on('callAnswered', (channel) => {
            console.log("Call Answered");
            io.to(amiListener).emit('PlayDTMF', channel)
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
