document.addEventListener('DOMContentLoaded', function () {
  // Odkazy na video prvky
  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
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

    // Zachytávání signálu a jeho sdílení s druhým peerem
    peer.on('signal', data => {
      console.log('SIGNAL', JSON.stringify(data));
      // Zobrazí data, která musíš poslat druhé straně
    });

    // Přijetí vzdáleného streamu
    peer.on('stream', remoteStream => {
      remoteVideo.srcObject = remoteStream;
    });

    // Příklad přijetí signálu z druhé strany
    document.getElementById('connectButton').addEventListener('click', () => {
      const otherPeerData = prompt('Vložte data z druhého peeru');
      peer.signal(JSON.parse(otherPeerData));
    });
  }).catch(err => {
    console.error('Nepodařilo se získat místní stream:', err);
  });
});
