import { Router } from "express";

import { login, refreshAccessToken } from "../../controllers/auth.js";

const authRouter = Router();

authRouter.post("/login", login);

authRouter.post("/refresh_access_token", refreshAccessToken);

export default authRouter;
