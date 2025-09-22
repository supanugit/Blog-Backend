import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  //10 min
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  // handler: (req, res, options) => {
  //   console.warn(`Rate limit exceeded for IP: ${req.ip}`);
  // },
});

export const writeLimiter = rateLimit({
  //10 min
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many requests, please try again later.",
});

export const readLimiter = rateLimit({
  //10 min
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
