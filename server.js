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

  // Odeslání zprávy o počtu připojených uživatelů
  broadcastUserCount();

  // Záznam připojení uživatele
  broadcastLog(`Nový uživatel připojen: ${userId}`);

  // Příjem zpráv od klienta
  ws.on('message', message => {
    const data = JSON.parse(message);
    if (data.type === 'join') {
      // Oznámit připojení
      broadcastLog(`Uživatel ${userId} připojen`);
    }
  });

  // Odstranění uživatele při odpojení
  ws.on('close', () => {
    delete clients[userId];
    broadcastLog(`Uživatel ${userId} se odpojil`);
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

// Funkce pro odesílání logu všem klientům
function broadcastLog(message) {
  const logMessage = JSON.stringify({ type: 'log', message: message });

  Object.values(clients).forEach((client) => {
    client.send(logMessage);
  });
}

// Servírování statických souborů z public složky
app.use(express.static(path.join(__dirname, 'public')));

// Port nastavení
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
