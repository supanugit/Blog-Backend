import express from "express";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// GET /api/cloudinary/todos
router.get("/todos", async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "todos/", // only fetch files in "todos" folder
    });
    res.json({ success: true, images: result.resources });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch images" });
  }
});

export default router;
