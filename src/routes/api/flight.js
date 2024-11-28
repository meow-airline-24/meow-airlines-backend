import express, { Router } from "express";
import { createFlight, getFlightInfoById, searchFlight } from "../../controllers/flight.js";
import CA from "../../exceptions/catchAsync.js";

const flightRouter = Router();

flightRouter.get("/search", CA(searchFlight));
flightRouter.get("/:flightId", CA(getFlightInfoById));
flightRouter.post("/create", CA(createFlight)); // temp, về sau cho admin cái này thôi

export default flightRouter;