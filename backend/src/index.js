import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import cron from "node-cron";
import fetch from "node-fetch";

// import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
// const __dirname = path.resolve(); 

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
// app.use(express.urlencoded({ extended: true }));

app.use( 
  cors({
    origin: "https://chating-with-anyone.vercel.app", 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the allowed methods
    credentials: true,
  }) 
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);



const BACKEND_URL = "https://chating-app-eujl.onrender.com/health";

cron.schedule("*/10 * * * *", async () => {
  try {
    await fetch(BACKEND_URL);
    console.log("Pinged backend to keep alive");
  } catch (err) {
    console.log("Ping failed", err);
  }
});



// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));
 
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});