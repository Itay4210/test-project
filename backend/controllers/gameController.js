const { checkWinner } = require("../utils/gameLogic");

const games = {};

const joinGame = (socket, io) => {
    socket.on("joinGame", (gameId) => {
        if (!games[gameId]) {
            games[gameId] = {
                players: [], 
                board: Array(9).fill(null), 
                turn: "X" 
            };
        }

        const game = games[gameId];

        const existingPlayer = game.players.find(player => player.id === socket.id);
        if (existingPlayer) {
            console.log(`⚠️ השחקן ${socket.id} כבר במשחק, שולח לו את הנתונים שוב.`);
            socket.emit("gameJoined", { gameId, symbol: existingPlayer.symbol, board: game.board });
            return;
        }

 
        if (game.players.length >= 2) {
            console.log(`❌ המשחק ${gameId} כבר מלא.`);
            socket.emit("error", "המשחק כבר מלא!");
            return;
        }

        socket.join(gameId);


        const playerSymbol = game.players.length === 0 ? "X" : "O";


        game.players.push({ id: socket.id, symbol: playerSymbol });

        console.log(`🔵 שחקן הצטרף: ${socket.id}, קיבל ${playerSymbol}`);

        socket.emit("gameJoined", { gameId, symbol: playerSymbol, board: game.board });


        io.to(gameId).emit("playersUpdate", game.players.map(player => player.symbol));

        if (game.players.length === 2) {
            io.to(gameId).emit("startGame", { firstPlayer: "X" });
        }
    });
};



const makeMove = (socket, io) => {
    socket.on("makeMove", ({ gameId, index, symbol }) => {
        const game = games[gameId];
        if (!game || game.board[index] !== null || game.turn !== symbol) return;

        game.board[index] = symbol;
        game.turn = game.turn === "X" ? "O" : "X";

        io.to(gameId).emit("updateBoard", { board: game.board, turn: game.turn });

        const winner = checkWinner(game.board);
        if (winner) {
            io.to(gameId).emit("gameOver", { winner });
            delete games[gameId];
        } else if (!game.board.includes(null)) {
            io.to(gameId).emit("gameOver", { winner: "TIE" });
            delete games[gameId];
        }
    });
};


const handleDisconnect = (socket) => {
    socket.on("disconnect", () => {
        for (const gameId in games) {
            games[gameId].players = games[gameId].players.filter(player => player.id !== socket.id);
            if (games[gameId].players.length === 0) {
                delete games[gameId];
            }
        }
    });
};


const getGameState = (req, res) => {
    const { gameId } = req.params;
    if (!games[gameId]) return res.status(404).json({ error: "המשחק לא נמצא" });

    res.json(games[gameId]);
};

const setupSocket = (socket, io) => {
    joinGame(socket, io);
    makeMove(socket, io);
    handleDisconnect(socket);
};

module.exports = { setupSocket, getGameState };
