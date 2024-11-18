// video-server/server.js

const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const port = 4000;  // Použijeme jiný port, např. 4000

// Vytvoření HTTP serveru
const server = http.createServer(app);

// Inicializace WebSocket serveru
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Nový klient připojen.');

  // Poslouchání zpráv od klienta
  ws.on('message', (message) => {
    console.log('Přijato zprávu:', message);

    // Posíláme zprávu zpět všem připojeným klientům
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Server obdržel zprávu: ${message}`);
      }
    });
  });

  ws.on('close', () => {
    console.log('Klient se odpojil.');
  });
});

// Spuštění serveru
server.listen(port, () => {
  console.log(`Video server běží na http://localhost:${port}`);
});
