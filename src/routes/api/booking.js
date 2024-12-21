import { Router } from "express";
import {
  createBookings,
  getBookingById,
  checkBookingsHistory,
} from "../../controllers/booking.js";
import CA from "../../exceptions/catchAsync.js";
import userMustHaveLoggedIn from "../../middleware/userMustHaveLoggedIn.js";

const bookingRouter = Router();

bookingRouter.post("/create", CA(userMustHaveLoggedIn), CA(createBookings));

bookingRouter.get(
  "/history",
  CA(userMustHaveLoggedIn),
  CA(checkBookingsHistory)
);

bookingRouter.get("/:bookingId", CA(getBookingById));

export default bookingRouter;
