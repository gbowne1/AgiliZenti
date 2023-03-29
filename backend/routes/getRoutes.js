import express from "express";

import controller from "../controllers/getController.js";

const router = express.Router();

router.get("/login", controller.login);

export default router;
