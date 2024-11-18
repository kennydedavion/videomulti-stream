// WebSocket připojení
const socket = new WebSocket('wss://jinyvesmir.glitch.me');

// Elementy pro video a počet uživatelů
const videoContainer = document.getElementById('videoContainer');
const userCountElem = document.getElementById('userCount');

// Nastavení připojení
socket.onopen = () => {
  console.log('Připojeno k WebSocket serveru');
};

// Příjem zpráv
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'userCount') {
    userCountElem.textContent = `Uživatelé: ${message.count}`;
  } else if (message.type === 'video') {
    // Přidání nového videa do kontejneru
    const newVideo = document.createElement('video');
    newVideo.srcObject = message.stream;
    newVideo.play();
    videoContainer.appendChild(newVideo);
  }
};

// Připojení k videu
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then((stream) => {
    // Po získání streamu, pošleme jej na server
    socket.send(JSON.stringify({ type: 'video', stream: stream }));

    // Zobrazení vlastního videa
    const myVideo = document.createElement('video');
    myVideo.srcObject = stream;
    myVideo.play();
    videoContainer.appendChild(myVideo);
  })
  .catch((err) => {
    console.log('Chyba při připojování k médiím:', err);
  });
