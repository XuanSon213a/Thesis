import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import getUserToken from '../../backend/helpers/getUserToken.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests from your frontend origin
    methods: ["GET", "POST"],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  },
});

// Store online users
const onlineUser = new Set();

io.on('connection', async (socket) => {
  console.log("User connected:", socket.id);

  const token = socket.handshake.auth.token;
  console.log("Received token:", token); // Debugging - log the token received

  try {
    // Verify token and retrieve user details
    const user = await getUserToken(token);

    if (!user || !user.id) {
      console.log("Invalid or expired token for socket ID:", socket.id);
      socket.emit("authError", "Authentication failed. Please log in again.");
      socket.disconnect(); // Disconnect the client if the token is invalid
      return;
    }

    console.log("Authenticated User:", user);

    // Add user to a room based on their user ID and track online users
    socket.join(user.id.toString());
    onlineUser.add(user.id.toString());

    // Notify all clients of the updated online user list
    io.emit('onlineUser', Array.from(onlineUser));

    // Example event listeners
    socket.on('exampleEvent', (data) => {
      console.log('Received data from client:', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      onlineUser.delete(user.id.toString());
      io.emit('onlineUser', Array.from(onlineUser)); // Update online users for all clients
    });
  } catch (error) {
    console.error("Error retrieving user from token:", error);
    socket.emit("authError", "Server error. Please try again.");
    socket.disconnect(); // Disconnect the client on error
  }
});




export { app, server };
