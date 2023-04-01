import express from "express";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";

import controller from "../controllers/getController.js";

const router = express.Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL:
        process.env.BACKEND_DOMAIN ||
        "http://127.0.0.1:3001" + "/api/login/google",
      scope: ["profile", "email"],
      state: true,
    },
    function verify(accessToken, refreshToken, profile, callback) {
      callback(null, profile);
    }
  )
);

router.get(
  "/login/google",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/login/google/fail",
  }),
  controller.googleSuccess
);

router.get("/login", controller.login);

router.get("/login/google/fail", controller.googleFail);

router.get("/auth", controller.auth);

export default router;
