import { Router } from "express";
import CA from "../../exceptions/catchAsync.js";
import { getSelfUserInfo, createUser } from "../../controllers/user.js";
import userMustHaveLoggedIn from "../../middleware/userMustHaveLoggedIn.js";

const userRouter = Router();

userRouter.post("/register", CA(createUser));

userRouter.get("/info", CA(userMustHaveLoggedIn), CA(getSelfUserInfo));

export default userRouter;
