import { configDotenv } from "dotenv";
import mongoose from "mongoose";
import { customErrorlog, customSuccesslog } from "../consolelog.js";

configDotenv();
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    customSuccesslog(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    customErrorlog(err);
    process.exit(1);
  }
};
