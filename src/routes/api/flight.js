import { Router } from "express";
import {
  createFlight,
  getFlightInfoById,
  searchFlight,
} from "../../controllers/flight.js";
import CA from "../../exceptions/catchAsync.js";
import userMustHaveLoggedIn from "../../middleware/userMustHaveLoggedIn.js";
import requireAdminRole from "../../middleware/requireAdminRole.js";

const flightRouter = Router();

flightRouter.post("/search", CA(searchFlight));

flightRouter.post(
  "/create",
  CA(createFlight)
);

flightRouter.get("/:flightId", CA(getFlightInfoById));

export default flightRouter;
