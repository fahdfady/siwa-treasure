// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game state
const players = {};
const treasures = [];
const scores = {};

// Initialize treasures
for (let i = 0; i < 10; i++) {
    treasures.push({
        id: `treasure-${i}`,
        collected: false
    });
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Initialize player score
    scores[socket.id] = 0;

    // Handle player joining
    socket.on('playerJoin', (playerData) => {
        console.log('Player joined:', socket.id);
        players[socket.id] = playerData;

        // Send current game state to new player
        socket.emit('players', players);
        socket.emit('treasureUpdate', treasures);
        socket.emit('scoreUpdate', scores);

        // Notify other players
        socket.broadcast.emit('players', players);
    });

    // Handle player movement
    socket.on('playerMove', (playerData) => {
        players[socket.id] = playerData;
        socket.broadcast.emit('players', players);
    });

    // Handle treasure collection
    socket.on('treasureCollected', (treasureId) => {
        const treasureIndex = treasures.findIndex(t => t.id === treasureId);

        if (treasureIndex !== -1 && !treasures[treasureIndex].collected) {
            treasures[treasureIndex].collected = true;

            // Update player score
            scores[socket.id] += 10;

            // Broadcast updates
            io.emit('treasureUpdate', treasures);
            io.emit('scoreUpdate', scores);

            // Respawn treasure after a delay
            setTimeout(() => {
                treasures[treasureIndex].collected = false;
                io.emit('treasureUpdate', treasures);
            }, 30000); // 30 seconds
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete players[socket.id];
        delete scores[socket.id];
        io.emit('players', players);
        io.emit('scoreUpdate', scores);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});