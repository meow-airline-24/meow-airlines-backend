import { Router } from "express";

import { login, refreshAccessToken, logout } from "../../controllers/auth.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", logout); // cái này chưa hiểu, hình như phải dùng refresh token
authRouter.post("/refresh_access_token", refreshAccessToken);

export default authRouter;
