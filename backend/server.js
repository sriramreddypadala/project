const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Create an express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Store connected players
let players = {};

// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Handle new WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Add the new player with random color and position
    players[socket.id] = {
        id: socket.id,
        x: Math.floor(Math.random() * 800),
        y: Math.floor(Math.random() * 600),
        color: getRandomColor() // Assign random color to each player
    };

    // Send the existing players to the newly connected player
    socket.emit('currentPlayers', players);

    // Notify all other players about the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // Handle player movement
    socket.on('move', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x += movementData.x;
            players[socket.id].y += movementData.y;

            // Ensure the player stays within the bounds of the canvas
            players[socket.id].x = Math.max(0, Math.min(780, players[socket.id].x));
            players[socket.id].y = Math.max(0, Math.min(580, players[socket.id].y));

            // Broadcast the updated player position to all players
            io.emit('playerMoved', players[socket.id]);
        }
    });

    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);

        // Remove the player from the players object
        delete players[socket.id];

        // Notify all other players that this player disconnected
        io.emit('playerDisconnected', socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
