const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Obsluha statických souborů z video-server/public
app.use(express.static(path.join(__dirname, 'public')));

// Přesměrování na index.html, pokud žádná jiná cesta není zadána
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Spuštění WebSocket serveru
wss.on('connection', (ws) => {
  console.log('New connection established');
  ws.send('Welcome to the Video Server!');

  ws.on('message', (message) => {
    console.log('Received:', message);
  });
});

// Nastavení portu a spuštění serveru
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Video server is running on http://localhost:${PORT}`);
});
