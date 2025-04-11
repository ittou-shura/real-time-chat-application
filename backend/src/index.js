import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;

import express from 'express';

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";

import {connectDB} from "./lib/db.js";

import cookieparser from "cookie-parser";
import cors from "cors";

connectDB();

const app = express();

app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true,
}));
app.use(express.json());
app.use(cookieparser());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(3000, ()=>{
    console.log(`Server is running on PORT: ${PORT}`);
})