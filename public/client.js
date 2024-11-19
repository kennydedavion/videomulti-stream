const socket = new WebSocket(`ws://${window.location.host}`);
const logElement = document.getElementById('log');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
let localStream;

// Logovací funkce
function logMessage(message) {
  const logEntry = document.createElement('div');
  logEntry.textContent = message;
  logElement.appendChild(logEntry);
  logElement.scrollTop = logElement.scrollHeight;
}

// Získání místního videa
navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  .then(stream => {
    localStream = stream;
    localVideo.srcObject = stream;

    // Oznámení serveru o připojení
    socket.send(JSON.stringify({ type: 'video-offer', stream: stream }));
  })
  .catch(error => {
    console.error('Error accessing media devices.', error);
  });

// WebSocket připojení
socket.onopen = () => logMessage('Connected to server.');

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'user-joined') {
    logMessage(`${data.userId} joined.`);
  } else if (data.type === 'video-offer' && !remoteVideo.srcObject) {
    remoteVideo.srcObject = localStream;
  }
};
