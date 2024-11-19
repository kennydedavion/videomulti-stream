// Ověření, že Socket.IO je načteno správně
const socket = io();  // Socket.IO klient

const localVideo = document.getElementById('localVideo');
const remoteVideoContainer = document.getElementById('remoteVideos');  // Kontejner pro vzdálená videa

let localStream;
let peerConnections = {};  // Peer connections pro více uživatelů
let userId = '';  // Unikátní ID pro každého uživatele

const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]  // STUN server pro ICE
};

// Získání kamery a mikrofonu
async function startVideo() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;
    userId = Math.floor(Math.random() * 1000);  // Generování unikátního ID uživatele
    setupPeerConnection();
  } catch (err) {
    console.error('Přístup ke kameře a mikrofonu byl odmítnut', err);
  }
}

// Nastavení Peer-to-Peer připojení pro nové připojení
function setupPeerConnection() {
  const peerConnection = new RTCPeerConnection(config);
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  peerConnection.ontrack = (event) => {
    if (remoteVideoContainer) {
      const remoteVideo = document.createElement('video');
      remoteVideo.srcObject = event.streams[0];
      remoteVideo.autoplay = true;
      remoteVideo.playsinline = true;
      remoteVideoContainer.appendChild(remoteVideo);  // Přidáme nové video do kontejneru
    }
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('candidate', { candidate: event.candidate, userId });
    }
  };

  peerConnections[userId] = peerConnection;  // Uložení peer connection pro daného uživatele

  // Odeslání nabídky při prvním připojení
  if (Object.keys(peerConnections).length === 1) {
    createOffer(peerConnection);
  }
}

// Vytvoření nabídky (offer)
async function createOffer(peerConnection) {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit('offer', { offer, userId });
}

// Zpracování nabídky (offer) od jiného uživatele
socket.on('offer', async ({ offer, userId: remoteUserId }) => {
  const peerConnection = new RTCPeerConnection(config);
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  peerConnection.ontrack = (event) => {
    const remoteVideo = document.createElement('video');
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.autoplay = true;
    remoteVideo.playsinline = true;
    remoteVideoContainer.appendChild(remoteVideo);  // Přidání videa na stránku
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('candidate', { candidate: event.candidate, userId: remoteUserId });
    }
  };

  peerConnections[remoteUserId] = peerConnection;
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit('answer', { answer, userId: remoteUserId });
});

// Zpracování odpovědi (answer) od jiného uživatele
socket.on('answer', async ({ answer, userId: remoteUserId }) => {
  const peerConnection = peerConnections[remoteUserId];
  if (peerConnection) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }
});

// Přijímání ICE kandidátů
socket.on('candidate', async ({ candidate, userId: remoteUserId }) => {
  const peerConnection = peerConnections[remoteUserId];
  if (peerConnection) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Chyba při přidávání ICE kandidáta', error);
    }
  }
});

// Spuštění videa
startVideo();
