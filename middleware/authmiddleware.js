import jwt from "jsonwebtoken";
import { customErrorlog } from "../consolelog.js";
import { errorResponse } from "../utils/responseHelper.js";

export const authMiddleware = (req, res, next) => {
  // Get token from cookie
  const cookieToken = req.cookies?.token;
  // console.log(cookieToken);

  // Get token from Authorization header if exists
  const headerToken = req.headers?.authorization?.split(" ")[1];

  // Prefer cookie token, fallback to header token
  const token = cookieToken || headerToken;

  if (!token) {
    customErrorlog("Token is not found");
    return errorResponse(res, "Token is not found", 400);
  }

  try {
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(verify);
    req.user = verify; // attach decoded payload
    return next();
  } catch (error) {
    customErrorlog(error);
    return errorResponse(res, "Token is invalid", 400);
  }
};
