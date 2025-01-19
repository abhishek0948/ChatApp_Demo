import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDb } from "./lib/db.js";

import {app,server} from "../src/lib/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5001

app.use(express.json())
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

server.listen(PORT,() => {
    connectDb();
    console.log(`Server is Running on ${PORT} and connected to DB`);
})