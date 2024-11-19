const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const socketIo = require('socket.io');

// Inicializace serveru
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Statické soubory
app.use(express.static('public'));

// WebSocket pro komunikaci mezi klienty
const wss = new WebSocket.Server({ server });

// Počet připojených uživatelů
let users = 0;

// WebSocket - nová připojení
wss.on('connection', (ws) => {
  users++;
  // Informování všech klientů o počtu uživatelů
  wss.clients.forEach(client => {
    client.send(JSON.stringify({ type: 'user_count', users }));
  });

  ws.on('close', () => {
    users--;
    wss.clients.forEach(client => {
      client.send(JSON.stringify({ type: 'user_count', users }));
    });
  });
});

// Spuštění serveru na portu 3000
server.listen(3000, () => {
  console.log('Server běží na portu 3000');
});
