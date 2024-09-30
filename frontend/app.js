const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Connect to the WebSocket server
const socket = io();

// Store player data
let players = {};

// Draw players on the canvas as circles
function drawPlayers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    for (let id in players) {
        const player = players[id];
        ctx.fillStyle = player.color || 'blue'; // Use player color if defined
        ctx.beginPath();
        ctx.arc(player.x + 10, player.y + 10, 10, 0, Math.PI * 2); // Draw a circle
        ctx.fill();
    }
}

// Handle player movement and boundary conditions
window.addEventListener('keydown', (event) => {
    let movement = { x: 0, y: 0 };

    switch (event.key) {
        case 'ArrowUp':
            movement.y = -5;
            break;
        case 'ArrowDown':
            movement.y = 5;
            break;
        case 'ArrowLeft':
            movement.x = -5;
            break;
        case 'ArrowRight':
            movement.x = 5;
            break;
    }

    // Send the movement data to the server
    socket.emit('move', movement);
});

// Listen for the current players from the server
socket.on('currentPlayers', (serverPlayers) => {
    players = serverPlayers;
    drawPlayers();
});

// Listen for new players joining
socket.on('newPlayer', (newPlayer) => {
    players[newPlayer.id] = newPlayer;
    drawPlayers();
});

// Listen for player movement
socket.on('playerMoved', (movedPlayer) => {
    players[movedPlayer.id] = movedPlayer;
    drawPlayers();
});

// Listen for players disconnecting
socket.on('playerDisconnected', (id) => {
    delete players[id];
    drawPlayers();
});
