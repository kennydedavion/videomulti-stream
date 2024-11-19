const socket = new WebSocket("ws://" + window.location.hostname + ":3000");
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');

// Počet připojených uživatelů
socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === 'user_count') {
        document.getElementById('user-count').textContent = message.users;
    }
};

// WebRTC logika pro video konferenci
let localStream;
let remoteStream;
let peerConnection;

const config = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

// Funkce pro získání lokálního videa
async function getLocalStream() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
        createPeerConnection();
    } catch (err) {
        console.error('Error accessing media devices.', err);
    }
}

// Funkce pro vytvoření PeerConnection
function createPeerConnection() {
    peerConnection = new RTCPeerConnection(config);
    
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        remoteStream = event.streams[0];
        remoteVideo.srcObject = remoteStream;
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
        }
    };

    socket.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.send(JSON.stringify({ type: 'answer', answer }));
        } else if (message.type === 'answer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
        } else if (message.type === 'candidate') {
            await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
    };

    socket.send(JSON.stringify({ type: 'offer', offer: await peerConnection.createOffer() }));
}

// Volání funkce pro získání lokálního streamu při načtení stránky
getLocalStream();
