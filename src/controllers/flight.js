import Flight from "../models/flights.js";
import HttpException from "../exceptions/HttpException.js";
import Seat from "../models/seats.js";
import Aircraft from "../models/aircrafts.js";
import AircraftModel from "../models/aircraft_models.js";
import { createSeats } from "../controllers/seat.js";


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
// lúc tạo flight thì có aircraft id, ô tra xem model nó là j, xong từ model lấy size, r tạo 1 đống seat với flight id đó thôi
  try {
    // Create a new flight
    const newFlight = await Flight.create({
      flight_number,
      airline,
      departure_airport,
      arrival_airport,
      departure_time: departure_time ? new Date(departure_time) : null,
      arrival_time: arrival_time ? new Date(arrival_time) : null,
      book_exp: book_exp ? new Date(book_exp) : null,
      aircraft_id: aircraft_id,
    });

    res.status(201).json(newFlight);
    console.log("Created flight:", newFlight);
    const aircraft = await Aircraft.findById(aircraft_id);
    if (!aircraft) {
      throw new HttpException(404, `Can't find aircraft of ${aircraft_id}`);
    }
    const { model } = aircraft; 
    const aircraftModel = await AircraftModel.findOne({model_name: model});
    const { rows, columns } = aircraftModel;

    console.log(`First Class: ${rows[0]} rows, ${columns[0]} columns`);
    console.log(`Business Class: ${rows[1]} rows, ${columns[1]} columns`);
    console.log(`Economy Class: ${rows[2]} rows, ${columns[2]} columns`);
    const createdSeats = [];
    let aircraft_next_row = 1;
      
    // Seat Class: First
    for (let i = aircraft_next_row; i <= rows[0]; i++) {
      for (let j = 0; j < columns[0]; j++) {
        const seatNumber = `${String.fromCharCode(65 + j)}${i}`;
        const createdSeat = await createSeats(newFlight._id, aircraft_id, seatNumber, 'First', true, 5000);
        createdSeats.push(createdSeat);
      }
    }
    aircraft_next_row = aircraft_next_row + rows[0];
    // Seat Class: Business
    let business_row_end = rows[0] + rows[1];
    for (let i = aircraft_next_row; i <= business_row_end; i++) {
      for (let j = 0; j < columns[1]; j++) {
        const seatNumber = `${String.fromCharCode(65 + j)}${i}`;
        const createdSeat = await createSeats(newFlight._id, aircraft_id, seatNumber, 'Business', true, 3000);
        createdSeats.push(createdSeat);
      }
    }
    aircraft_next_row = aircraft_next_row + rows[1];
    let economy_row_end = business_row_end + rows[2];
    // Seat Class: Economy
    for (let i = aircraft_next_row; i <= economy_row_end; i++) {
      for (let j = 0; j < columns[2]; j++) {
        const seatNumber = `${String.fromCharCode(65 + j)}${i}`;
        const createdSeat = await createSeats(newFlight._id, aircraft_id, seatNumber, 'Economy', true, 1000);
        createdSeats.push(createdSeat);
      }
    }
      
    console.log(`Seats created for flightid ${newFlight._id}: ${createdSeats.length}`);

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {}).join(", ");
      console.log(error);
      return res.status(400).json({ error: `Duplicate value for ${field}` });
    }

    console.error("Error creating flight:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

export async function updateFlight(req, res) {
  const { _id, flight_number, airline, departure_airport, arrival_airport, departure_time, 
    arrival_time, book_exp, aircraft_id } = req.body;

  try {
    let flight = await Flight.findById(_id);
    if (!flight && flight_number) {
      flight = await Flight.findOne({ flight_number });
    }
    if (!flight) {
      return res.status(404).json({ message: "Flight not found!" });
    }
    flight.flight_number = flight_number || flight.flight_number;  // if user didnt fill, use old value
    flight.airline = airline || flight.airline;
    flight.departure_airport = departure_airport || flight.departure_airport;
    flight.arrival_airport = arrival_airport || flight.arrival_airport;
    flight.departure_time = departure_time || flight.departure_time;
    flight.arrival_time = arrival_time || flight.arrival_time;
    flight.book_exp = book_exp || flight.book_exp;
    flight.aircraft_id = aircraft_id || flight.aircraft_id;
    const updatedFlight = await flight.save();
    res.status(200).json(updatedFlight);
  } catch (error) {
    console.error("Error updating flight:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
}


export async function getFlightInfoById(req, res) {
  const { flightId } = req.params;
  if (!flightId || typeof flightId !== "string")
    throw new HttpException(400, "Invalid flightId");
  // Try using findOne to bypass any potential issues with findById
  const flight = await Flight.findOne({ _id: flightId });
  //console.log("Retrieved flight:", flight);
  if (!flight) return res.status(404).json({ error: "Flight not found!" });
  res.status(200).json(flight);
}

export async function searchFlight(req, res) {
  const { departure_airport, arrival_airport, departure_time, number_people } =
    req.body;
  //console.log(number_people + " of type: " + typeof number_people);
  try {
    // Validate `number_people
    if (number_people <= 0) {
      throw new HttpException(
        400,
        "`number_people` must be a positive integer."
      );
    }
    // Construct the flight query
    const query = {};

    if (departure_airport) query.departure_airport = departure_airport;
    if (arrival_airport) query.arrival_airport = arrival_airport;

    // Handle partial or full departure_time
    if (departure_time) {
      const departureStart = new Date(departure_time);
      departureStart.setHours(0, 0, 0, 0); // Set time to 0:00:00.000

      const departureEnd = new Date(departure_time);
      departureEnd.setHours(24, 0, 0, 0); // Set time to 24:00:00.000 (start of the next day)

      query.departure_time = {
        $gte: departureStart,
        $lt: departureEnd,
      };
    }

    // Query matching flights
    const flights = await Flight.find(query);

    if (flights.length === 0) {
      return res
        .status(404)
        .json({ message: "No flights found matching criteria" });
    }

    const results = [];

    for (const flight of flights) {
      // Fetch available seats
      const seats = await Seat.find({
        flight_id: flight._id,
        availability: true,
      });

      //console.log(`Seats found for flight ${flight.flight_number}:`,seats.length);

      const seatClasses = ["First", "Business", "Economy"];
      const prices = {};

      // Calculate prices for each class
      for (const seatClass of seatClasses) {
        const classSeats = seats
          .filter((seat) => seat.class === seatClass)
          .sort((a, b) => a.price - b.price);

        //console.log("classSeats lenght: " + classSeats.length);

        if (classSeats.length >= number_people) {
          prices[seatClass] = classSeats
            .slice(0, number_people)
            .reduce((sum, seat) => sum + seat.price, 0);
          //console.log("aaa: " + prices[seatClass]);
        } else {
          prices[seatClass] = null; // Not enough seats
        }

        //console.log(`${seatClass} seats:`,classSeats.length,`Price:`,prices[seatClass]);
      }

      if (Object.values(prices).every(price => price === null)) {
        throw new HttpException(409, `Could not find a flight with enough seats for ${number_people} passengers!`);
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
