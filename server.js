const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = {};

wss.on('connection', (ws) => {
  const userId = generateUniqueId();
  clients[userId] = ws;

  console.log('Nový uživatel připojen', userId);

  // Odeslání počtu připojených uživatelů všem klientům
  broadcastUserCount();

  // Přijímání zpráv od klienta
  ws.on('message', message => {
    console.log('Přijato zprávu: %s', message);
    // Přeposíláme zprávu všem připojeným klientům
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Odpojení klienta
  ws.on('close', () => {
    console.log(`Uživatel ${userId} se odpojil`);
    delete clients[userId];
    broadcastUserCount();
  });
});

// Funkce pro generování unikátního ID
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

// Funkce pro broadcast počtu uživatelů
function broadcastUserCount() {
  const userCount = Object.keys(clients).length;
  const message = JSON.stringify({ type: 'userCount', count: userCount });
  wss.clients.forEach(client => {
    client.send(message);
  });
}

// Statické soubory
app.use(express.static(path.join(__dirname, 'public')));

// Spuštění serveru
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
