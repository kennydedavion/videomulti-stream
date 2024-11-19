const socketIO = require('socket.io');  // Změněno na původní způsob importu
const io = socketIO(server);
const users = {}; // Seznam uživatelů

io.on('connection', (socket) => {
    socket.on('local-stream-ready', ({ userId, stream }) => {
        // Uložení uživatele a jeho streamu
        users[userId] = { socketId: socket.id, stream };

        // Informování všech klientů o novém uživatelském streamu
        io.emit('user-stream', userId, stream);
    });

    // Při odpojení odstraníme uživatele
    socket.on('disconnect', () => {
        for (let userId in users) {
            if (users[userId].socketId === socket.id) {
                delete users[userId];
                io.emit('user-disconnected', userId); // Informujeme o odpojení
                break;
            }
        }
    });
});
