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

    socket.on("connect-to-peer",(data) => {
        console.log("Connecting to peer:",data);
        const receiverSocketId = getReceiverSocketId(data.from._id);
        io.to(receiverSocketId).emit("peer-connection-initiated",{to:data.to,from:data.from});
    })

    socket.on("send-offer",(data) => {
        console.log("Sending offer:",data);
        const receiverSocketId = getReceiverSocketId(data.to._id);
        io.to(receiverSocketId).emit("receive-offer",{to:data.to,from:data.from,offer:data.offer});
    })

    socket.on("send-answer",(data) => {
        console.log("Sending answer:",data);
        const receiverSocketId = getReceiverSocketId(data.from._id);
        io.to(receiverSocketId).emit("receive-answer",{to:data.to,from:data.from,answer:data.answer});
    })

    socket.on("end-call", (data) => {
        console.log("Call ended:", data);
        const receiverSocketId = getReceiverSocketId(data.to._id);
        io.to(receiverSocketId).emit("call-ended", { from: data.from });
    });
})

export {io,app,server};