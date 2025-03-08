const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from the "public" directory

let textElements = [];

io.on('connection', (socket) => {
    console.log('A user connected');

    // Emit current state to the new user
    socket.emit('currentState', textElements);

    socket.on('newText', (data) => {
        // Add the new text element to the current state
        textElements.push(data);
        // Emit to all other clients
        socket.broadcast.emit('newText', data);
    });

    socket.on('deleteText', (data) => {
        // Remove the text element from the current state
        textElements = textElements.filter((_, index) => index !== data.index);
        // Emit to all other clients
        socket.broadcast.emit('deleteText', data);
    });

    socket.on('positionChange', (data) => {
        // Update the position of the text element in the current state
        if (textElements[data.index]) {
            textElements[data.index].x = data.x;
            textElements[data.index].y = data.y;
        }
        // Emit to all other clients
        socket.broadcast.emit('positionChange', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
