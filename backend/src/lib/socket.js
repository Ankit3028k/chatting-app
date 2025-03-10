import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://chating-with-anyone.vercel.app", // Make sure to update this in production
  },
  transports: ["websocket", "polling"], // Force both WebSocket and Polling for compatibility
});

// This map holds the userId as the key and socketId as the value
const userSocketMap = {}; // { userId: socketId }

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Retrieve userId from the query parameters
  const userId = socket.handshake.query.userId;

  if (userId) {
    // Assign socket ID to the userId in the map
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socketId: ${socket.id}`);
  } else {
    console.error("No userId provided in handshake query");
  }

  // Emit the list of online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    // If the userId exists in the map, remove it
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
      console.log(`User ${userId} disconnected`);
    }

    // Emit the updated list of online users to all clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
