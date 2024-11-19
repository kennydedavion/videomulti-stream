const videoContainer = document.getElementById('video-container');
const peers = {}; // Udržujeme seznam uživatelů a jejich video elementů

// Připojení ke socketu
const socket = io();

// Funkce na přidání nového video elementu
function addVideoElement(userId, stream) {
    // Kontrola, zda už video pro dané userId neexistuje
    if (peers[userId]) return;

    const videoElement = document.createElement('video');
    videoElement.setAttribute('data-user-id', userId);
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.muted = userId === 'local'; // Ztišení místního streamu
    videoElement.srcObject = stream;

    // Přidáme video do kontejneru
    videoContainer.appendChild(videoElement);
    peers[userId] = { videoElement, stream };
}

// Funkce pro aktualizaci streamu existujícího video elementu
function updateVideoElement(userId, stream) {
    if (peers[userId]) {
        peers[userId].videoElement.srcObject = stream;
    }
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
socket.on('user-stream', (userId, streamData) => {
    // Pokud už stream existuje, aktualizujeme ho
    if (peers[userId]) {
        const mediaStream = new MediaStream(streamData);
        updateVideoElement(userId, mediaStream);
        return;
    }
    
    // Pokud stream neexistuje, vytvoříme nový video element
    const mediaStream = new MediaStream(streamData);
    addVideoElement(userId, mediaStream);
});

// Event pro odstranění uživatele při odpojení
socket.on('user-disconnected', (userId) => {
    removeVideoElement(userId);
});

// Odeslání místního streamu po jeho inicializaci
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then((stream) => {
        const userId = 'local'; // Místní uživatel (může být nahrazen skutečným ID)
        addVideoElement(userId, stream);
        
        // Pošleme místní stream na server
        socket.emit('local-stream-ready', { userId, stream: stream.getTracks().map(track => track.toJSON()) });
    })
    .catch((error) => {
        console.error('Chyba při získávání místního streamu:', error);
    });
