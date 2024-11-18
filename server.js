const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws'); // Import WebSocket knihovny
const PORT = process.env.PORT || 3001; // Změna na 3001

const app = express();
const server = http.createServer(app);

// Inicializace WebSocket serveru
const wss = new WebSocket.Server({ server });
let clients = {}; // Ukládání připojených klientů

// Obsluha připojení WebSocket klientů
wss.on('connection', (ws) => {
  // Unikátní ID pro každého uživatele
  const userId = generateUniqueId();
  clients[userId] = ws;

  console.log(`Uživatel ${userId} se připojil`);

  // Odeslání zprávy o počtu připojených uživatelů všem klientům
  broadcastUserCount();

  // Příjem zpráv od klienta
  ws.on('message', (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'join':
        // Uživatel se připojil
        console.log(`Uživatel ${userId} se připojil`);
        break;

      case 'offer':
        // Odeslání nabídky specifikovanému uživateli
        if (clients[data.userId]) {
          clients[data.userId].send(JSON.stringify({
            type: 'offer',
            offer: data.offer,
            userId: userId,
          }));
        }
        break;

      case 'answer':
        // Odeslání odpovědi specifikovanému uživateli
        if (clients[data.userId]) {
          clients[data.userId].send(JSON.stringify({
            type: 'answer',
            answer: data.answer,
            userId: userId,
          }));
        }
        break;

      case 'candidate':
        // Odeslání ICE kandidáta specifikovanému uživateli
        if (clients[data.userId]) {
          clients[data.userId].send(JSON.stringify({
            type: 'candidate',
            candidate: data.candidate,
            userId: userId,
          }));
        }
        break;
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
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
