import { Router } from "express";
import {
  createFlight,
  getAllFlight,
  getFlightInfoById,
  searchFlight,
  updateFlight,
} from "../../controllers/flight.js";
import CA from "../../exceptions/catchAsync.js";
import userMustHaveLoggedIn from "../../middleware/userMustHaveLoggedIn.js";
import requireAdminRole from "../../middleware/requireAdminRole.js";

const flightRouter = Router();

flightRouter.post("/search", CA(searchFlight));

flightRouter.post(
  "/create",
  CA(userMustHaveLoggedIn),
  CA(requireAdminRole),
  CA(createFlight)
);

flightRouter.post(
  "/edit",
  CA(userMustHaveLoggedIn),
  CA(requireAdminRole),
  CA(updateFlight)
)

flightRouter.get(
  "/getall",
  CA(userMustHaveLoggedIn),
  CA(requireAdminRole),
  CA(getAllFlight)
)

flightRouter.get("/:flightId", CA(getFlightInfoById));

export default flightRouter;
