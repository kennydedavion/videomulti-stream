document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('video-container');
    const userList = document.getElementById('user-list');
    const switchModeButton = document.getElementById('switch-mode');
    const currentMode = document.getElementById('current-mode');

    const socket = io();

    // Přepnutí režimu mezi Video Call a AR/VR
    switchModeButton.addEventListener('click', () => {
        if (currentMode.textContent === 'Video Call') {
            currentMode.textContent = 'AR/VR Mode';
            // Logika pro AR/VR zobrazení
        } else {
            currentMode.textContent = 'Video Call';
            // Návrat k video hovoru
        }
    });

    // Po připojení obdržíme ID uživatele a zobrazíme ho
    socket.on('new-user', (userId) => {
        const userElement = document.createElement('div');
        userElement.textContent = `User ID: ${userId}`;
        userList.appendChild(userElement);

        // Přidání videa uživatele
        const videoElement = document.createElement('video');
        videoElement.setAttribute('id', userId);
        videoElement.setAttribute('autoplay', 'true');
        videoElement.setAttribute('playsinline', 'true');
        videoContainer.appendChild(videoElement);

        // Získání a přehrání lokálního streamu
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                videoElement.srcObject = stream;
            })
            .catch(error => console.error('Error accessing media devices.', error));
    });

    // Zpracování odpojení uživatele
    socket.on('user-disconnected', (userId) => {
        const videoElement = document.getElementById(userId);
        if (videoElement) {
            videoElement.remove();
        }
        
        // Odstranění uživatele ze seznamu
        const userElements = document.querySelectorAll('#user-list div');
        userElements.forEach(el => {
            if (el.textContent.includes(userId)) {
                el.remove();
            }
        });
    });

    // Odeslání žádosti o ID při načtení stránky
    socket.emit('request-user-id');
});
