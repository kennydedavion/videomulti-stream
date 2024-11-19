const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = [];

app.use(express.static('public'));  // Obslouží statické soubory

io.on('connection', (socket) => {
    const userId = socket.id;
    users.push(userId);
    console.log(`User connected: ${userId}`);

    // Odeslání ID nového uživatele všem klientům
    io.emit('new-user', userId);

    // Zpracování odpojení uživatele
    socket.on('disconnect', () => {
        users = users.filter(user => user !== userId);
        console.log(`User disconnected: ${userId}`);
        io.emit('user-disconnected', userId);
    });

    // Poslání ID uživateli na jeho požádání
    socket.on('request-user-id', () => {
        socket.emit('new-user', userId);
    });
});

server.listen(3000, () => {
    console.log('Server běží na http://localhost:3000');
});
