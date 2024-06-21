// Require necessary modules
require('dotenv').config(); // For loading environment variables from a .env file
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

// Initialize Express app
const app = express();

// Connect to MongoDB (adjust URL and options as needed)
mongoose.connect('mongodb://127.0.0.1:27017/chatApp')
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process on connection failure
  });

// Middleware for parsing JSON bodies
app.use(express.json());

// Import routes
const userRoute = require('./routes/userRoute'); // Adjust path as per your project structure
const Chat = require('./model/chatModel'); // Import your Chat model
const User = require('./model/userModel'); // Import your User model

// Use routes
app.use('/', userRoute);

// Start the HTTP server
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Socket.io setup
const io = socketIo(server);
const usp = io.of('/user-namespace'); // Namespace for user-related sockets

// Handle socket connections
usp.on('connection', async function(socket) {
  console.log('A user connected');
  const userId = socket.handshake.auth.token; // Get user ID from socket handshake

  // Update user's online status to true in MongoDB on connection
  await User.findByIdAndUpdate(userId, { $set: { is_online: true } });

  // Broadcast the online status to other clients
  socket.broadcast.emit('getOnlineUser', { user_id: userId, is_online: true });

  // Handle sending messages
  socket.on('sendMessage', async function(data) {
    // Log received message data
    console.log('Received message data:', data);
  
    if (!data) {
      console.error('No data received in sendMessage event');
      return;
    }
  
    const { senderId, receiverId, message } = data;
  
    // Emit the message to the receiver
    try {
      socket.broadcast.emit('newMessage', { senderId, receiverId, message });
    } catch (error) {
      console.error('Error emitting message:', error);
    }
  });
  
  // Handle disconnect event
  socket.on('disconnect', async function() {
    console.log('User disconnected');
    // Update user's online status to false in MongoDB on disconnect
    await User.findByIdAndUpdate(userId, { $set: { is_online: false } });

    // Broadcast the offline status to other clients
    socket.broadcast.emit('getOnlineUser', { user_id: userId, is_online: false });
  });

  // Handle loading old chats
  socket.on('existingChats', async (data) => {
    try {
      const chats = await Chat.find({
        $or: [
          { senderId: data.senderId, receiverId: data.receiverId },
          { senderId: data.receiverId, receiverId: data.senderId }
        ]
      }).sort({ createdAt: 1 }); // Sorting chats by creation date

      // Emit loaded chats back to the client
      socket.emit('loadchats', chats);
    } catch (error) {
      console.error('Error retrieving chats:', error);
    }
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
