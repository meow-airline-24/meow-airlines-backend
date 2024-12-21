import express, { Router } from "express";
import { createPost, getPostById } from "../../controllers/post.js";
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

postRouter.get("/:postId", CA(getPostById));

export default postRouter;
