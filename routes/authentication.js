import express from "express";
import { errorResponse, successResponse } from "../utils/responseHelper.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { logFunction } from "../utils/logFunction.js";
import { User } from "../models/shema/user.js";
import { comparePassword, hashPassword } from "../utils/passwordHelper.js";
import { customErrorlog } from "../consolelog.js";
import jwt from "jsonwebtoken";
import { validateEmail } from "../utils/validateEmail.js";
const router = express.Router();

//acc creation router
router.post("/register", authLimiter, async (req, res) => {
  logFunction("/api/auth/register", "post");
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: "Credentials not provided" });
    }
    const validEmail = await validateEmail(email);
    if (!validEmail) {
      return errorResponse(res, "Not a validEmail", 400);
    }
    const user = await User.findOne({ email });

    if (!user) {
      const hashedPassword = await hashPassword(password);
      var uname = email.split("@")[0];
      console.log("Uname is ", uname);
      const forbiddenPrefixes = ["admin", "root", "system"];

      if (
        forbiddenPrefixes.some((prefix) =>
          uname.toLowerCase().startsWith(prefix)
        )
      ) {
        uname = `user.fake.${uname}`;
      }

      const newAcc = await User.create({
        email,
        password: hashedPassword,
        name: uname,
      });
      return res.status(201).json({
        message: "successfully Created",
      });
    }
    return res.status(409).json({ message: "User already exists" });
  } catch (error) {
    customErrorlog(error);
    return errorResponse(res, "Internal server error", 500);
  }
});

// login router
router.post("/login", authLimiter, async (req, res) => {
  logFunction("/api/auth/login", "post");
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ message: "Credentials not provided" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, "Invalid credentials", 401);
      // return res.render("register");
    }
    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return errorResponse(res, "Invalid credentials", 401);
    }
    const jwt_Token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("token", jwt_Token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });
    return successResponse(res, "Login successful", 200);
  } catch (error) {
    customErrorlog(error);
    return errorResponse(res, "Internal server error", 500);
  }
});

//logout route
router.get("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
  return successResponse(res, "", "successfully Logout");
});

export default router;
