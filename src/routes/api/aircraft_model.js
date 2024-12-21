import express, { Router } from "express";
import requireAdminRole from "../../middleware/requireAdminRole.js";
import CA from "../../exceptions/catchAsync.js";
import { createAircraftModel, updateAircraftModel } from "../../controllers/aircraft_model.js";
import userMustHaveLoggedIn from "../../middleware/userMustHaveLoggedIn.js";
const aircraftModelRouter = Router();

aircraftModelRouter.post(
    "/create",
    CA(userMustHaveLoggedIn),
    CA(requireAdminRole),
    CA(createAircraftModel)
)

aircraftModelRouter.post(
    "/edit",
    CA(userMustHaveLoggedIn),
    CA(requireAdminRole),
    CA(updateAircraftModel)
)

export default aircraftModelRouter;