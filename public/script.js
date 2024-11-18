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

  // Klikání na video pro zvětšení
  [videoWrapper1, videoWrapper2, videoWrapper3].forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      wrapper.style.transform = 'scale(1.15)';
    });
  });

  // Funkce pro obsluhu nabídek WebRTC
  function handleOffer(offer, userId) {
    const peerConnection = new RTCPeerConnection();
    peerConnections[userId] = peerConnection;

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.setRemoteDescription(new RTCSessionDescription(offer)).then(() => {
      return peerConnection.createAnswer();
    }).then(answer => {
      peerConnection.setLocalDescription(answer);
      socket.send(JSON.stringify({ type: 'answer', answer, userId }));
    });

    peerConnection.ontrack = (event) => {
      if (!remoteVideo1.srcObject) {
        remoteVideo1.srcObject = event.streams[0];
        videoWrapper2.style.display = 'flex';
      } else if (!remoteVideo2.srcObject) {
        remoteVideo2.srcObject = event.streams[0];
        videoWrapper3.style.display = 'flex';
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ type: 'candidate', candidate: event.candidate, userId }));
      }
    };
  }
});
