import express, { Router } from "express";
import { createPost, getAllPosts, getPostById } from "../../controllers/post.js";
import CA from "../../exceptions/catchAsync.js";
import userMustHaveLoggedIn from "../../middleware/userMustHaveLoggedIn.js";
import requireAdminRole from "../../middleware/requireAdminRole.js";

const postRouter = Router();

postRouter.post(
  "/create",
  CA(userMustHaveLoggedIn),
  CA(requireAdminRole),
  CA(createPost)
);

postRouter.get("/getall", (getAllPosts));

postRouter.get("/:postId", CA(getPostById));

export default postRouter;
