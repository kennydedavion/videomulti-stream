document.addEventListener('DOMContentLoaded', function () {
  const localVideo = document.getElementById('localVideo');
  const remoteVideos = [
    document.getElementById('remoteVideo1'),
    document.getElementById('remoteVideo2')
  ];
  const userCountElement = document.getElementById('userCount');
  
  let localStream;
  let peerConnections = {};  // Uložení všech peer připojení
  const socket = new WebSocket(`wss://${window.location.host}`);

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

    // Zpracování nabídky (offer) od jiného uživatele
    if (data.type === 'offer' && !peerConnections[data.userId]) {
      handleOffer(data.offer, data.userId);
    }

    // Zpracování odpovědi (answer)
    if (data.type === 'answer' && peerConnections[data.userId]) {
      peerConnections[data.userId].setRemoteDescription(new RTCSessionDescription(data.answer));
    }

    // Přidání kandidáta (ICE candidate)
    if (data.type === 'candidate' && peerConnections[data.userId]) {
      peerConnections[data.userId].addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };

  // Získání místního streamu
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    localVideo.srcObject = stream;
    localStream = stream;

    // Připojení k serveru
    socket.send(JSON.stringify({ type: 'join' }));
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
      let remoteVideoElement;
      for (let i = 0; i < remoteVideos.length; i++) {
        if (!remoteVideos[i].srcObject) {
          remoteVideoElement = remoteVideos[i];
          break;
        }
      }
      if (remoteVideoElement) {
        remoteVideoElement.srcObject = event.streams[0];
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

  // Odeslání nabídky při připojení nového uživatele
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'join') {
      // Pokud je nový uživatel připojen, vytvoříme pro něj nabídku
      const newUserId = data.userId;
      createOfferForNewUser(newUserId);
    }
  };
});
