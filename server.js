const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

// Inicializace WebSocket serveru
const wss = new WebSocket.Server({ server });
let clients = {}; // Ukládání připojených klientů

// Obsluha připojení WebSocket klientů
wss.on('connection', (ws) => {
  const userId = generateUniqueId();
  clients[userId] = ws;

  console.log('Nový uživatel připojen');

  // Odeslání zprávy o počtu připojených uživatelů všem klientům
  broadcastUserCount();

  // Příjem zpráv od klienta
  ws.on('message', message => {
    console.log('Přijato zprávu: %s', message);
    const data = JSON.parse(message);

    if (data.type === 'offer') {
      // Poslat nabídku (offer) ostatním uživatelům
      Object.keys(clients).forEach((clientId) => {
        if (clientId !== userId) {
          clients[clientId].send(JSON.stringify({
            type: 'offer',
            offer: data.offer,
            userId: userId
          }));
        }
      });
    }

    if (data.type === 'answer') {
      // Poslat odpověď (answer) ostatním uživatelům
      Object.keys(clients).forEach((clientId) => {
        if (clientId !== userId) {
          clients[clientId].send(JSON.stringify({
            type: 'answer',
            answer: data.answer,
            userId: userId
          }));
        }
      });
    }

    if (data.type === 'candidate') {
      // Poslat kandidáty (ICE candidates) ostatním uživatelům
      Object.keys(clients).forEach((clientId) => {
        if (clientId !== userId) {
          clients[clientId].send(JSON.stringify({
            type: 'candidate',
            candidate: data.candidate,
            userId: userId
          }));
        }
      });
    }
  });

  // Odstranění uživatele při odpojení
  ws.on('close', () => {
    console.log(`Uživatel ${userId} se odpojil`);
    delete clients[userId];
    broadcastUserCount();
  });
});

// Funkce pro vytvoření unikátního ID uživatele
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

// Funkce pro rozesílání počtu uživatelů všem klientům
function broadcastUserCount() {
  const userCount = Object.keys(clients).length;
  const message = JSON.stringify({ type: 'userCount', count: userCount });

  Object.values(clients).forEach((client) => {
    client.send(message);
  });
}

// Servírování statických souborů z public složky
app.use(express.static(path.join(__dirname, 'public')));

// Port nastavení
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
