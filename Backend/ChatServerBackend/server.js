import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const port = 3004;

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const userToSocketIdMap = {};
io.on("connection", (socket) => {
  console.log(`New connection`);

  socket.on("set_name", (name) => {
    socket.clientName = name;
    console.log(socket.id, socket.clientName, "connected");
    userToSocketIdMap[name] = socket.id;
    userToSocketIdMap[socket.id] = { userName: name, socketId: socket.id };
  });

  socket.on("send-message", async (msg) => {
    const { senderName, recipientName, text } = msg;

    try {
      let newMessage = {};
      newMessage = {
        senderName: senderName,
        receiverName: recipientName,
        messageText: text,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      console.log("Message sent:", newMessage);

      // Emit the message to the sender
      const senderSocketId = userToSocketIdMap[senderName];
      if (senderSocketId) {
        io.to(senderSocketId).emit("message", newMessage);
      }

      // Emit the message to the recipient if different from the sender
      if (recipientName !== senderName) {
        const recipientSocketId = userToSocketIdMap[recipientName];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("message", newMessage);
        }
      }
    } catch (error) {
      console.error("Error saving message to database:", error);
      // Optionally emit an error message back to the sender
      if (userToSocketIdMap[senderName]) {
        io.to(userToSocketIdMap[senderName]).emit(
          "error",
          "Failed to save message."
        );
      }
    }
  });

  socket.on("manual_disconnect", () => {
    if (socket.clientName) {
      socket.broadcast.emit(
        "message-broadcast",
        `${socket.clientName} manually disconnected.`
      );
    }
    socket.disconnect();
  });
  socket.on("disconnect", () => {
    const userName = userToSocketIdMap[socket.id]?.userName;
    if (userName) {
      delete userToSocketIdMap[socket.id];
      console.log(`User ${userName} disconnected`);
    }
  });
});
