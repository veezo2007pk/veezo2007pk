var express = require('express'),
    app = express(),
    http = require('http'),
    socketIo = require('socket.io');

// start webserver on port 8080
var server = http.createServer(app);
var io = socketIo.listen(server);
server.listen(8080);
// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:8080");

//app.configure(function(){  
//  app.use(express.static(path.join(__dirname, 'public')));
//});


/* -------------- <socket.io> -------------- */
io.sockets.on('connection', function (socket) {
    if (!io.connected) io.connected = true;

    socket.on('new-channel', function (data) {
        onNewNamespace(data.channel, data.sender);
    });

    // Start listening for mouse move events
    socket.on('mousemove', function (data) {    
        // This line sends the event (broadcasts it)
        // to everyone except the originating client.
        io.sockets.emit('moving', data);
    });
});

function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            if (data.sender == sender) socket.broadcast.emit('message', data.data);
        });
    });
}

/* -------------- </socket.io> -------------- */
app.get('/', function (req, res) {
    //res.sendfile(__dirname + '/public/rtcpeer.html');
    res.sendfile(__dirname + '/public/index.html');
});
