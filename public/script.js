const ws = new WebSocket('ws://' + window.location.host);

let userCountElement = document.getElementById('user-count-value');

// Zpracování zpráv z WebSocket serveru
ws.onmessage = (message) => {
  const data = JSON.parse(message.data);

  if (data.type === 'updateUsers') {
    userCountElement.textContent = data.count;
  }
};

// Přepínání mezi AR a VR režimem
document.getElementById('toggle-ar-vr').addEventListener('click', () => {
  // Přidat funkci pro přepínání mezi režimy
  alert('Přepínání mezi AR a VR režimem není zatím implementováno.');
});
