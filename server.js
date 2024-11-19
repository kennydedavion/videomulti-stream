const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = {}; // Uchování připojených uživatelů a jejich streamů

app.use(express.static('public'));

io.on('connection', (socket) => {
    const userId = socket.id;
    users[userId] = { socket: socket, ready: false };
    console.log(`User connected: ${userId}`);

    // Informování o novém uživateli
    io.emit('new-user', userId);

    // Přijetí informace o lokálním streamu
    socket.on('local-stream-ready', ({ userId }) => {
        if (users[userId]) {
            users[userId].ready = true;
            broadcastStream(userId);
        }
    });

    // Kontrola připojených uživatelů každou sekundu
    socket.on('check-connected-users', () => {
        // Trojitá kontrola pro synchronizaci
        for (const userId in users) {
            if (users[userId].ready) {
                io.emit('new-user', userId);
                if (users[userId].stream) {
                    io.emit('user-stream', userId, users[userId].stream);
                }
            }
        }
    });

    // Odpojení uživatele
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${userId}`);
        delete users[userId];
        io.emit('user-disconnected', userId);
    });
});

function broadcastStream(userId) {
    const user = users[userId];
    if (user && user.socket && user.ready) {
        user.socket.broadcast.emit('user-stream', userId, user.stream);
    }
}

server.listen(3000, () => {
    console.log('Server běží na http://localhost:3000');
});
