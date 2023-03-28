import express from "express";

import controller from "../controllers/getController.js";

const Router = express.Router();

Router.get("login", controller.login);

export default Router;
