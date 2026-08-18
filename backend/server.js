require("dotenv").config();

const http = require('http');
const { Server } = require('socket.io');

const app = require("./app");
const connectDB = require("./config/db");
const seedAdmin = require("./utils/seedAdmin");

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend and vendor apps
    methods: ["GET", "POST"]
  }
});

// Attach io to app so we can use it in routes
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  // Vendors can join a room identified by their vendorId
  socket.on('joinVendorRoom', (vendorId) => {
    socket.join(vendorId);
    console.log(`Vendor ${vendorId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Database Connection
connectDB().then(() => {
  seedAdmin();
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});