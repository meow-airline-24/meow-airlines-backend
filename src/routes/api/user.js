import { Router } from "express";
import CA from "../../exceptions/catchAsync.js";
import { getSelfUserInfo, createUser, updateUser, deleteUser } from "../../controllers/user.js";
import userMustHaveLoggedIn from "../../middleware/userMustHaveLoggedIn.js";

const userRouter = Router();

userRouter.post("/register", CA(createUser));
userRouter.post("/edit", CA(userMustHaveLoggedIn), CA(updateUser));

userRouter.post("/delete", CA(userMustHaveLoggedIn), CA(deleteUser));

userRouter.get("/info", CA(userMustHaveLoggedIn), CA(getSelfUserInfo));

export default userRouter;
