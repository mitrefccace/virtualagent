function Socket(io) {
    io.on("connection", (socket) => {
        console.log("Connected to Admin");

        socket.on("register-virtualagent", () => {
            console.log('new virtualagent room');
            socket.join('virtualagent');
            //io.to(socket.id).emit('to_socket_id', "This is the id")
            //io.to('virtualagent').emit('to_room', "This is the room")
        });

        socket.on('event1', (data) => {
            console.log('Socket event1: ' + data);
        });
    });
};

module.exports = Socket;