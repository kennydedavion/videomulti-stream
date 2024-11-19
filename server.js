const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    // Procházení všech připojených klientů a posílání zpráv
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(msg));
      }
    });
  });

  ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome to the video chat server!' }));
});

console.log('Server běží na ws://localhost:8080');
