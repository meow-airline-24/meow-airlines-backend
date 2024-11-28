import express, { Router } from "express";
import { createBookings, checkBookings, checkBookingsHistory } from "../../controllers/booking.js";
import CA from "../../exceptions/catchAsync.js";
const bookingsRouter = Router();

bookingsRouter.post("/create", CA(createBookings));
bookingsRouter.get("/:bookingId", CA(checkBookings));
bookingsRouter.get("/history", CA(checkBookingsHistory));

export default bookingsRouter;

