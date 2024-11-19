const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let users = {}; // Objekt pro uchování všech uživatelů a jejich streamů

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // Po připojení odeslat všechny dříve připojené streamy tomuto uživateli
    for (let userId in users) {
        socket.emit('user-connected', userId, users[userId].stream);
    }

    // Příjem nového streamu
    socket.on('new-connection', (data) => {
        users[socket.id] = {
            stream: data.stream,
            userId: socket.id
        };

        // Odeslání nového streamu všem ostatním uživatelům
        socket.broadcast.emit('user-connected', socket.id, data.stream);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
        delete users[socket.id];
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
