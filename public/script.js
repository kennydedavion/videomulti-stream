<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', function () {
  const localVideo = document.getElementById('localVideo');
  const videoWrapper1 = document.getElementById('videoWrapper1');
  const videoWrapper2 = document.getElementById('videoWrapper2');
  const videoWrapper3 = document.getElementById('videoWrapper3');
  const remoteVideo1 = document.getElementById('remoteVideo1');
  const remoteVideo2 = document.getElementById('remoteVideo2');
  const userCountElement = document.getElementById('userCount');
  
  let localStream;
  let peerConnections = {};
 const socket = new WebSocket('ws://puffy-mercury-circle.glitch.me');
 // Upravte URL na vconst socket = new WebSocket('ws://puffy-mercury-circle.glitch.me');
 
  // Připojení na WebSocket server
  socket.onopen = () => {
    console.log('Připojeno k WebSocket serveru');
  };

  // Přijetí zpráv od serveru
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Aktualizace počtu uživatelů
    if (data.type === 'userCount') {
      userCountElement.textContent = `Počet uživatelů: ${data.count}`;
    }

    // Řízení spojení na základě serverových zpráv
    if (data.type === 'offer' && !peerConnections[data.userId]) {
      handleOffer(data.offer, data.userId);
    }

    if (data.type === 'answer' && peerConnections[data.userId]) {
      peerConnections[data.userId].setRemoteDescription(new RTCSessionDescription(data.answer));
    }

    if (data.type === 'candidate' && peerConnections[data.userId]) {
      peerConnections[data.userId].addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  // Získání místního streamu
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    localVideo.srcObject = stream;
    localStream = stream;
    videoWrapper1.style.display = 'flex';

    // Připojení k serveru
    socket.send(JSON.stringify({ type: 'join' }));
  }).catch(err => {
    console.error('Nepodařilo se získat místní stream:', err);
  });

  // Klikání na video prvky
  document.querySelectorAll('.video-wrapper video').forEach(video => {
    video.addEventListener('click', () => {
      video.parentElement.style.transform = 'scale(1.15)';
      setTimeout(() => {
        video.parentElement.style.transform = 'scale(1)';
      }, 300); // Vrať do původní velikosti po 300ms
    });
  });

  // Funkce pro vytvoření peer připojení
  function createPeerConnection(userId) {
    const peerConnection = new RTCPeerConnection();

    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.send(JSON.stringify({
          type: 'candidate',
          candidate: event.candidate,
          userId: userId
        }));
      }
    };

    peerConnection.ontrack = event => {
      if (!remoteVideo1.srcObject) {
        remoteVideo1.srcObject = event.streams[0];
        videoWrapper2.style.display = 'flex';
      } else if (!remoteVideo2.srcObject) {
        remoteVideo2.srcObject = event.streams[0];
        videoWrapper3.style.display = 'flex';
      }
    };

    // Přidání místního streamu k připojení
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnections[userId] = peerConnection;
    return peerConnection;
  }

  // Funkce pro zpracování nabídky (offer)
  function handleOffer(offer, userId) {
    const peerConnection = createPeerConnection(userId);
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    peerConnection.createAnswer().then(answer => {
      peerConnection.setLocalDescription(answer);
      socket.send(JSON.stringify({ type: 'answer', answer: answer, userId: userId }));
    });
  }
=======
const videoContainer = document.getElementById('video-container');
const peers = {}; // Udržujeme seznam uživatelů a jejich streamů

// Funkce na přidání nového video elementu
function addVideoElement(userId, stream) {
    // Kontrola, zda už video pro dané userId neexistuje
    if (peers[userId]) return; 

    const videoElement = document.createElement('video');
    videoElement.setAttribute('data-user-id', userId);
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.srcObject = stream;

    // Přidáme video do kontejneru
    videoContainer.appendChild(videoElement);
    peers[userId] = { videoElement };
}

// Odstraníme video pro konkrétního uživatele
function removeVideoElement(userId) {
    if (peers[userId]) {
        const { videoElement } = peers[userId];
        videoContainer.removeChild(videoElement);
        delete peers[userId];
    }
}

// Event pro zobrazení streamu nového uživatele
socket.on('user-stream', (userId, stream) => {
    // Pokud už stream existuje, ignorujeme ho
    if (peers[userId]) return;
    const mediaStream = new MediaStream(stream);
    addVideoElement(userId, mediaStream);
});

// Event pro odstranění uživatele při odpojení
socket.on('user-disconnected', (userId) => {
    removeVideoElement(userId);
>>>>>>> 5e96edb65227d90ff4ba631b4be056c42dc332ea
});
