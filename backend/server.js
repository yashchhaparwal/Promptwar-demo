const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const apiRoutes = require('./src/routes/api');
const densityService = require('./src/services/densityService');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Setup API routing
app.use('/', apiRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback route for React Router
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist/index.html'));
});

// Create HTTP server to be used with Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Immediately send current heatmap to newly connected client
    socket.emit('heatmap-update', densityService.getHeatmapData());

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Initialize background background service that generates density and emits events
densityService.init(io);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server is running on port ${PORT}`);
});
