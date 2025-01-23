import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

import path from "path";

import { connectDb } from "./lib/db.js";

import {app,server} from "../src/lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001

const __dirname = path.resolve();

app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
    app.get("*",(req,res) => {
        res.sendFile(path.join(__dirname,"../frontend/dist/index.html"));
    });
}

server.listen(PORT,() => {
    connectDb();
    console.log(`Server is Running on ${PORT} and connected to DB`);
})