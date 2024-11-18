document.addEventListener('DOMContentLoaded', function () {
  // Odkazy na video prvky a ovládací prvky
  const localVideo = document.getElementById('localVideo');
  const videoWrapper1 = document.getElementById('videoWrapper1');
  const videoWrapper2 = document.getElementById('videoWrapper2');
  const videoWrapper3 = document.getElementById('videoWrapper3');
  const remoteVideo1 = document.getElementById('remoteVideo1');
  const remoteVideo2 = document.getElementById('remoteVideo2');

  let localStream;
  const peers = [];

  // Získání místního streamu (kamera + mikrofon)
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    localVideo.srcObject = stream;
    localStream = stream;
    videoWrapper1.style.display = 'flex'; // Ukáže místní video, protože je uživatel připojen

    // Připojení nového uživatele k existujícím peerům
    const createNewPeer = (initiator = false) => {
      const peer = new SimplePeer({
        initiator: initiator,
        trickle: false,
        stream: localStream
      });

      // Při zachycení signálu přidej do seznamu peers
      peer.on('signal', data => {
        peers.push(peer);
        if (initiator) {
          alert('Sdílej tento kód s novým uživatelem: ' + JSON.stringify(data));
        }
      });

      // Přijetí vzdáleného streamu a jeho zobrazení
      peer.on('stream', remoteStream => {
        if (!remoteVideo1.srcObject) {
          remoteVideo1.srcObject = remoteStream;
          videoWrapper2.style.display = 'flex'; // Ukáže první vzdálené video
        } else if (!remoteVideo2.srcObject) {
          remoteVideo2.srcObject = remoteStream;
          videoWrapper3.style.display = 'flex'; // Ukáže druhé vzdálené video
        }
      });

      return peer;
    };

    // Pokud je uživatel inicializátor (parametr #1 v URL)
    if (location.hash === '#1') {
      const peer = createNewPeer(true);

      // Připojovací kód pro nového uživatele
      peer.on('connect', () => {
        console.log('Připojeno jako inicializátor');
      });
    }

    // Připojení k existujícímu peeru přes sdílená data
    window.addEventListener('load', () => {
      if (location.hash !== '#1') {
        const peer = createNewPeer(false);
        const otherPeerData = prompt('Vložte data z inicializátoru');
        if (otherPeerData) {
          peer.signal(JSON.parse(otherPeerData));
        }
      }
    });
  }).catch(err => {
    console.error('Nepodařilo se získat místní stream:', err);
  });
});
