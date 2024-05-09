import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());

const onlineUsers = {};

io.on("connection", (socket) => {
  console.log(`A user connected`);

  socket.on("user-logged-in", (userName) => {
    onlineUsers[socket.id] = userName;
    io.emit("updateOnlineUsers", Object.values(onlineUsers));
    console.log(`${userName} has logged in`);
    console.log("Online Users:", onlineUsers);
  });

  socket.on("user-logged-out", () => {
    const userName = onlineUsers[socket.id];
    delete onlineUsers[socket.id];
    io.emit("updateOnlineUsers", Object.values(onlineUsers));
    console.log(`${userName} has logged out`);
    console.log("Online Users:", onlineUsers);
  });

  socket.on("disconnect", () => {
    const userName = onlineUsers[socket.id];
    delete onlineUsers[socket.id];
    io.emit("updateOnlineUsers", Object.values(onlineUsers));
    console.log(`${userName} has disconnected`);
    console.log("Online Users:", onlineUsers);
  });
});

app.get("/online-users", (req, res) => {
  res.send(Object.values(onlineUsers));
});

// app.get("/backgammon", (req, res) => {
//   res.redirect("http://localhost:5174/");
// });

const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  console.log(`Express.js microservice listening on port ${port}`);
});
