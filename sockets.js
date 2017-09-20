function Socket(io) {
    console.log("Loaded sockets.js")
    var amiListener = 'amiListener';

    io.on("connection", (socket) => {
        console.log("Connected to Socket");

        socket.on("register-virtualagent", (extension) => {
            console.log('new virtualagent room');
            socket.join(extension);
            
            var jssipData = {
                "ws": "wss://njsip.task3acrdemo.com/ws",
                "sipUri": "sip:"+extension+"@njsip.task3acrdemo.com",
                "pw": "1qaz1qaz",
                "stun": "stun:newstun.task3acrdemo.com:3478"
            };
            io.to(amiListener).emit('QueueAdd', {'extension': extension});
            io.to(socket.id).emit('registerJssip', jssipData);
        });

        socket.on("registerAMIListener", ()=> {
            socket.join(amiListener);
        });

        socket.on('newCall', (extension) => {
            console.log("Firing newCall to " + extension);
            io.to(extension).emit('newCall');
        });
    });
};

module.exports = Socket;