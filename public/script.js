// Vytvoření WebSocket spojení
const socket = new WebSocket('ws://localhost:8080');  // Předpokládáme, že server běží na localhost na portu 8080

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
    socket.send(JSON.stringify({ type: 'new-user', userId }));  // Informace o novém uživatelském připojení
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
    const remoteVideo = document.createElement('video');
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.autoplay = true;
    remoteVideo.playsinline = true;
    remoteVideoContainer.appendChild(remoteVideo);  // Přidáme nové video do kontejneru

    // Přidáme ID do logu
    const logText = document.createElement('p');
    logText.textContent = `New connection established: ${userId}`;
    remoteVideoContainer.appendChild(logText);
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.send(JSON.stringify({ type: 'candidate', candidate: event.candidate, userId }));
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
  socket.send(JSON.stringify({ type: 'offer', offer, userId }));
}

// Zpracování nabídky (offer) od jiného uživatele
socket.onmessage = async (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'offer') {
    const peerConnection = new RTCPeerConnection(config);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.ontrack = (event) => {
      const remoteVideo = document.createElement('video');
      remoteVideo.srcObject = event.streams[0];
      remoteVideo.autoplay = true;
      remoteVideo.playsinline = true;
      remoteVideoContainer.appendChild(remoteVideo);  // Přidání videa na stránku

      // Přidání logu pro nový připojený stream
      const logText = document.createElement('p');
      logText.textContent = `New connection established: ${message.userId}`;
      remoteVideoContainer.appendChild(logText);
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ type: 'candidate', candidate: event.candidate, userId: message.userId }));
      }
    };

    peerConnections[message.userId] = peerConnection;
    await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.send(JSON.stringify({ type: 'answer', answer, userId: message.userId }));
  }

  if (message.type === 'answer') {
    const peerConnection = peerConnections[message.userId];
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
    }
  }

  if (message.type === 'candidate') {
    const peerConnection = peerConnections[message.userId];
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
      } catch (error) {
        console.error('Chyba při přidávání ICE kandidáta', error);
      }
    }
  }
};

// Spuštění videa
startVideo();
