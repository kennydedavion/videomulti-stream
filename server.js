const io = require('socket.io')(server);
const users = {}; // Udržujeme seznam uživatelů

io.on('connection', (socket) => {
    socket.on('local-stream-ready', ({ userId, stream }) => {
        // Uložení uživatele a jeho streamu
        users[userId] = { socketId: socket.id, stream };

        // Informování všech klientů o novém uživateli
        io.emit('user-stream', userId, stream);
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
