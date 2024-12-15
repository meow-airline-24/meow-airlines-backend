import Seat from "../models/seats.js";
import HttpException from "../exceptions/HttpException.js";
import Flight from "../models/flights.js";
import { mongoose, Types } from "mongoose";

export async function createSeatsForFlightId(req, res) {
  console.log(req.body);
  const {
    flight_id,
    seat_number,
    class: seatClass,
    availability,
    price,
  } = req.body;
  try {
    // Check if the flight exists
    const flight = await Flight.findById(flight_id);
    if (!flight) {
      throw new HttpException(404, "Flight not found.");
    }

    // Check if the seat already exists for this flight
    const existingSeat = await Seat.findOne({ flight_id, seat_number });
    if (existingSeat) {
      throw new HttpException(
        409,
        "Seat with this number already exists for the flight."
      );
    }

    // Create a new seat
    const newSeat = await Seat.create({
      flight_id,
      seat_number,
      class: seatClass,
      availability: availability ?? true, // Default to true if not provided
      price,
    });

    return res.status(201).json(newSeat);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {}).join(", ");
      return res.status(400).json({ error: `Duplicate value for ${field}` });
    }

    console.error("Error creating seat:", error);
    res.status(error.status || 500).json({ message: error.message });
  }
}