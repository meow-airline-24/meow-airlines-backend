import Booking from "../models/bookings.js";
import Flight from "../models/flights.js";
import Seat from "../models/seats.js";
import HttpException from "../exceptions/HttpException.js";
import { createTicket } from "../controllers/ticket.js";
import { sendEmail } from "./email.js";

export async function createBookings(req, res) {
  try {
    const { itinerary, type, flightClass, email, phone, passengers } = req.body;

    // Validate request body
    if (!itinerary || !Array.isArray(itinerary) || itinerary.length === 0) {
      throw new HttpException(
        400,
        "Itinerary must contain at least one flight."
      );
    }
    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
      throw new HttpException(400, "At least one passenger is required.");
    }
    if (!email || !phone) {
      throw new HttpException(400, "Contact information is incomplete.");
    }
    if (!type) {
      throw new HttpException(400, "Type information is incomplete.");
    }
    if (
      !flightClass ||
      !Array.isArray(flightClass) ||
      flightClass.length != itinerary.length
    ) {
      throw new HttpException(400, "Flight class information is incomplete.");
    }

    // Validate flights in the itinerary
    for (const flightId of itinerary) {
      const flight = await Flight.findById(flightId);
      if (!flight) {
        throw new HttpException(404, `Flight with ID ${flightId} not found.`);
      }
    }

    // Validate passengers
    for (const passenger of passengers) {
      const { name, dob, gender, id_type, id_number, country_code } = passenger;
      if (
        !name ||
        !dob ||
        gender == undefined ||
        !id_type ||
        !id_number ||
        !country_code
      ) {
        throw new HttpException(400, "Passenger information is incomplete.");
      }
    }

    let totalAmount = 0;

    // Initialize booking object
    const booking = new Booking({
      type: type,
      people_number: passengers.length,
      user_id: req.user._id,
      flight_id: itinerary,
      total_amount: totalAmount,
      email: email,
      phone: phone,
    });

    // Process each passenger and reserve seats
    for (const passenger of passengers) {
      let seatArray = [];
      for (const [index, flight_id] of itinerary.entries()) {
        console.log(
          `Finding seat for flight ID: ${flight_id}, class: ${flightClass}`
        );
        const seat = await Seat.findOne({
          flight_id: flight_id,
          class: flightClass[index],
          availability: true,
        });

        if (!seat) {
          console.error(`Error: No available seat for flight ${flight_id}`);
          throw new HttpException(
            400,
            `Seat is not available for flight ID ${flight_id}.`
          );
        }

        console.log(`Seat found: ${seat._id} (Price: ${seat.price})`);
        seatArray.push(seat._id);
        totalAmount += seat.price;
        seat.availability = false;
        await seat.save();
        console.log(`Seat ${seat._id} saved with updated availability.`);
      }

      console.log(`Creating ticket for passenger: ${passenger.name}`);
      await createTicket(
        booking._id,
        "confirmed",
        passenger.name,
        Date(passenger.dob),
        passenger.gender,
        passenger.id_type,
        passenger.id_number,
        passenger.country_code,
        seatArray
      );
    }

    booking.total_amount = totalAmount; // Finalize total amount
    console.log("Finalizing booking:", booking);
    await booking.save();
    console.log("Booking saved successfully:", booking);
    await sendEmail(booking._id, email);
    res.status(200).json(booking);
  } catch (error) {
    console.error("Error in createBookings:", error.message, error.stack);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
}

export async function getBookingById(req, res) {
  const { bookingId } = req.params;
  if (!bookingId || typeof bookingId !== "string")
    throw new HttpException(400, "Invalid bookingId");

  const booking = await Booking.findOne({ _id: bookingId });

  if (!booking) return res.status(404).json({ error: "Flight not found!" });
  res.status(200).json(booking);
}

export async function checkBookingsHistory(req, res) {
  const Bookings = await Booking.find({ user_id: req.user.user_id });
  res.status(200).json(Bookings);
}
