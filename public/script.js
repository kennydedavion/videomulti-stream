document.addEventListener('DOMContentLoaded', function () {
  // Odkazy na video prvky a ovládací prvky
  const localVideo = document.getElementById('localVideo');
  const remoteVideo1 = document.getElementById('remoteVideo1');
  const remoteVideo2 = document.getElementById('remoteVideo2');
  
  const localSignalData = document.getElementById('localSignalData');
  const remoteSignalData1 = document.getElementById('remoteSignalData1');
  const remoteSignalData2 = document.getElementById('remoteSignalData2');
  
  const localConnectButton = document.getElementById('localConnectButton');
  const remoteConnectButton1 = document.getElementById('remoteConnectButton1');
  const remoteConnectButton2 = document.getElementById('remoteConnectButton2');

  let localStream;

  // Získání místního streamu (kamera + mikrofon)
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    localVideo.srcObject = stream;
    localStream = stream;

    // Vytvoření nového SimplePeer instance pro prvního uživatele
    const peer1 = new SimplePeer({
      initiator: location.hash === '#1', // Jedna strana bude inicializátor (#1)
      trickle: false,
      stream: localStream
    });

    // Zachytávání signálu a jeho sdílení s druhým peerem (uživatel 1)
    peer1.on('signal', data => {
      localSignalData.value = JSON.stringify(data); // Ukáže signálová data do textového pole
    });

    // Přijetí vzdáleného streamu a zobrazení ve video prvku (uživatel 1)
    peer1.on('stream', remoteStream => {
      remoteVideo1.srcObject = remoteStream;
    });

    // Tlačítko pro připojení k druhému uživateli (uživatel 1)
    localConnectButton.addEventListener('click', () => {
      const otherPeerData = prompt('Vložte signálová data druhého peeru');
      if (otherPeerData) {
        peer1.signal(JSON.parse(otherPeerData));
      }
    });

    // Vytvoření nového SimplePeer instance pro třetího uživatele
    const peer2 = new SimplePeer({
      initiator: location.hash === '#1', // Jedna strana bude inicializátor (#1)
      trickle: false,
      stream: localStream
    });

    // Zachytávání signálu a jeho sdílení s druhým peerem (uživatel 2)
    peer2.on('signal', data => {
      remoteSignalData2.value = JSON.stringify(data); // Ukáže signálová data do textového pole
    });

    // Přijetí vzdáleného streamu a zobrazení ve video prvku (uživatel 2)
    peer2.on('stream', remoteStream => {
      remoteVideo2.srcObject = remoteStream;
    });

    // Tlačítko pro připojení k druhému uživateli (uživatel 2)
    remoteConnectButton2.addEventListener('click', () => {
      const otherPeerData = prompt('Vložte signálová data druhého peeru');
      if (otherPeerData) {
        peer2.signal(JSON.parse(otherPeerData));
      }
    });

  }).catch(err => {
    console.error('Nepodařilo se získat místní stream:', err);
  });
});
