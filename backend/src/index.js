import express from 'express';
import cors from 'cors';
import "dotenv/config";
import {clerkMiddleware} from "@clerk/express";
import User from './models/user.model.js';
import {connectDB} from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import job from './jobs/cleanup.job.js';

import clerkWebhook from './webhooks/clerk.webhook.js';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const publicDir = path.join(process.cwd(), 'public');

app.use("/api/webhooks.clerk",express.raw({type:"application/json"}),clerkWebhook);


app.use(express.json());
app.use(cors({origin: FRONTEND_URL, credentials: true}));
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
    res.status(200).json({message: "Server is healthy"});
})

if(fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));

    app.get("/{*any}", (req, res, next) => {
        res.sendFile(path.join(publicDir, 'index.html'), (err) => next(err));
    });
}
app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);

    if(process.env.NODE_ENV === "production")job.start();
    
});