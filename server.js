// WebSocket server
wss.on('connection', (ws) => {
  const userId = generateUniqueId();
  clients[userId] = ws;

  console.log('Nový uživatel připojen');

  // Odeslání zprávy o počtu připojených uživatelů všem klientům
  broadcastUserCount();

  // Příjem zpráv od klienta
  ws.on('message', (message) => {
    console.log('Přijato zprávu: %s', message);

    // Zde přeposíláme zprávu všem připojeným klientům
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Odstranění uživatele při odpojení
  ws.on('close', () => {
    console.log(`Uživatel ${userId} se odpojil`);
    delete clients[userId];
    broadcastUserCount();
  });
});

// Funkce pro rozesílání počtu uživatelů všem klientům
function broadcastUserCount() {
  const userCount = Object.keys(clients).length;
  const message = JSON.stringify({ type: 'userCount', count: userCount });

  // Zasíláme počet uživatelů každému připojenému klientovi
  Object.values(clients).forEach((client) => {
    client.send(message);
  });
}
