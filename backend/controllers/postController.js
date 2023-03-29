import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["error", "warn", "info"] });

export default class controller {
  static async register(req, res) {
    //-------------------validation-------------------
    if (
      typeof req.body.username !== "string" ||
      typeof req.body.password !== "string"
    ) {
      res.status(400).json({
        success: false,
        body: null,
        message: "Both username and password must be string",
      });
      return;
    } else if (req.body.username.length < 5) {
      res.status(400).json({
        success: false,
        body: null,
        message: "Username length must be bigger than 4",
      });
      return;
    } else if (req.body.password.length < 8) {
      res.status(400).json({
        success: false,
        body: null,
        message: "Password length must be bigger than 7",
      });
      return;
    }

    //------------------database connection-------------------
    let checkUsername;
    try {
      checkUsername = await prisma.user.findUnique({
        where: {
          username: req.body.username,
        },
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        body: null,
        message: "Internal error",
      });
      return;
    }

    if (checkUsername) {
      res.status(400).json({
        success: false,
        body: null,
        message: "Username already exists",
      });
    } else {
      let user;
      try {
        const encyptedPassword = await bcrypt.hash(req.body.password, 10);

        user = await prisma.user.create({
          data: {
            username: req.body.username,
            password: encyptedPassword,
          },
        });
      } catch (e) {
        res.status(500).json({
          success: false,
          body: null,
          message: "Internal error",
        });
        return;
      }

      res.status(201).json({
        success: true,
        body: user.id,
        message: "OK",
      });
    }
  }
}
