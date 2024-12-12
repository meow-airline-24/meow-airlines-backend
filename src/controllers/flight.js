import Flight from "../models/flights.js";
import HttpException from "../exceptions/HttpException.js";
import Seat from "../models/seats.js";
import User from "../models/users.js";
// import cron from "node-cron";
import {mongoose, Types} from "mongoose"; // xử lý ObjectId
import crypto from "crypto";

export async function createFlight(req, res) {
    const {
        flight_number,
        airline,
        departure_airport,
        arrival_airport,
        departure_time,
        arrival_time,
        book_exp,
        aircraft_id,
    } = req.body;

    try {
        // Validate aircraft_id if provided
        const aircraftObjectId = aircraft_id && mongoose.Types.ObjectId.isValid(aircraft_id)
            ? new mongoose.Types.ObjectId(aircraft_id)
            : null;

        // Create a new flight
        const newFlight = await Flight.create({
            flight_number,
            airline,
            departure_airport,
            arrival_airport,
            departure_time: departure_time ? new Date(departure_time) : null,
            arrival_time: arrival_time ? new Date(arrival_time) : null,
            book_exp: book_exp ? new Date(book_exp) : null,
            aircraft_id: aircraftObjectId,
        });

        res.status(201).json(newFlight);
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {}).join(", ");
            return res.status(400).json({ error: `Duplicate value for ${field}` });
        }

        console.error("Error creating flight:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}



export async function getFlightInfoById(req, res) {
    try {
        const { flightId } = req.params;

        if (!flightId || typeof flightId !== "string") {
            throw new Error("Invalid flightId");
        }

        console.log("Received flightId:", flightId);
        
        // Convert flightId to ObjectId and log it
        const flightObjectId = stringToObjectId(flightId);
        console.log("Converted Flight ObjectId:", flightObjectId);
        
        // Try using findOne to bypass any potential issues with findById
        const flight = await Flight.findOne({ id: flightObjectId });
        
        console.log("Retrieved flight:", flight);

        if (!flight) {
            return res.status(404).json({ error: "Flight not found!" });
        }

        res.status(200).json(flight);
    } catch (error) {
        console.error("Error fetching flight info:", error.message);
        res.status(500).json({ error: error.message });
    }
}

export async function searchFlight(req, res) {
    const {
        departure_airport,
        arrival_airport,
        departure_time,
        arrival_time,
        number_people,
    } = req.body;
    
    console.log(number_people + " of type: " + typeof(number_people))
    
    try {

        // Validate `number_people
        if (number_people <= 0) {
            throw new HttpException(400, "`number_people` must be a positive integer.");
        }

        // Construct the flight query
        const query = {};

        if (departure_airport) query.departure_airport = departure_airport;
        if (arrival_airport) query.arrival_airport = arrival_airport;

        // Handle partial or full departure_time
        if (departure_time) {
            const departureStart = new Date(departure_time);
            const departureEnd = new Date(departureStart);
            departureEnd.setDate(departureEnd.getDate() + 1);

            query.departure_time = {
                $gte: departureStart,
                $lt: departureEnd,
            };
        }

        // Handle partial or full arrival_time
        if (arrival_time) {
            const arrivalStart = new Date(arrival_time);
            const arrivalEnd = new Date(arrivalStart);
            arrivalEnd.setDate(arrivalEnd.getDate() + 1);

            query.arrival_time = {
                $gte: arrivalStart,
                $lt: arrivalEnd,
            };
        }

        // Query matching flights
        const flights = await Flight.find(query);

        if (flights.length === 0) {
            return res.status(404).json({ message: "No flights found matching criteria" });
        }

        const results = [];

        for (const flight of flights) {
            // Fetch available seats
            const seats = await Seat.find({
                flight_id: flight._id,
                availability: true,
            });

            console.log(`Seats found for flight ${flight.flight_number}:`, seats.length);

            const seatClasses = ["First", "Business", "Economy"];
            const prices = {};

            // Calculate prices for each class
            for (const seatClass of seatClasses) {
                const classSeats = seats.filter(seat => seat.class === seatClass).sort((a, b) => a.price - b.price);

                console.log("classSeats lenght: " + classSeats.length);

                if (classSeats.length >= number_people) {
                    prices[seatClass] = classSeats
                        .slice(0, number_people)
                        .reduce((sum, seat) => sum + seat.price, 0);
                    console.log("aaa: " + prices[seatClass]);
                } else {
                    prices[seatClass] = null; // Not enough seats
                }

                console.log(`${seatClass} seats:`, classSeats.length, `Price:`, prices[seatClass]);
            }

            results.push({
                flight: {
                    id: flight._id,
                    flight_number: flight.flight_number,
                    airline: flight.airline,
                    departure_airport: flight.departure_airport,
                    arrival_airport: flight.arrival_airport,
                    departure_time: flight.departure_time,
                    arrival_time: flight.arrival_time,
                    book_exp: flight.book_exp,
                    aircraft_id: flight.aircraft_id,
                },
                prices,
            });
        }

        return res.status(200).json({ flights: results });
    } catch (error) {
        console.error("Error searching flights:", error);
        res.status(error.status || 500).json({ message: error.message });
    }
}



// Xóa flight khi book_exp của nó hết hạn 
// export function startFlightCleanupTask() {
//     cron.schedule("0 0 * * *", async () => {
//         try {
//             const now = new Date();
//             const result = await Flight.deleteMany({ book_exp: { $lt: now } });
//             console.log(`Deleted ${result.deletedCount} expired flights.`);
//         } catch (error) {
//             console.error("Error deleting expired flights:", error);
//         }
//     });
// }
