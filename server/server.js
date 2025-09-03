import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import "dotenv/config";
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

//express and http server setup
const app = express();
const server = http.createServer(app);


//Initialize socket.io
export const io = new Server(server, {
    cors : {
        origin : "*",
    }
});

//store online users
export  const userSocketMap = {}; // {userID : socketID}

//socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("user connected with ID : ", userId);

    if(userId) userSocketMap[userId] = socket.id;

    //Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("user disconnected with ID : ", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
});


//Middleware setup
app.use(express.json({ limit: '4mb' }));
app.use(cors());

//Routes setup
app.use("/api/status", (req, res) => { res.send("Server is running") });
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

//Connect to MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});