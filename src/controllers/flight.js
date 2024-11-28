import Flight from "../models/flights.js";
import HttpException from "../exceptions/HttpException.js";
import User from "../models/users.js";
// import cron from "node-cron";
import {mongoose, Types} from "mongoose"; // xử lý ObjectId
import crypto from "crypto";

function stringToObjectId(str) {
    const hash = crypto.createHash('sha256').update(str).digest('hex');

    // Use the first 24 characters of the hash directly to generate ObjectId
    return new Types.ObjectId(hash.substring(0, 24));  // Use only the first 24 characters
}


export async function createFlight(req, res) {
    const {
        flightId,
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
        // Convert flightId and aircraft_id into ObjectIds
        const flightObjectId = flightId ? stringToObjectId(flightId) : new Types.ObjectId();
        const aircraftObjectId = aircraft_id ? stringToObjectId(aircraft_id) : undefined;

        console.log("Generated flight id:", flightObjectId); // Debugging log

        const newFlight = await Flight.create({
            id: flightObjectId,
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
            // Handle duplicate key error
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


export async function searchFlight(req, res) { //search flight
    const {
        departure_airport,
        arrival_airport,
        departure_date,
        arrival_date,
        number_people,
    } = req.body;

    try {
        // Step 1: Search flights based on criteria
        const query = {};
        if (departure_airport) query.departure_airport = departure_airport;
        if (arrival_airport) query.arrival_airport = arrival_airport;
        if (departure_date) query.departure_date = { $gte: new Date(departure_date) };
        if (arrival_date) query.arrival_date = { $lte: new Date(arrival_date) };

        const flights = await Flight.find(query);

        if (flights.length === 0) {
            throw new HttpException(404, "No flights found matching criteria");
        }

        // Step 2: For each flight, calculate total_price considering seat availability
        const results = await Promise.all(
            flights.map(async (flight) => {
                const seats = await Seat.find({ 
                    flight_id: flight._id, 
                    availability: true 
                }).sort({ price: 1 }); // Sort by price ascending

                if (seats.length < number_people) {
                    // Not enough total seats available
                    return {
                        flight,
                        total_price: null,
                        message: "Not enough seats available for this flight", // flight này sẽ không xuất hiện trên query của người dùng
                    };
                }

                // Allocate seats for the passengers
                let total_price = 0;
                let seats_allocated = 0;

                for (const seat of seats) {
                    if (seats_allocated < number_people) {
                        total_price += seat.price;
                        seats_allocated++;
                    } else {
                        break;
                    }
                }

                return {
                    flight,
                    total_price,
                };
            })
        );

        // Step 3: Send response
        res.status(200).json(results);
    } catch (error) {
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
