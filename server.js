const { Server } = require("socket.io");
const http = require("http");
const app = require("express")();
const server = http.createServer(app);
const io = new Server(server); // Správná inicializace socket.io
const users = {}; // Seznam uživatelů

io.on("connection", (socket) => {
  socket.on("local-stream-ready", ({ userId, stream }) => {
    // Uložení uživatele a jeho streamu
    users[userId] = { socketId: socket.id, stream };

    // Informování všech klientů o novém streamu
    io.emit("user-stream", userId, stream);
  });

  socket.on("disconnect", () => {
    for (let userId in users) {
      if (users[userId].socketId === socket.id) {
        delete users[userId];
        // Informujeme klienty o odpojení
        io.emit("user-disconnected", userId);
        break;
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
