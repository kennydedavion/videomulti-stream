const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Nastavení statické složky pro soubory
app.use(express.static(path.join(__dirname, 'public')));

// Správa připojení WebSocketů
let users = 0;

io.on('connection', (socket) => {
  users++;
  io.emit('userCount', users);

  socket.on('disconnect', () => {
    users--;
    io.emit('userCount', users);
  });

  // Správa přenosu streamů
  socket.on('stream', (data) => {
    socket.broadcast.emit('stream', data);
  });
});

// Spuštění serveru
server.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
