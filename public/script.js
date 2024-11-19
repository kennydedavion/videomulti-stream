const videoContainer = document.getElementById('video-container');
const peers = {}; // Udržujeme seznam uživatelů a jejich streamů

// Připojení ke socketu
const socket = io.connect(); 

// Funkce na přidání nového video elementu
function addVideoElement(userId, stream) {
    // Kontrola, zda už video pro dané userId neexistuje
    if (peers[userId]) return;

    const videoWrapper = document.createElement('div');
    videoWrapper.classList.add('video-wrapper'); // Přidáme wrapper pro video a ID

    // Video element
    const videoElement = document.createElement('video');
    videoElement.setAttribute('data-user-id', userId);
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.srcObject = stream;

    // ID element
    const userIdElement = document.createElement('p');
    userIdElement.innerText = `User ID: ${userId}`;

    // Přidáme video a ID do wrapperu
    videoWrapper.appendChild(userIdElement);
    videoWrapper.appendChild(videoElement);

    // Přidáme wrapper do kontejneru
    videoContainer.appendChild(videoWrapper);

    // Uložení peer informací
    peers[userId] = { videoElement };
}

// Odstraníme video pro konkrétního uživatele
function removeVideoElement(userId) {
    if (peers[userId]) {
        const { videoElement } = peers[userId];
        const videoWrapper = videoElement.parentElement;
        videoContainer.removeChild(videoWrapper);
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

// Event pro získání aktuálních uživatelů po připojení nového
socket.on('current-users', (userIds) => {
    userIds.forEach(userId => {
        // Získání streamu a přidání videa pro všechny aktuální uživatele
        const user = peers[userId];
        if (!user) {
            // Pokud neexistuje video pro uživatele, je třeba ho přidat
            socket.emit('local-stream-ready', { userId, stream: peers[userId]?.stream });
        }
    });
});
