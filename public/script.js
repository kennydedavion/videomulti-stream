document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('video-container');
    const socket = io();
    const peers = {};  // Pro sledování připojených uživatelů a jejich streamů
    let localStream;

    // Přístup k lokálnímu streamu
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localStream = stream;

            // Vytvoření vlastního video elementu
            const localVideoWrapper = document.createElement('div');
            const localVideo = document.createElement('video');
            const localLabel = document.createElement('p');
            
            localLabel.textContent = `ID: ${socket.id}`;
            localVideo.setAttribute('autoplay', 'true');
            localVideo.setAttribute('playsinline', 'true');
            localVideo.srcObject = localStream;

            // Přidání ID nad lokální video
            localVideoWrapper.appendChild(localLabel);
            localVideoWrapper.appendChild(localVideo);
            videoContainer.appendChild(localVideoWrapper);

            // Odeslání lokálního streamu po připojení k serveru
            socket.emit('local-stream-ready', socket.id);
        })
        .catch(error => console.error('Error accessing media devices.', error));

    // Přijetí nového uživatele a jeho ID
    socket.on('new-user', (userId) => {
        if (userId !== socket.id && !peers[userId]) {
            // Vytvoření video elementu pro nového uživatele
            const videoWrapper = document.createElement('div');
            const videoElement = document.createElement('video');
            const label = document.createElement('p');

            label.textContent = `ID: ${userId}`;
            videoElement.setAttribute('autoplay', 'true');
            videoElement.setAttribute('playsinline', 'true');

            // Uložení informace o novém uživateli
            videoWrapper.appendChild(label);
            videoWrapper.appendChild(videoElement);
            videoContainer.appendChild(videoWrapper);

            peers[userId] = { videoElement, label };
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
            const videoWrapper = peers[userId].videoElement.parentNode;
            if (videoWrapper) {
                videoWrapper.remove();
            }
            delete peers[userId];
        }
    });

    // Kontrola každou sekundu pro aktualizaci seznamu uživatelů a streamů
    setInterval(() => {
        socket.emit('check-connected-users');
    }, 1000);
});
