const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const gameRoutes = require("./routers/gameRoutes");
const { setupSocket } = require("./controllers/gameController");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.use(cors());
app.use(express.json());


app.use("/game", gameRoutes);


io.on("connection", (socket) => {
    console.log("🔌 שחקן התחבר:", socket.id);
    setupSocket(socket, io);
});


const PORT = 5000;
server.listen(PORT, () => {
    console.log(`${PORT}`);
});
