document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('video-container');
    const socket = io();
    const peers = {}; // Sledování připojených uživatelů a jejich streamů
    let localStream;

    // Přístup k lokálnímu streamu
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            localStream = stream;

            // Vytvoření a přidání lokálního videa
            addVideoElement(socket.id, stream);

            // Odeslání informace o lokálním streamu na server
            socket.emit('local-stream-ready', { userId: socket.id });
        })
        .catch(error => console.error('Error accessing media devices.', error));

    // Přijetí informací o novém uživateli
    socket.on('new-user', (userId) => {
        if (!peers[userId]) {
            // Přidání placeholderu pro nového uživatele
            const placeholderVideo = addVideoElement(userId, null);
            peers[userId] = { videoElement: placeholderVideo };
        }
    });

    // Přijetí streamu od uživatele
    socket.on('user-stream', (userId, stream) => {
        if (peers[userId]) {
            const mediaStream = new MediaStream(stream);
            peers[userId].videoElement.srcObject = mediaStream;
        } else {
            // Přidání nového videa, pokud neexistuje
            const videoElement = addVideoElement(userId, new MediaStream(stream));
            peers[userId] = { videoElement };
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

    // Kontrola a aktualizace seznamu uživatelů každou sekundu
    setInterval(() => {
        socket.emit('check-connected-users');
    }, 1000);

    // Funkce pro přidání video elementu
    function addVideoElement(userId, stream) {
        const videoWrapper = document.createElement('div');
        const videoElement = document.createElement('video');
        const label = document.createElement('p');

        label.textContent = `ID: ${userId}`;
        videoElement.setAttribute('autoplay', 'true');
        videoElement.setAttribute('playsinline', 'true');
        if (stream) {
            videoElement.srcObject = stream;
        }

        // Přidání labelu a videa do kontejneru
        videoWrapper.appendChild(label);
        videoWrapper.appendChild(videoElement);
        videoContainer.appendChild(videoWrapper);

        return videoElement;
    }
});
