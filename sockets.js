function Socket(io) {
    console.log("Loaded sockets.js")
    io.on("connection", (socket) => {
        console.log("Connected to Socket");

        socket.on("register-virtualagent", () => {
            console.log('new virtualagent room');
            socket.join('virtualagent');
            //io.to(socket.id).emit('to_socket_id', "This is the id")
            //io.to('virtualagent').emit('to_room', "This is the room")
            var jssipData = {
                "ws": "wss://njsip.task3acrdemo.com/ws",
                "sipUri": "sip:80001@njsip.task3acrdemo.com",
                "pw": "1qaz1qaz",
                "stun": "stun:newstun.task3acrdemo.com:3478"
            };
            io.to(socket.id).emit('registerJssip', jssipData);
        });

        socket.on('newCall', (data) => {
            console.log("Firing newCall");
            io.emit('newCall', "ANSWER");
        });
    });
};

module.exports = Socket;