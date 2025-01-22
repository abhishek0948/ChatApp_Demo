import {Server} from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: ["http://localhost:5173"]
    }
})

const userSocketMap = {};

export function getReceiverSocketId (userId) {
    return userSocketMap[userId];
}

io.on("connection",(socket) => {
    console.log("User Connected",socket.id);
    
    const userId = socket.handshake.query.userId;
    if(userId) {
        userSocketMap[userId] = socket.id
    }

    io.emit("getOnlineUsers",Object.keys(userSocketMap))
    
    socket.on("disconnect",() => {
        console.log("User disconnected",socket.id);
        delete userSocketMap[userId];   
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    })

    socket.on("call-initiated",(data) => {
        console.log("Call initiated:",data);
        const receiverSocketId = getReceiverSocketId(data.to._id);
        console.log(receiverSocketId);
        io.to(receiverSocketId).emit("incoming-call",{caller:data.from});
    })

    socket.on("reject-call",(data) => {
        console.log("Call rejected:",data);
        const receiverSocketId = getReceiverSocketId(data.to._id);
        io.to(receiverSocketId).emit("call-rejected",{from:data.from});
    })

    socket.on("accept-call",(data) => {
        console.log("Call accepted:",data);
        const receiverSocketId = getReceiverSocketId(data.to._id);
        io.to(receiverSocketId).emit("call-accepted",{from:data.from});
    })
})

export {io,app,server};