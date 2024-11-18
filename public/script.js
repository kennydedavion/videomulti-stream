document.addEventListener('DOMContentLoaded', function () {
  const localVideo = document.getElementById('localVideo');
  const videoContainer = document.getElementById('videoContainer');
  const userCountElement = document.getElementById('userCount');
  const logElement = document.getElementById('log');
  const arVrButton = document.getElementById('arVrButton');
  const vrContainer = document.getElementById('vrContainer');
  const peer = new Peer();

  let localStream;
  let peerConnections = {};
  const socket = new WebSocket(`wss://${window.location.host}`);

  // Připojení na WebSocket server
  socket.onopen = () => {
    console.log('Připojeno k WebSocket serveru');
  };

  // Přijetí zpráv od serveru
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'userCount') {
      userCountElement.textContent = `Počet uživatelů: ${data.count}`;
    }

    if (data.type === 'join') {
      logElement.innerHTML += `<p>Nový uživatel připojen: ${data.userId}</p>`;
    }

    if (data.type === 'leave') {
      logElement.innerHTML += `<p>Uživatel ${data.userId} se odpojil</p>`;
    }

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
    socket.send(JSON.stringify({ type: 'join', userId: generateUniqueId() }));
  }).catch(err => {
    console.error('Nepodařilo se získat místní stream:', err);
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
      let remoteVideoElement = document.createElement('video');
      remoteVideoElement.srcObject = event.streams[0];
      remoteVideoElement.style.display = 'block';
      remoteVideoElement.setAttribute('autoplay', true);
      remoteVideoElement.setAttribute('muted', true);
      videoContainer.appendChild(remoteVideoElement);
    };

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

  // Funkce pro vytváření nabídky (offer) pro nového uživatele
  function createOfferForNewUser(userId) {
    const peerConnection = createPeerConnection(userId);

    peerConnection.createOffer().then(offer => {
      peerConnection.setLocalDescription(offer);
      socket.send(JSON.stringify({
        type: 'offer',
        offer: offer,
        userId: userId
      }));
    });
  }

  // Generování unikátního ID uživatele
  function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Přepnutí AR/VR režimu
  arVrButton.addEventListener('click', function() {
    const isVrVisible = vrContainer.style.display === 'flex';
    if (isVrVisible) {
      vrContainer.style.display = 'none';
    } else {
      vrContainer.style.display = 'flex';
    }
  });
});
