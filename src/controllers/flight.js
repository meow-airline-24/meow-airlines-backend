import Flight from "../models/flights.js";
import HttpException from "../exceptions/HttpException.js";
import Seat from "../models/seats.js";
import User from "../models/users.js";
// import cron from "node-cron";
import {mongoose, Types} from "mongoose"; // xử lý ObjectId
import crypto from "crypto";

export async function createFlight(req, res) {
    const {
        id,
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
        // Validate id and aircraft_id to ensure they are valid ObjectId formats
        const flightId = id && mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : new mongoose.Types.ObjectId();
        const aircraftObjectId = aircraft_id && mongoose.Types.ObjectId.isValid(aircraft_id) ? new mongoose.Types.ObjectId(aircraft_id) : null;

        // Create flight
        const newFlight = await Flight.create({
            id: flightId,
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
    } = req.query;

    try {
        // Construct the flight query
        const query = {};
        if (departure_airport) query.departure_airport = departure_airport;
        if (arrival_airport) query.arrival_airport = arrival_airport;
        if (departure_time) query.departure_date = { $gte: new Date(departure_time) };
        if (arrival_time) query.arrival_date = { $lte: new Date(arrival_time) };

        const flights = await Flight.find(query);

        if (flights.length === 0) {
            return res.status(404).json({ message: "No flights found matching criteria" });
        }

        const results = [];

        for (const flight of flights) {
            // Get all available seats for the flight, categorized by class
            const seats = await Seat.find({
                flight_id: flight._id,
                availability: true
            });

            // Initialize price arrays for each class: First, Business, Economy
            let firstClassPrice = 0;
            let businessClassPrice = 0;
            let economyClassPrice = 0;

            // Separate seats by class
            const firstClassSeats = seats.filter(seat => seat.class === 'First').sort((a, b) => a.price - b.price);
            const businessClassSeats = seats.filter(seat => seat.class === 'Business').sort((a, b) => a.price - b.price);
            const economyClassSeats = seats.filter(seat => seat.class === 'Economy').sort((a, b) => a.price - b.price);

            // Calculate total price for First Class
            if (firstClassSeats.length >= parseInt(number_people, 10)) {
                firstClassPrice = firstClassSeats.slice(0, parseInt(number_people, 10)).reduce((sum, seat) => sum + seat.price, 0);
            }

            // Calculate total price for Business Class
            if (businessClassSeats.length >= parseInt(number_people, 10)) {
                businessClassPrice = businessClassSeats.slice(0, parseInt(number_people, 10)).reduce((sum, seat) => sum + seat.price, 0);
            }

            // Calculate total price for Economy Class
            if (economyClassSeats.length >= parseInt(number_people, 10)) {
                economyClassPrice = economyClassSeats.slice(0, parseInt(number_people, 10)).reduce((sum, seat) => sum + seat.price, 0);
            }

            // If there aren't enough seats, set price to 0
            if (firstClassPrice === 0) firstClassPrice = 0;
            if (businessClassPrice === 0) businessClassPrice = 0;
            if (economyClassPrice === 0) economyClassPrice = 0;

            // Add the flight and its price array to the results
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
                total_price: [firstClassPrice, businessClassPrice, economyClassPrice],
            });
        }

        // Return the results
        return res.status(200).json({ flights: results });
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message });
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
