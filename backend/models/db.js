import mongodb from "mongodb";
import bcrypt from "bcrypt";

import userModel from "./user.js";

export default class db {
  static async connect(func) {
    this.client = await mongodb.MongoClient.connect(
      process.env.DATABASE_URL || "mongodb://127.0.0.1:27017"
    );
    func(this.client);
  }

  static async existUser(username) {
    const count = await this.client
      .db(process.env.DB_NAME)
      .collection("users")
      .countDocuments({ username: username });

    return count > 0 ? true : false;
  }

  static async register(username, password) {
    if (typeof username !== "string" || typeof password !== "string") {
      throw new Error("Both username and password must be string");
    } else if (username.length < 5) {
      throw new Error("Username length must be bigger than 4");
    } else if (username.length < 8) {
      throw new Error("Password length must be bigger than 7");
    } else if (await this.existUser(username)) {
      throw new Error("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await this.client
      .db(process.env.DB_NAME)
      .collection("users")
      .insertOne({ username: username, password: hashedPassword });

    if (result.acknowledged) {
      return result.insertedId;
    } else {
      return false;
    }
  }

  static async login(username, password) {
    if (typeof username !== "string" || typeof password !== "string") {
      throw new Error("Both username and password must be string");
    } else if (username.length < 5) {
      throw new Error("Username length must be bigger than 4");
    } else if (username.length < 8) {
      throw new Error("Password length must be bigger than 7");
    }

    const user = await this.client
      .db(process.env.DB_NAME)
      .collection("users")
      .findOne({ username: username });

    if (!user) {
      throw new Error("Username doesn't exist");
    } else if (await bcrypt.compare(password, user.password)) {
      const userObject = new userModel(user._id, username);
      return userObject;
    } else {
      throw new Error("Password is wrong");
    }
  }
}
