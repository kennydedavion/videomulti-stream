const videoContainer = document.getElementById('video-container');
const peers = {}; // Udržujeme seznam uživatelů a jejich streamů

// Funkce na přidání nového video elementu
function addVideoElement(userId, stream) {
    // Kontrola, zda už video pro dané userId neexistuje
    if (peers[userId]) return;

    // Vytvoříme wrapper pro video a ID
    const videoWrapper = document.createElement('div');
    videoWrapper.classList.add('video-wrapper');

    const videoElement = document.createElement('video');
    videoElement.setAttribute('data-user-id', userId);
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.srcObject = stream;

    // Přidáme video a ID do wrapperu
    const userIdElement = document.createElement('div');
    userIdElement.id = 'user-id';
    userIdElement.textContent = userId;

    videoWrapper.appendChild(userIdElement);
    videoWrapper.appendChild(videoElement);

    // Přidáme wrapper do kontejneru
    videoContainer.appendChild(videoWrapper);
    peers[userId] = { videoElement, userIdElement };
}

// Odstraníme video pro konkrétního uživatele
function removeVideoElement(userId) {
    if (peers[userId]) {
        const { videoElement, userIdElement } = peers[userId];
        videoContainer.removeChild(videoElement.parentNode); // Smažeme celý wrapper
        delete peers[userId];
    }
}

// Event pro zobrazení streamu nového uživatele
socket.on('user-stream', (userId, stream) => {
    if (peers[userId]) return;
    const mediaStream = new MediaStream(stream);
    addVideoElement(userId, mediaStream);
});

// Event pro odstranění uživatele při odpojení
socket.on('user-disconnected', (userId) => {
    removeVideoElement(userId);
});
