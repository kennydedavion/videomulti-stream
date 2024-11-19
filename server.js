const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = {};

app.use(express.static('public'));  // Obslouží statické soubory

io.on('connection', (socket) => {
    const userId = socket.id;
    users[userId] = { socket: socket };
    console.log(`User connected: ${userId}`);

    // Odeslání ID nového uživatele všem klientům
    io.emit('new-user', userId);

    // Přijmutí lokálního streamu od klienta
    socket.on('local-stream-ready', () => {
        if (users[userId]) {
            users[userId].ready = true;
            broadcastStream(userId);
        }
    });

    // Zpracování odpojení uživatele
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${userId}`);
        delete users[userId];
        io.emit('user-disconnected', userId);
    });

    // Kontrola připojených uživatelů
    socket.on('check-connected-users', () => {
        for (const userId in users) {
            if (users[userId].ready) {
                io.emit('new-user', userId);
            }
        }
    });
});

function broadcastStream(userId) {
    const user = users[userId];
    if (user && user.socket) {
        user.socket.emit('user-stream', userId, user.socket.localStream);
    }
}

server.listen(3000, () => {
    console.log('Server běží na http://localhost:3000');
});
