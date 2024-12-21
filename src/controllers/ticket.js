import Ticket from "../models/tickets.js";
import HttpException from "../exceptions/HttpException.js";
import Booking from "../models/bookings.js";
import Seat from "../models/seats.js";
import Flight from "../models/flights.js";

export async function createTicket(
  reqOrBookingId,
  status = null,
  passenger_name = null,
  dob = null,
  gender = null,
  id_type = null,
  id_number = null,
  country_code = null,
  seat_id = null
) {
  let payload = {};
  // Determine if it's called as a utility or route handler
  if (typeof reqOrBookingId === "object" && reqOrBookingId.body) {
    // Called as an HTTP route
    const {
      booking_id,
      status,
      passenger_name,
      dob,
      gender,
      id_type,
      id_number,
      country_code,
      seat_id,
    } = reqOrBookingId.body;
    payload = {
      booking_id,
      status,
      passenger_name,
      dob,
      gender,
      id_type,
      id_number,
      country_code,
      seat_id,
    };
  } else {
    // Called as a utility function
    payload = {
      booking_id: reqOrBookingId,
      status,
      passenger_name,
      dob,
      gender,
      id_type,
      id_number,
      country_code,
      seat_id,
    };
  }
  try {
    const ticket = await Ticket.create(payload);
    console.log("Created new Ticket: ", ticket);
    return ticket;
  } catch (error) {
    console.log("Error creating ticket: ", error);
    throw new HttpException(500, "Error creating ticket.");
  }
}

export async function updateTicket(req, res) {
  // user must have logged in, need auth
  const {
    _id,
    booking_id,
    status,
    passenger_name,
    dob,
    gender,
    id_type,
    id_number,
    country_code,
    cancel, 
  } = req.body;
  try {
    let ticket = await Ticket.findById(_id);
    if (!ticket) {
      throw new HttpException(409, "Ticket doesn't exist!");
    }
    const { seat_id } = ticket; 
    const allFlightsExpired = await Promise.all(
      seat_id.map(async (seatId) => {
        const seat = await Seat.findById(seatId);
        if (!seat) {
          throw new HttpException(404, `Seat with ID ${seatId} not found`);
        }

        const flight = await Flight.findById(seat.flight_id);
        if (!flight) {
          throw new HttpException(404, `Flight with ID ${seat.flight_id} not found`);
        }
        const { book_exp } = flight;
        return Date.now() >= new Date(book_exp).getTime(); 
      })
    );
    if (allFlightsExpired.every((expired) => expired)) {
      throw new HttpException(
        403,
        `Cannot update ticket: All associated flights have expired. Ticket ID: ${ticket._id}`
      );
    }
    if (cancel) {
      ticket.status = "canceled";
      const updatedTicket = await ticket.save();
      const { seat_id } = updatedTicket;
      await Seat.updateMany(
        { _id: { $in: seat_id } }, 
        { $set: { availability: true } }
      );
      return res.status(200).json({
        message: "Ticket canceled successfully",
        ticket: updatedTicket,
      });
    }
    // ticket.booking_id = booking_id || ticket.booking_id; t k nghĩ là m nên có quyền update booking id
    ticket.status = status || ticket.status;
    ticket.passenger_name = passenger_name || ticket.passenger_name;
    ticket.dob = dob || ticket.dob;
    ticket.gender = gender || ticket.gender;
    ticket.id_type = id_type || ticket.id_type;
    ticket.id_number = id_number || ticket.id_number;
    ticket.country_code = country_code || ticket.country_code;
    // ticket.seat_id = seat_id || ticket.seat_id;
    const updatedTicket = await ticket.save();
    return res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error); // Always log the full error
    
    if (error instanceof HttpException) {
      return res.status(error.status).json({ message: error.message }); // Explicit error forwarding
    }
    return res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
}

export async function publicSearchTicket(req, res) {
  try {
    const { _id, nin } = req.body;
    let ticket = await Ticket.findById(_id);
    if (!ticket) {
      throw new HttpException(404, "Ticket not found!");
    }
    return res.status(200).json(ticket);
  } catch (error) {
    console.log("Error finding ticket: ", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}

export async function searchTicketAuth(req, res) {
  // return list[Ticket]
  try {
    const { booking_id } = req.body; // booking_id, flight_id ? _id? can it find
    const booking = await Booking.findOne(booking_id);
    if (!booking) {
      throw new HttpException(404, `Booking with ID ${booking_id} not found.`);
    }
    const tickets = await Ticket.find(booking_id);
    return res.status(200).json(tickets);
  } catch (error) {
    console.log("Error finding ticket: ", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
}

export async function publicEditTicket(req, res) {
  try {
    const {
      id_type,
      id_number,
      status,
      passenger_name,
      dob,
      gender,
      country_code,
      cancel
    } = req.body;
    let ticket = await Ticket.findOne({ id_type, id_number });
    if (!ticket) {
      throw new HttpException(
        404,
        `Ticket with id number ${id_number} of type ${id_type} not found.`
      );
    }
    const { seat_id } = ticket; 
    const allFlightsExpired = await Promise.all(
      seat_id.map(async (seatId) => {
        const seat = await Seat.findById(seatId);
        if (!seat) {
          throw new HttpException(404, `Seat with ID ${seatId} not found`);
        }

        const flight = await Flight.findById(seat.flight_id);
        if (!flight) {
          throw new HttpException(404, `Flight with ID ${seat.flight_id} not found`);
        }
        const { book_exp } = flight;
        return Date.now() >= new Date(book_exp).getTime(); 
      })
    );
    if (allFlightsExpired.every((expired) => expired)) {
      throw new HttpException(
        403,
        `Cannot update ticket: All associated flights have expired. Ticket ID: ${ticket._id}`
      );
    }
    if (cancel) {
      ticket.status = "canceled";
      const updatedTicket = await ticket.save();
      const { seat_id } = updatedTicket;
      await Seat.updateMany(
        { _id: { $in: seat_id } }, 
        { $set: { availability: true } }
      );
      return res.status(200).json({
        message: "Ticket canceled successfully",
        ticket: updatedTicket,
      });
    }
    ticket.status = status || ticket.status;
    ticket.passenger_name = passenger_name || ticket.passenger_name;
    ticket.dob = dob || ticket.dob;
    ticket.gender = gender || ticket.gender;
    ticket.country_code = country_code || ticket.country_code;
    const newTicket = await ticket.save();
    console.log("New ticket: ", newTicket);
    return res.status(201).json(newTicket);
  } catch (error) {
    console.error("Error updating ticket:", error); // Always log the full error
    
    if (error instanceof HttpException) {
      return res.status(error.status).json({ message: error.message }); // Explicit error forwarding
    }
    return res.status(500).json({ message: "Internal Server Error", details: error.message });
  }
}

export async function ticketCount(req, res) {
  const currentYear = new Date().getFullYear();

  const ticketCounts = await Ticket.aggregate([
    {
      $match: {
        issuing_date: {
          $gte: new Date(`${currentYear}-01-01`),
          $lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$issuing_date" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 }, // Sort by month
    },
  ]);

  const monthlyCounts = Array(12).fill(0);

  ticketCounts.forEach(({ _id, count }) => {
    monthlyCounts[_id - 1] = count; // _id is the month number (1-12)
  });

  return res.status(200).json(monthlyCounts);
}

export default { createTicket }; // vì booking :)
// SyntaxError: The requested module '../controllers/ticket.js' does not provide an export named 'default'
