const videoContainer = document.getElementById('video-container');
const peers = {}; // Udržujeme seznam uživatelů a jejich streamů

// Funkce na přidání nového video elementu
function addVideoElement(userId, stream) {
    // Kontrola, zda už video pro dané userId neexistuje
    if (peers[userId]) return; 

    const videoElement = document.createElement('video');
    videoElement.setAttribute('data-user-id', userId);
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.srcObject = stream;

    // Přidáme video do kontejneru
    videoContainer.appendChild(videoElement);
    peers[userId] = { videoElement };
}

// Odstraníme video pro konkrétního uživatele
function removeVideoElement(userId) {
    if (peers[userId]) {
        const { videoElement } = peers[userId];
        videoContainer.removeChild(videoElement);
        delete peers[userId];
    }
}

// Event pro zobrazení streamu nového uživatele
socket.on('user-stream', (userId, stream) => {
    // Pokud už stream existuje, ignorujeme ho
    if (peers[userId]) return;
    const mediaStream = new MediaStream(stream);
    addVideoElement(userId, mediaStream);
});

// Event pro odstranění uživatele při odpojení
socket.on('user-disconnected', (userId) => {
    removeVideoElement(userId);
});
