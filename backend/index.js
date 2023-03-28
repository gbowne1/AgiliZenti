import express from "express";
import cookieParser from "cookie-parser";

import getRouter from './routes/getRoutes.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api",getRouter());

app.listen(process.env.BACKEND_PORT || 3001,() => {
    console.log(`Backend is running on port ${process.env.BACKEND_PORT || 3001}`);
});