import express, { Router } from "express";
import Booking from "../models/bookings.js";
import Flight from "../models/flights.js";
import Seat from "../models/seats.js";
import HttpException from "../exceptions/HttpException.js";
const router = Router();
export default router;

export async function createBookings(req, res) {
    const { itinerary, passengers, contactInfo } = req.body; 

    try {
        if (!itinerary || !Array.isArray(itinerary) || itinerary.length === 0) {
            throw new HttpException(400, "Itinerary must contain at least one flight.");
        }
        if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
            throw new HttpException(400, "At least one passenger is required.");
        }
        if (!contactInfo || !contactInfo.email || !contactInfo.phone) {
            throw new HttpException(400, "Contact information is incomplete.");
        }

        let totalAmount = 0;
        for (const flightId of itinerary) {
            const flight = await Flight.findById(flightId);
            if (!flight) {
                throw new HttpException(404, `Flight with ID ${flightId} not found.`);
            }
        }

        for (const passenger of passengers) {
            const { seat_number, nin } = passenger;

            const seat = await Seat.findOne({
                seat_number,
                flight_id: { $in: itinerary },
                availability: true,
            });

            if (!seat) {
                throw new HttpException(400, `Seat ${seat_number} is not available.`);
            }

            totalAmount += seat.price;

            seat.availability = false;
            await seat.save();
        }

        // make booking
        const booking = new Booking({
            type: itinerary.length === 1 ? "one-way" : "multi-city", // thank you gpt / hình như nó làm connecting flight?
            user_id: req.user._id, 
            flight_id: itinerary,
            total_amount: totalAmount,
            email: contactInfo.email,
            phone: contactInfo.phone,
        });

        const savedBooking = await booking.save();

        res.status(200).json(savedBooking);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

export async function checkBookings (req, res) {
    try {
        const user = req.user;
        if (!user) {
            throw new HttpException(401, "You are not logged in!")
        }
        const userBookings = await Booking.find({
            user_id: user._id,
            "flight_id.departure_time": { $gt: currentTime }, // chỉ list những chuyến chưa bay thôi
          }).populate("flight_id");

        if (!Bookings || Bookings.length === 0) {
            throw new HttpException(404, "You currently have no bookings.")
        }

        res.status(200).json(Bookings);
    } catch(e) {
        console.error(e);
        throw new HttpException(500, "There was an error processing your request.")
    }
}

export async function checkBookingsHistory (req, res) {
    try {
        const user = req.user;
        if (!user) {
            throw new HttpException(401, "You are not logged in!")
        }
        const Bookings = await Booking.find({ user_id: user.user_id });

        if (!Bookings || Bookings.length === 0) {
            throw new HttpException(404, "You have no bookings.")
        }

        res.status(200).json(Bookings);
    } catch(e) {
        console.error(e);
        throw new HttpException(500, "There was an error processing your request.")
    }
}