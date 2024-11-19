const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Umožňuje připojení z libovolné domény
    methods: ['GET', 'POST'],
  },
});

const users = {}; // Udržujeme seznam uživatelů

// Definice portu
const PORT = process.env.PORT || 3000;

// Servírování statických souborů
app.use(express.static('public'));

// Při připojení nového socketu
io.on('connection', (socket) => {
  console.log('New user connected: ' + socket.id);

  // Uložení streamu a informování ostatních klientů
  socket.on('local-stream-ready', ({ userId, stream }) => {
    users[userId] = { socketId: socket.id, stream };

    // Informujeme všechny připojené klienty
    io.emit('user-stream', userId, stream);
  });

  // Při odpojení uživatele
  socket.on('disconnect', () => {
    for (let userId in users) {
      if (users[userId].socketId === socket.id) {
        delete users[userId];
        // Informujeme všechny, že uživatel byl odpojen
        io.emit('user-disconnected', userId);
        break;
      }
    }
  });

  // Informování všech o aktuálním seznamu uživatelů po připojení nového uživatele
  socket.emit('current-users', Object.keys(users));
});

// Spuštění serveru na specifikovaném portu
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
