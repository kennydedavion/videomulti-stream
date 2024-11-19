const socket = io(); // Ověř, že knihovna Socket.IO je správně načtena

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;
let peerConnection;
const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// Získání kamery a mikrofonu
async function startVideo() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    setupPeerConnection();
  } catch (err) {
    console.error('Přístup ke kameře a mikrofonu byl odmítnut', err);
  }
}

// Nastavení Peer-to-Peer připojení
function setupPeerConnection() {
  peerConnection = new RTCPeerConnection(config);
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  peerConnection.ontrack = (event) => {
    if (!remoteVideo.srcObject) {
      remoteVideo.srcObject = event.streams[0];
    }
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('candidate', event.candidate);
    }
  };
}

// Zpracování Socket.IO událostí
socket.on('offer', async (offer) => {
  if (!peerConnection) setupPeerConnection();

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit('answer', answer);
});

socket.on('answer', async (answer) => {
  if (!peerConnection) return;
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('candidate', async (candidate) => {
  if (!peerConnection) return;
  try {
    await peerConnection.addIceCandidate(candidate);
  } catch (error) {
    console.error('Chyba při přidávání ICE kandidáta', error);
  }
});

// Spuštění videa
startVideo();
