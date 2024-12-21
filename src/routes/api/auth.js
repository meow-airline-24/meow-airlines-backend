import { Router } from "express";
import CA from "../../exceptions/catchAsync.js";
import { login, refreshAccessToken, logout } from "../../controllers/auth.js";

const authRouter = Router();

authRouter.post("/login", CA(login));

authRouter.get("/logout", CA(logout));

authRouter.get("/refresh_access_token", CA(refreshAccessToken));

export default authRouter;
