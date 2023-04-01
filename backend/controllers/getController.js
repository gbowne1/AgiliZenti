import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient({ log: ["error", "warn", "info"] });

export default class controller {
  static async auth(req, res) {
    if (req.cookies.JWT) {
      try {
        const payload = await JWT.verify(
          req.cookies.JWT,
          process.env.JWT_SECRET || "secret"
        );

        res.status(200).json({
          success: true,
          body: payload,
          message: "OK",
        });
      } catch (e) {
        res.clearCookie("JWT");
        res.status(403).json({
          success: false,
          body: null,
          message: "Forbidden",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        body: null,
        message: "Forbidden",
      });
    }
  }

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
      const user = await prisma.user.findUnique({
        where: {
          username: req.query.username,
        },
        select: {
          password: true,
          email: true,
        },
      });

      if (!user.password) {
        res.status(404).json({
          success: false,
          body: null,
          message: "Username doesn't exist",
        });
      } else if (await bcrypt.compare(req.query.password, user.password)) {
        const token = await JWT.sign(
          {
            username: req.query.username,
            email: user.email,
          },
          process.env.JWT_SECRET || "secret"
        );

        res.cookie("JWT", token, {
          httpOnly: true,
          // secure:true,
        });

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

  static async googleFail(req, res) {
    res.status(500).json({
      success: false,
      body: null,
      message: "authentication failed",
    });
  }

  static async googleSuccess(req, res) {
    //-------------------validation-------------------
    if (!req.user.email) {
      res.redirect("/api/login/google/fail");
      return;
    }

    //------------------database connection-------------------
    let user;
    try {
      user = await prisma.user.findUnique({
        where: {
          email: req.user.email,
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

    if (user) {
      //login
      const token = await JWT.sign(
        {
          username: user.username,
          email: req.user.email,
        },
        process.env.JWT_SECRET || "secret"
      );

      res.cookie("JWT", token, {
        httpOnly: true,
        // secure:true,
      });

      res.redirect(process.env.FRONTEND_DOMAIN || "http://127.0.0.1:3000");
    } else {
      //register
      try {
        let username = req.user.email.slice(0, req.user.email.length - 10);
        let temp = 1;

        while (
          (await prisma.user.count({ where: { username: username } })) > 0
        ) {
          username += temp;
          temp++;
        }
        await prisma.user.create({
          data: {
            username: username,
            email: req.user.email,
            verify: true,
          },
        });

        const token = await JWT.sign(
          {
            username: username,
            email: req.user.email,
          },
          process.env.JWT_SECRET || "secret"
        );

        res.cookie("JWT", token, {
          httpOnly: true,
          // secure:true,
        });

        res.redirect(process.env.FRONTEND_DOMAIN || "http://127.0.0.1:3000");
      } catch (e) {
        res.status(500).json({
          success: false,
          body: null,
          message: "Internal error",
        });
      }
    }
  }
}
