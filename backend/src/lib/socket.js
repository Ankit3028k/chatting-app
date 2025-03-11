import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Socket.IO server setup
const io = new Server(server, {
  cors: {
    origin: "https://chating-with-anyone.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 204,
  },
  
  transports: ["websocket", "polling"], // Force both WebSocket and Polling as fallback
});

const userSocketMap = {}; // Used to store online users {userId: socketId}

// Function to retrieve a socketId by userId
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// When a client connects
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  const userId = socket.handshake.query.userId;
  
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket id: ${socket.id}`);
  }

  // Emit the list of online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle user disconnecting
  socket.on("disconnect", () => {
    console.log(`A user disconnected: ${socket.id}`);
    
    // Remove user from userSocketMap
    if (userId) {
      delete userSocketMap[userId];
      console.log(`User ${userId} disconnected`);
    }

    // Emit the updated list of online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});



export { io, app, server };
