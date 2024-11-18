const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

// Inicializace WebSocket serveru
const wss = new WebSocket.Server({ port: 3000 });
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
    // Zde přeposíláme zprávu všem připojeným klientům
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
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
