import { customErrorlog } from "../consolelog.js";
import { errorResponse } from "../utils/responseHelper.js";

export const roleMiddleware = (req, res, next) => {
  try {
    const { role } = req.user;

    if (role === "admin") {
      return next();
    }

    customErrorlog("Access denied: not an admin");
    return errorResponse(res, "Access denied: not an admin");
  } catch (error) {
    customErrorlog(error.message);
    errorResponse(res, error.message);
  }
};
