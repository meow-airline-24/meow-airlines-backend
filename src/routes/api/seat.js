import express, { Router } from "express";
import { createSeatsForFlightId } from "../../controllers/seat.js";
import CA from "../../exceptions/catchAsync.js"

const seatRouter = Router();

seatRouter.post("/create", CA(createSeatsForFlightId));

export default seatRouter;

