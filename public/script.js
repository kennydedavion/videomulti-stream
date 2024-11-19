// Zde použijeme WebRTC pro připojení mezi zařízeními
let localStream;
let peers = {}; // Ukládáme všechny peer connection pro každého uživatele
let userId = uuid.v4(); // Generujeme unikátní ID pro každého uživatele
let socket = new WebSocket('ws://localhost:3000'); // Připojení k WebSocket serveru

// Připojení k serveru a příprava na nové připojení
socket.onopen = function() {
    console.log('Připojeno k serveru');
    socket.send(JSON.stringify({ type: 'new-user', userId: userId }));
};

// Při příchozích zprávách z WebSocket serveru
socket.onmessage = function(event) {
    const message = JSON.parse(event.data);
    if (message.type === 'user-connected') {
        handleNewUser(message.userId);
    } else if (message.type === 'offer') {
        handleOffer(message);
    } else if (message.type === 'answer') {
        handleAnswer(message);
    } else if (message.type === 'candidate') {
        handleCandidate(message);
    }
};

// Funkce pro získání video a audio streamu
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localStream = stream;
        const localVideo = document.createElement('video');
        localVideo.srcObject = localStream;
        localVideo.autoplay = true;
        localVideo.playsInline = true;

        const videoWrapper = document.createElement('div');
        videoWrapper.classList.add('video-wrapper');
        
        const userIdLabel = document.createElement('div');
        userIdLabel.textContent = userId;
        userIdLabel.classList.add('user-id');
        
        videoWrapper.appendChild(userIdLabel);
        videoWrapper.appendChild(localVideo);
        document.getElementById('video-container').appendChild(videoWrapper);

        // Odeslat lokální stream na server pro ostatní uživatele
        socket.send(JSON.stringify({ type: 'new-user-stream', userId: userId, stream: localStream }));
    })
    .catch(err => console.error('Chyba při připojování k mediálním zařízením:', err));

// Funkce pro vytvoření nabídky (offer) pro ostatní uživatele
function handleNewUser(remoteUserId) {
    const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: localStream
    });

    peer.on('signal', data => {
        socket.send(JSON.stringify({
            type: 'offer',
            to: remoteUserId,
            offer: data
        }));
    });

    peer.on('stream', remoteStream => {
        addRemoteStream(remoteUserId, remoteStream);
    });

    peers[remoteUserId] = peer;
}

// Funkce pro přijetí nabídky a odpověď (answer)
function handleOffer(message) {
    const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: localStream
    });

    peer.on('signal', data => {
        socket.send(JSON.stringify({
            type: 'answer',
            to: message.userId,
            answer: data
        }));
    });

    peer.on('stream', remoteStream => {
        addRemoteStream(message.userId, remoteStream);
    });

    peer.signal(message.offer);
    peers[message.userId] = peer;
}

// Funkce pro přijetí odpovědi na nabídku
function handleAnswer(message) {
    peers[message.userId].signal(message.answer);
}

// Funkce pro přijetí kandidáta (ICE candidate) pro připojení
function handleCandidate(message) {
    const peer = peers[message.userId];
    if (peer) {
        peer.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
}

// Funkce pro přidání streamu do UI pro vzdálené uživatele
function addRemoteStream(userId, remoteStream) {
    const video = document.createElement('video');
    video.srcObject = remoteStream;
    video.autoplay = true;
    video.playsInline = true;

    const videoWrapper = document.createElement('div');
    videoWrapper.classList.add('video-wrapper');
    
    const userIdLabel = document.createElement('div');
    userIdLabel.textContent = userId;
    userIdLabel.classList.add('user-id');
    
    videoWrapper.appendChild(userIdLabel);
    videoWrapper.appendChild(video);
    document.getElementById('video-container').appendChild(videoWrapper);
}
