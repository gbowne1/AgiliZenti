import express from 'express';

import controller from '../controllers/postController.js';

const Router = express.Router();

Router.post("register",controller.register);

export default Router;