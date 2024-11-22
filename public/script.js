document.addEventListener('DOMContentLoaded', function () {
  // Odkazy na video prvky a další prvky na stránce
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const signalDataTextarea = document.getElementById('signalData');
  const otherPeerDataInput = document.getElementById('otherPeerDataInput');
  const connectButton = document.getElementById('connectButton');
  let localStream;

  // Získání místního streamu (kamera + mikrofon)
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    localVideo.srcObject = stream;
    localStream = stream;

    // Vytvoření nového SimplePeer instance
    const peer = new SimplePeer({
      initiator: location.hash === '#1', // Jedna strana bude inicializátor (#1)
      trickle: false,
      stream: localStream
    });

    // Zobrazení signálových dat v textovém poli
    peer.on('signal', data => {
      signalDataTextarea.value = JSON.stringify(data);
    });

    // Přijetí vzdáleného streamu a zobrazení ve video prvku
    peer.on('stream', remoteStream => {
      remoteVideo.srcObject = remoteStream;
    });

    // Obsluha kliknutí na tlačítko pro připojení k druhému uživateli
    connectButton.addEventListener('click', () => {
      const otherPeerData = otherPeerDataInput.value;
      if (otherPeerData) {
        peer.signal(JSON.parse(otherPeerData));
      }
    });
  }).catch(err => {
    console.error('Nepodařilo se získat místní stream:', err);
  });
});
