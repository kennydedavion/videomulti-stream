const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('New connection established: ' + socket.id);

  // Odeslání nabídky (offer) ostatním uživatelům
  socket.on('offer', (offer) => {
    socket.broadcast.emit('offer', offer);
  });

  // Odeslání odpovědi (answer) ostatním uživatelům
  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  // Odeslání ICE kandidátů ostatním uživatelům
  socket.on('candidate', (candidate) => {
    socket.broadcast.emit('candidate', candidate);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
