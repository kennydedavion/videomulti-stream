const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

let connectedUsers = {}; // Skladování připojených uživatelů

wss.on('connection', ws => {
    let userId;

    ws.on('message', message => {
        const msg = JSON.parse(message);
        
        if (msg.type === 'new-user') {
            userId = msg.userId;
            connectedUsers[userId] = ws;
            console.log(`Nový uživatel připojen: ${userId}`);
            
            // Odeslat připojeným uživatelům nové připojení
            Object.keys(connectedUsers).forEach(id => {
                if (id !== userId) {
                    connectedUsers[id].send(JSON.stringify({
                        type: 'user-connected',
                        userId: userId
                    }));
                }
            });
        }

        if (msg.type === 'offer') {
            const { to, offer } = msg;
            if (connectedUsers[to]) {
                connectedUsers[to].send(JSON.stringify({
                    type: 'offer',
                    userId: userId,
                    offer: offer
                }));
            }
        }

        if (msg.type === 'answer') {
            const { to, answer } = msg;
            if (connectedUsers[to]) {
                connectedUsers[to].send(JSON.stringify({
                    type: 'answer',
                    userId: userId,
                    answer: answer
                }));
            }
        }

        if (msg.type === 'candidate') {
            const { to, candidate } = msg;
            if (connectedUsers[to]) {
                connectedUsers[to].send(JSON.stringify({
                    type: 'candidate',
                    userId: userId,
                    candidate: candidate
                }));
            }
        }

        if (msg.type === 'new-user-stream') {
            const { userId, stream } = msg;
            console.log(`Nový stream pro uživatele: ${userId}`);
        }
    });

    ws.on('close', () => {
        delete connectedUsers[userId];
        console.log(`Uživatel odpojen: ${userId}`);
    });
});

console.log('Server běží na portu 3000');
