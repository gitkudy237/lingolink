require("dotenv").config();
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { setupSocketIO } from "./services/socketService";

const port = Number(process.env.PORT) || 4000;

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupSocketIO(io);

server.listen(port, () => {
  console.log(`Lingolink backend listening on port ${port}`);
});