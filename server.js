const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

// Inicializace WebSocket serveru na stejném portu jako HTTP server
const wss = new WebSocket.Server({ server });
let clients = {}; // Ukládání připojených klientů

// Obsluha připojení WebSocket klientů
wss.on('connection', (ws) => {
  const userId = generateUniqueId();
  clients[userId] = ws;

  console.log('Nový uživatel připojen: ', userId);

  // Odeslání zprávy o počtu připojených uživatelů všem klientům
  broadcastUserCount();

  // Příjem zpráv od klienta
  ws.on('message', message => {
    try {
      const parsedMessage = JSON.parse(message);

      // Řízení zpráv na základě typu
      if (parsedMessage.type === 'offer' || parsedMessage.type === 'answer' || parsedMessage.type === 'candidate') {
        forwardMessageToClients(parsedMessage, userId);
      }
    } catch (error) {
      console.error('Chyba při zpracování zprávy:', error);
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
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Funkce pro předání zprávy dalším klientům
function forwardMessageToClients(parsedMessage, senderId) {
  Object.entries(clients).forEach(([userId, client]) => {
    if (userId !== senderId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ ...parsedMessage, userId: senderId }));
    }
  });
}

// Servírování statických souborů z public složky
app.use(express.static(path.join(__dirname, 'public')));

// Port nastavení
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
