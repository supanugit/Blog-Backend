import express from "express";
import { configDotenv } from "dotenv";
import { connectDB } from "./config/connetDB.js";
import morgan from "morgan";
import helmet from "helmet";
import authRoutes from "./routes/authentication.js";

import cloudinaryRoutes from "./routes/cloudinary.js";
import cors from "cors";
import { customSuccesslog } from "./consolelog.js";
import blogsRoutes from "./routes/blogs.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
configDotenv(); // load .env first
const app = express();
const port = process.env.PORT || 5000;

app.set("view engine", "ejs");

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
// Connect to MongoDB once
await connectDB();

// Routes
app.use("/api/blogs", blogsRoutes);

//auth route
app.use("/api/auth", authRoutes);

// app.use("/api/admin",)

//cloudinary admin panal
app.use("/api/cloudinary", cloudinaryRoutes);

// Start server
app.listen(port, () => {
  customSuccesslog(`Server is running on port ${port}`);
});
