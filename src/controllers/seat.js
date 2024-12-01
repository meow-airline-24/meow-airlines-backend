import Seat from "../models/seats.js";
import HttpException from "../exceptions/HttpException.js";
import Flight from "../models/flights.js";

export async function createSeatsForFlightId(req, res) { //temp, for testing searchFlight
    const { id, flightId, seatNumber, class: seatClass, availability, price } = req.body;

    if (await Flight.findOne({ id: flightId })) { 
        if (await Seat.findOne({ id }) || await Seat.findOne({ seat_number: seatNumber })) {
            throw new HttpException(409, "Seat already exists.");
        }
    } else {
        throw new HttpException(404, "Flight not found.");
    }

    try {
        const newSeat = await Seat.create({
            flight_id: flightId, 
            seat_number: seatNumber, 
            class: seatClass,
            availability,
            price,
        });

        res.status(201).json(newSeat);
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {}).join(", ");
            return res.status(400).json({ error: `Duplicate value for ${field}` });
        }

        console.error("Error creating seat:", error);
        throw new HttpException(500, error.message);
    }
}
