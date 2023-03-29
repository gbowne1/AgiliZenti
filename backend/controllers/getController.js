import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["error", "warn", "info"] });

export default class controller {
  static async login(req, res) {
    //-------------------validation-------------------
    if (
      typeof req.query.username !== "string" ||
      typeof req.query.password !== "string"
    ) {
      res.status(400).json({
        success: false,
        body: null,
        message: "Both username and password must be string",
      });
      return;
    } else if (req.query.username.length < 5) {
      res.status(400).json({
        success: false,
        body: null,
        message: "Username length must be bigger than 4",
      });
      return;
    } else if (req.query.password.length < 8) {
      res.status(400).json({
        success: false,
        body: null,
        message: "Password length must be bigger than 7",
      });
      return;
    }

    //------------------database connection-------------------
    try {
      const password = await prisma.user.findUnique({
        where: {
          username: req.query.username,
        },
        select: {
          password: true,
        },
      });

      if (!password.password) {
        res.status(404).json({
          success: false,
          body: null,
          message: "Username doesn't exist",
        });
      } else if (await bcrypt.compare(req.query.password, password.password)) {
        res.status(200).json({
          success: true,
          body: null,
          message: "OK",
        });
      } else {
        res.status(403).json({
          success: false,
          body: null,
          message: "Password is wrong",
        });
      }
    } catch (e) {
      res.status(500).json({
        success: false,
        body: null,
        message: "Internal error",
      });
    }
  }
}
