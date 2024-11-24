import express, { Router } from "express";
import { getFlightInfoById } from "../../controllers/flight.js";
import CA from "../../exceptions/catchAsync.js";

const flightRouter = Router();

// flightRouter.get("/search", CA(searchFlight))
flightRouter.get("/:flightId", CA(getFlightInfoById));


export default flightRouter;