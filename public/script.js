const socket = io();  // Připojení k WebSocket serveru

let localStream;
let remoteStreams = {};
let currentMode = 'video';  // Inicializace režimu

const videoContainer = document.getElementById('video-container');
const switchModeButton = document.getElementById('switch-mode');
const currentModeLabel = document.getElementById('current-mode');

// Funkce pro zapnutí AR/VR režimu
switchModeButton.addEventListener('click', () => {
    if (currentMode === 'video') {
        currentMode = 'arvr';
        currentModeLabel.textContent = 'AR/VR Mode';
        switchToARVR();
    } else {
        currentMode = 'video';
        currentModeLabel.textContent = 'Video Call';
        switchToVideo();
    }
});

// Funkce pro přepnutí do video režimu
function switchToVideo() {
    // Ukázat video streamy ve standardním režimu
    Object.keys(remoteStreams).forEach(userId => {
        const stream = remoteStreams[userId];
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        
        const videoWrapper = document.createElement('div');
        videoWrapper.classList.add('video-wrapper');
        
        const userIdLabel = document.createElement('p');
        userIdLabel.textContent = `User ID: ${userId}`;
        videoWrapper.appendChild(userIdLabel);
        videoWrapper.appendChild(video);

        videoContainer.appendChild(videoWrapper);
    });
}

// Funkce pro přepnutí do AR/VR režimu
function switchToARVR() {
    // Přidat AR/VR zobrazení (zde můžete použít knihovny jako A-Frame)
    const arvrElement = document.createElement('a-scene');
    const cameraElement = document.createElement('a-camera');
    arvrElement.appendChild(cameraElement);
    document.body.appendChild(arvrElement);
}

// Povolí video a audio stream pro toto zařízení
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        localStream = stream;
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;
        
        const videoWrapper = document.createElement('div');
        videoWrapper.classList.add('video-wrapper');
        
        const userIdLabel = document.createElement('p');
        userIdLabel.textContent = `User ID: Local`;
        videoWrapper.appendChild(userIdLabel);
        videoWrapper.appendChild(video);

        videoContainer.appendChild(videoWrapper);

        // Odeslat lokalní stream do serveru pro další připojení
        socket.emit('new-connection', { stream: localStream, userId: socket.id });
    })
    .catch(err => console.error('Error accessing media devices:', err));

// Přijímání nových streamů od ostatních uživatelů
socket.on('user-connected', (userId, remoteStream) => {
    remoteStreams[userId] = remoteStream;

    const video = document.createElement('video');
    video.srcObject = remoteStream;
    video.autoplay = true;
    video.playsInline = true;

    const videoWrapper = document.createElement('div');
    videoWrapper.classList.add('video-wrapper');
    
    const userIdLabel = document.createElement('p');
    userIdLabel.textContent = `User ID: ${userId}`;
    videoWrapper.appendChild(userIdLabel);
    videoWrapper.appendChild(video);

    videoContainer.appendChild(videoWrapper);
});
