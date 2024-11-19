const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  // Přijetí nabídky a předání druhému zařízení
  socket.on('offer', (offer) => {
    socket.broadcast.emit('offer', offer);
  });

  // Přijetí odpovědi a předání druhému zařízení
  socket.on('answer', (answer) => {
    socket.broadcast.emit('answer', answer);
  });

  // Přijetí ICE kandidáta a předání druhému zařízení
  socket.on('candidate', (candidate) => {
    socket.broadcast.emit('candidate', candidate);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
