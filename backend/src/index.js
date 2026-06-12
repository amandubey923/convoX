import express from 'express';
import cors from 'cors';
import "dotenv/config";
import {clerkMiddleware} from "@clerk/express";
import User from './models/user.model.js';
import {connectDB} from './lib/db.js';

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";


app.use(express.json());
app.use(cors({origin: FRONTEND_URL, credentials: true}));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
    res.status(200).json({message: "Server is healthy"});
})

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});