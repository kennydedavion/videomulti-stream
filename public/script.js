document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('video-container');
    const userList = document.getElementById('user-list');
    const switchModeButton = document.getElementById('switch-mode');
    const currentMode = document.getElementById('current-mode');

    const socket = io();
    const peers = {};  // Pro sledování připojených uživatelů a jejich streamů
    let localStream;

    // Přepnutí režimu mezi Video Call a AR/VR
    switchModeButton.addEventListener('click', () => {
        if (currentMode.textContent === 'Video Call') {
            currentMode.textContent = 'AR/VR Mode';
        } else {
            currentMode.textContent = 'Video Call';
        }
    });

    // Přístup k lokálnímu streamu
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localStream = stream;

            // Zobrazení lokálního streamu
            const localVideo = document.createElement('video');
            localVideo.setAttribute('autoplay', 'true');
            localVideo.setAttribute('playsinline', 'true');
            localVideo.srcObject = localStream;
            videoContainer.appendChild(localVideo);

            // Odeslání lokálního streamu po připojení k serveru
            socket.emit('local-stream-ready', socket.id);
        })
        .catch(error => console.error('Error accessing media devices.', error));

    // Přijetí nového uživatele
    socket.on('new-user', (userId) => {
        if (userId !== socket.id && !peers[userId]) {
            // Vytvoření video elementu pro nového uživatele
            const videoElement = document.createElement('video');
            videoElement.setAttribute('id', userId);
            videoElement.setAttribute('autoplay', 'true');
            videoElement.setAttribute('playsinline', 'true');
            videoContainer.appendChild(videoElement);
            
            // Uložení informace o novém uživateli
            peers[userId] = { videoElement };
        }
    });

    // Přijetí streamu nového uživatele
    socket.on('user-stream', (userId, stream) => {
        if (peers[userId]) {
            peers[userId].videoElement.srcObject = stream;
        }
    });

    // Zpracování odpojení uživatele
    socket.on('user-disconnected', (userId) => {
        if (peers[userId]) {
            const videoElement = peers[userId].videoElement;
            if (videoElement) {
                videoElement.remove();
            }
            delete peers[userId];
        }
    });

    // Kontrola každou sekundu pro aktualizaci seznamu uživatelů a streamů
    setInterval(() => {
        socket.emit('check-connected-users');
    }, 1000);
});
