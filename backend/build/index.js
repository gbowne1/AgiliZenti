import express from 'express';
import getRouter from './routes/getRouter.js';
const app = express();
//------------------middlewares------------------
app.use(express.json());
app.use("/api", getRouter);
app.listen(process.env.BACKEND_PORT || 3001, () => {
    console.log(`Backend is running on port ${process.env.BACKEND_PORT || 3001}`);
});
