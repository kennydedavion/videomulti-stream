const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = [];

app.use(express.static('public'));  // Serve static files (e.g., HTML, JS)

io.on('connection', (socket) => {
    // Generate a unique user ID
    const userId = socket.id;
    users.push(userId);
    console.log(`User connected: ${userId}`);

    // Send new user connection to all clients
    io.emit('new-user', userId);

    // Listen for user disconnection
    socket.on('disconnect', () => {
        users = users.filter(user => user !== userId);
        console.log(`User disconnected: ${userId}`);
        io.emit('user-disconnected', userId);
    });

    // Request for user ID (on page load)
    socket.on('request-user-id', () => {
        socket.emit('new-user', userId);
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
