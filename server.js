const io = require('socket.io')(server);
const users = {}; // Udržujeme seznam uživatelů

io.on('connection', (socket) => {
    // Připojení nového uživatele a obdržení jeho streamu
    socket.on('local-stream-ready', ({ userId, stream }) => {
        // Uložení uživatele a jeho streamu
        users[userId] = { socketId: socket.id, stream };

        // Informování nového klienta o všech existujících uživatelích
        for (let existingUserId in users) {
            if (existingUserId !== userId) {
                socket.emit('user-stream', existingUserId, users[existingUserId].stream);
            }
        }

        // Informování všech ostatních klientů o novém uživateli
        socket.broadcast.emit('user-stream', userId, stream);
    });

    // Při odpojení odstraníme uživatele ze seznamu
    socket.on('disconnect', () => {
        for (let userId in users) {
            if (users[userId].socketId === socket.id) {
                delete users[userId];
                // Informujeme klienty, že uživatel byl odpojen
                io.emit('user-disconnected', userId);
                break;
            }
        }
    });
});
