const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let connectedUsers = 0;

wss.on('connection', (ws) => {
  connectedUsers++;
  console.log(`Nový uživatel připojen, aktuální počet: ${connectedUsers}`);
  
  // Informace o počtu připojených uživatelů
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'updateUsers', count: connectedUsers }));
    }
  });

  ws.on('close', () => {
    connectedUsers--;
    console.log(`Uživatel odpojen, aktuální počet: ${connectedUsers}`);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'updateUsers', count: connectedUsers }));
      }
    });
  });
});

app.use(express.static(path.join(__dirname, 'public')));

server.listen(3000, () => {
  console.log('Server běží na portu 3000');
});
