import { Router } from "express";
import CA from "../../exceptions/catchAsync.js";
import userMustHaveLoggedIn from "../../middleware/userMustHaveLoggedIn.js";
import requireAdminRole from "../../middleware/requireAdminRole.js"
import { testAdmin } from "../../controllers/admin.js";

const adminRouter = Router();

adminRouter.get("/testAdmin", CA(userMustHaveLoggedIn), CA(requireAdminRole),CA(testAdmin));

export default adminRouter;