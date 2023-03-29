import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["error", "warn", "info"] });

export default class controller {
  static async register(req, res) {
    //-------------------validation-------------------
    if (
      typeof req.body.username !== "string" ||
      typeof req.body.password !== "string" ||
      typeof req.body.email !== "string"
    ) {
      res.status(400).json({
        success: false,
        body: null,
        message: "Username, password and email must be string",
      });
      return;
    } else if (
      !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        req.body.email
      )
    ) {
      res.status(400).json({
        success: false,
        body: null,
        message: "Email is not valid",
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
    let checkUsernameEmail;
    try {
      checkUsernameEmail = await prisma.user.findFirst({
        where: {
          OR: [{ username: req.body.username }, { email: req.body.email }],
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

    if (checkUsernameEmail) {
      res.status(400).json({
        success: false,
        body: null,
        message: "Username or email already exists",
      });
    } else {
      let user;
      try {
        const encyptedPassword = await bcrypt.hash(req.body.password, 10);

        user = await prisma.user.create({
          data: {
            username: req.body.username,
            password: encyptedPassword,
            email: req.body.email,
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
