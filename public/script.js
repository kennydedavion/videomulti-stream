// WebSocket připojení
const socket = new WebSocket('wss://jinyvesmir.glitch.me'); // Používáme 'wss' pro šifrované připojení

// Odeslání zprávy o připojení
socket.onopen = () => {
  console.log('Připojeno k WebSocket serveru');
  socket.send(JSON.stringify({ type: 'join' })); // Odeslání zprávy o připojení
};

// Přijetí zpráv od serveru
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // Aktualizace počtu uživatelů
  if (data.type === 'userCount') {
    userCountElement.textContent = `Počet uživatelů: ${data.count}`;
  }

  // Další zpracování zpráv...
};
