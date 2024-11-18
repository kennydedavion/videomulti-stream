const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Inicializace serveru
const app = express();
const server = http.createServer(app);

// Inicializace WebSocket serveru
const wss = new WebSocket.Server({ server });
let clients = {}; // Uchováváme připojené klienty
let streams = {}; // Uchováváme video streamy uživatelů

// WebSocket připojení
wss.on('connection', (ws) => {
  const userId = generateUniqueId();
  clients[userId] = ws;
  streams[userId] = null;

  console.log(`Uživatel ${userId} připojen`);

  // Odesílání počtu uživatelů všem připojeným
  broadcastUserCount();

  // Příjem zpráv
  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === 'video') {
      // Uložení video streamu
      streams[userId] = parsedMessage.stream;
      // Odeslání video streamu ostatním uživatelům
      broadcastVideoStream(userId, parsedMessage.stream);
    }

    // Předávání zpráv ostatním uživatelům
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Odpojení uživatele
  ws.on('close', () => {
    console.log(`Uživatel ${userId} se odpojil`);
    delete clients[userId];
    delete streams[userId];
    broadcastUserCount();
  });
});

// Funkce pro generování unikátního ID
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

// Funkce pro odesílání počtu připojených uživatelů
function broadcastUserCount() {
  const userCount = Object.keys(clients).length;
  const message = JSON.stringify({ type: 'userCount', count: userCount });

  Object.values(clients).forEach((client) => {
    client.send(message);
  });
}

// Funkce pro rozesílání video streamu všem ostatním
function broadcastVideoStream(userId, stream) {
  const message = JSON.stringify({ type: 'video', userId: userId, stream: stream });

  Object.values(clients).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Servírování statických souborů z public složky
app.use(express.static('video-server'));

// Port pro Glitch
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Video server běží na portu ${PORT}`);
});
