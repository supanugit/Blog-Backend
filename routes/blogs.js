import express from "express";
import {
  authLimiter,
  readLimiter,
  writeLimiter,
} from "../middleware/rateLimiter.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { Blog } from "../models/shema/blogs.js";
import { errorResponse, successResponse } from "../utils/responseHelper.js";
import { customErrorlog, customSuccesslog } from "../consolelog.js";
import upload from "../utils/cloudinaryUpload.js";
import { logFunction } from "../utils/logFunction.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { Comment } from "../models/shema/comments.js";
import jwt from "jsonwebtoken";

const router = express.Router();
//Get all blog posts
router.get("/", readLimiter, async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "name").sort({
      createdAt: -1,
    });
    const token =
      req.cookies.token || req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return successResponse(
        res,
        { blog: blogs, author: [] },
        "successfully Fetched"
      );
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) {
        return successResponse(
          res,
          { blog: blogs, author: [] },
          "successfully Fetched"
        );
      }
      const userBlogs = await Blog.find({
        author: decoded.id,
      });
      // console.log("user blogs are ", userBlogs);
      var authorBlogsID = [];
      for (var eachblog of userBlogs) {
        authorBlogsID.push(eachblog._id);
        // console.log(eachblog._id);
      }
      // customSuccesslog(authorBlogsID);

      logFunction("get", "/api");
      return successResponse(
        res,
        { blog: blogs, author: authorBlogsID },
        "successfully Fetched"
      );
    } catch (error) {
      return successResponse(
        res,
        { blog: blogs, author: [] },
        "successfully Fetched"
      );
    }
  } catch (error) {
    console.log(error);
  }
});
//Get single blog post
router.get("/:_id", authMiddleware, readLimiter, async (req, res) => {
  const { _id } = req.params;
  console.log(_id);
  try {
    const blog = await Blog.findById(_id).populate("author", "name");

    if (!blog) {
      return errorResponse(res, "Blog not found");
    }
    return successResponse(res, blog, "successfully fetched");
  } catch (error) {
    customErrorlog(error.message);
    return errorResponse(res, "Internal server error", 500);
  }
});
//Add a post
router.post(
  "/",
  authMiddleware,
  writeLimiter,
  authLimiter,
  upload.single("image"),
  async (req, res) => {
    const { title, description } = req.body || {};
    // customErrorlog(req.user);
    // only email
    const author = req.user.id;
    const image = req.file?.path;
    // const image =
    //   "https://plus.unsplash.com/premium_photo-1757392183484-db7d416357a3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8";
    console.log("Author:", author.id);
    console.log("Title:", title);
    console.log("Description:", description);
    console.log("File:", image);
    if (!title || !description || !author || !image) {
      return errorResponse(res, "Fill all Feilds", 400);
    }
    try {
      const created = await Blog.create({
        title,
        description,
        author,
        image,
      });
      if (!created) {
        customErrorlog("Internal server error");
        return errorResponse(res, "Internal server error", 500);
      }
      return successResponse(res, "", "successfully created");
    } catch (error) {
      console.error("Blog creation error:", error);
      return errorResponse(res, "Internal server error", 500);
    }
  }
);
//Add Multi post
router.post(
  "/multi",
  authMiddleware,
  roleMiddleware,
  writeLimiter,
  authLimiter,
  upload.single("image"),
  async (req, res) => {
    const multiRes = Array.isArray(req.body) ? req.body : [req.body]; // ensure array
    customSuccesslog(req.body);
    // only email
    const author = "req.user";
    try {
      var results = [];
      var err = [];
      for (var blog of multiRes) {
        var title = blog.title;
        var description = blog.description;
        var image = blog.image;
        try {
          var created = await Blog.create({
            title,
            description,
            author,
            image,
          });
          if (created) {
            results.push(created);
          }
        } catch (error) {
          customErrorlog(error.message);
          err.push({ blog, message: error.message });
        }
      }
      if (err.length && !results.length) {
        return errorResponse(res, err);
      }

      return successResponse(res, { results, err }, "Multi blogs processed");
    } catch (error) {
      customErrorlog(error.message);
      errorResponse(res, error.message);
    }
  }
);
//Update a post
router.patch(
  "/:_id",
  authMiddleware,
  writeLimiter,
  authLimiter,
  async (req, res) => {
    const { _id } = req.params;
    // console.log(_id);
    // customSuccesslog(req.user.id);
    const { title, description } = req.body;
    try {
      // const data = await Blog.findById(_id);
      // console.log(data);
      const post = await Blog.findOneAndUpdate(
        { _id, author: req.user.id },
        {
          $set: {
            title,
            description,
          },
        },
        {
          new: true,
        }
      );
      if (!post) {
        return errorResponse(res, "Post not found or not authorized", 404);
      }
      return successResponse(res, post, "successfully updated");
    } catch (error) {
      customErrorlog(error);
      return errorResponse(res, "Internal server error", 500);
    }
  }
);
//Delete a post
router.delete(
  "/:id",
  authMiddleware,
  writeLimiter,
  authLimiter,
  async (req, res) => {
    const { id } = req.params;
    try {
      const deletePost = await Blog.findOneAndDelete({
        _id: id,
        author: req.user.id,
      });
      if (!deletePost) {
        return errorResponse(res, "Post not found or not authorized", 404);
      }
      return successResponse(res, "", "successfully deleted");
    } catch (error) {
      customErrorlog(error);
      return errorResponse(res, "Internal server error", 500);
    }
  }
);
//comment add
router.post("/comment/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const { ucomment } = req.body;
  const user = req.user.id;
  try {
    const comment = await Comment.create({
      userId: user,
      blogId: id,
      comment: ucomment,
    });
    if (comment) {
      return successResponse(res, "", "successfully added");
    }
    return errorResponse(res, "Internal server error", 500);
  } catch (error) {
    customErrorlog(error);
    errorResponse(res, error.message);
  }
});
//get the all comments for the each blog
router.get("/comments/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  // const { ucomment } = req.body;
  // const user = req.user.id;
  try {
    const comments = await Comment.find({ blogId: id })
      .populate("userId", "name")
      .sort({
        createdAt: -1,
      });
    if (comments) {
      return successResponse(res, comments, "successfully fetched !");
    }
    return errorResponse(res, "Internal server error", 500);
  } catch (error) {
    customErrorlog(error);
    errorResponse(res, error.message);
  }
});

export default router;
