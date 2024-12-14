import Booking from "../models/bookings.js";
import Flight from "../models/flights.js";
import Seat from "../models/seats.js";
import HttpException from "../exceptions/HttpException.js";
import createTicket from "../controllers/ticket.js";

export async function createBookings(req, res) {
  const { itinerary, type, flightClass, email, phone, passengers } = req.body;
  if (!itinerary || !Array.isArray(itinerary) || itinerary.length === 0) {
    throw new HttpException(400, "Itinerary must contain at least one flight.");
  }
  if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
    throw new HttpException(400, "At least one passenger is required.");
  }
  if (!email || !phone)
    throw new HttpException(400, "Contact information is incomplete.");
  if (!type) throw new HttpException(400, "Type information is incomplete.");
  if (!flightClass)
    throw new HttpException(400, "Flight class information is incomplete.");

  for (const flightId of itinerary) {
    const flight = await Flight.findById(flightId);
    if (!flight) {
      throw new HttpException(404, `Flight with ID ${flightId} not found.`);
    }
  }

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

  // make booking
  const booking = new Booking({
    type: type,
    people_number: passengers.length,
    user_id: req.user._id,
    flight_id: itinerary,
    total_amount: totalAmount,
    email: email,
    phone: phone,
  });

  for (const passenger of passengers) {
    let seatArray = [];
    for (const flight_id of itinerary) {
      //console.log(flight_id);
      const seat = await Seat.findOne({
        flight_id: flight_id,
        class: flightClass,
        availability: true,
      });

      if (!seat) throw new HttpException(400, `Seat is not available.`);
      seatArray.push(seat._id);
      totalAmount += seat.price;
      // console.log(totalAmount);
      seat.availability = false;
      await seat.save();
    }
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

  await booking.save();
  res.status(200).json(booking);
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
