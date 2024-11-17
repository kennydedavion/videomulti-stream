document.addEventListener('DOMContentLoaded', function () {
  // Ověření, zda je SimplePeer dostupný
  if (typeof SimplePeer === 'undefined') {
    console.error('SimplePeer není definován! Ujisti se, že je knihovna správně načtena.');
    return;
  }

  // Tady začíná zbytek kódu pro vytvoření Peerů, připojení a přenos médií

  const localVideo1 = document.getElementById('localVideo1');
  const localVideo2 = document.getElementById('localVideo2');
  const localVideo3 = document.getElementById('localVideo3');

  const signalData1 = document.getElementById('signalData1');
  const signalData2 = document.getElementById('signalData2');
  const signalData3 = document.getElementById('signalData3');

  const connectButton1 = document.getElementById('connectButton1');
  const connectButton2 = document.getElementById('connectButton2');
  const connectButton3 = document.getElementById('connectButton3');

  let localStream;

  // Získání místního streamu (kamera + mikrofon)
  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    // Nastavení streamu pro všechna videa
    localVideo1.srcObject = stream;
    localVideo2.srcObject = stream;
    localVideo3.srcObject = stream;
    localStream = stream;

    // Vytvoření tří SimplePeer instancí
    const peer1 = createPeer(stream, signalData1);
    const peer2 = createPeer(stream, signalData2);
    const peer3 = createPeer(stream, signalData3);

    // Obsluha tlačítek pro připojení
    connectButton1.addEventListener('click', () => handleConnection(peer1, signalData1));
    connectButton2.addEventListener('click', () => handleConnection(peer2, signalData2));
    connectButton3.addEventListener('click', () => handleConnection(peer3, signalData3));

  }).catch(err => {
    console.error('Nepodařilo se získat místní stream:', err);
  });

  // Funkce pro vytvoření SimplePeer instance
  function createPeer(stream, signalTextarea) {
    const peer = new SimplePeer({
      initiator: location.hash === '#1',
      trickle: false,
      stream: stream
    });

    // Zobrazení signálových dat v textovém poli
    peer.on('signal', data => {
      signalTextarea.value = JSON.stringify(data);
    });

    return peer;
  }

  // Funkce pro připojení k druhému uživateli
  function handleConnection(peer, signalTextarea) {
    const otherPeerData = prompt('Vložte signálová data druhého uživatele:');
    if (otherPeerData) {
      peer.signal(JSON.parse(otherPeerData));
    }
  }
});
