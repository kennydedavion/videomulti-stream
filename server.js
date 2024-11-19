const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let userCount = 0;
let users = {}; // Pro uložení ID uživatelů a jejich socketů

wss.on('connection', (ws) => {
  userCount++;
  const userId = `User_${userCount}`;
  users[userId] = ws;

  // Oznámí všem uživatelům, že se někdo připojil
  Object.values(users).forEach(userWs => {
    userWs.send(JSON.stringify({ type: 'user-joined', userId }));
  });

  ws.on('message', (message) => {
    // Předá zprávu ostatním uživatelům
    const data = JSON.parse(message);
    if (data.type === 'video-offer') {
      Object.values(users).forEach(userWs => {
        if (userWs !== ws) {
          userWs.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on('close', () => {
    // Odstranění uživatele při odpojení
    delete users[userId];
  });
});

app.use(express.static('public'));

server.listen(process.env.PORT || 3000, () => {
  console.log('Server is running...');
});
