const socket = io();

// Proměnné pro video elementy
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;

// Připojení k videu
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then((stream) => {
    localStream = stream;
    localVideo.srcObject = stream;

    // Posílání streamu ostatním uživatelům
    socket.emit('stream', stream);
  })
  .catch((err) => {
    console.error('Chyba při získávání média:', err);
  });

// Příjem připojení a streamů od ostatních uživatelů
socket.on('stream', (data) => {
  remoteVideo.srcObject = data;
});

// Aktualizace počtu uživatelů
socket.on('userCount', (count) => {
  document.getElementById('userCount').innerText = `Uživatelé: ${count}`;
});

// Funkce pro AR a VR režimy
function enterAR() {
  // Implementace AR režimu pouze na mobilních zařízeních
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    document.body.requestFullscreen();
    localVideoContainer.style.display = 'none';
    // Stereoskopické zobrazení
  } else {
    alert('AR režim je podporován pouze na mobilních zařízeních.');
  }
}

function enterVR() {
  // Implementace VR režimu na PC
  document.body.requestFullscreen();
  // Interakce s objekty uprostřed obrazovky
}
