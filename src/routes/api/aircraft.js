import express, { Router } from "express";
import CA from "../../exceptions/catchAsync.js";
import userMustHaveLoggedIn from "../../middleware/userMustHaveLoggedIn.js";
import requireAdminRole from "../../middleware/requireAdminRole.js";
import { createAircraft, updateAircraft } from "../../controllers/aircraft.js";
const aircraftRouter = Router();

aircraftRouter.post(
    "/create",
    CA(userMustHaveLoggedIn),
    CA(requireAdminRole),
    CA(createAircraft)
)

aircraftRouter.post(
    "/edit",
    CA(userMustHaveLoggedIn),
    CA(requireAdminRole),
    CA(updateAircraft)
)

export default aircraftRouter;