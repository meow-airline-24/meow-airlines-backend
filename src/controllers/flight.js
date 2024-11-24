import Flight from "../models/flights.js";
import HttpException from "../exceptions/HttpException.js";
import User from "../models/users.js";

export async function createFlight(req, res) {
    const { flightId, flight_number, airline, departure_airport, 
        arrival_airport, departure_time, arrival_time, aircraft_id } = req.body;
    if (await User.findOne({flightId})) {
        throw new HttpException(409, "Flight already registered.");
    }
    if (loggedInUser.role !== "admin") {
        throw new HttpException(401, "Only admins can make new flights.")
    }

    let newFlight = await Flight.create({
        flightId,
        flight_number,
        airline,
        departure_airport,
        arrival_airport,
        departure_time,
        arrival_time,
        book_exp,
        aircraft_id,
    });
    newFlight = newFlight.toObject();

    res.status(200).json(newFlight);
}

export async function getFlightInfoById(req, res) {
    const { flightId } = req.params; // Use flightId to match the dynamic route segment
    try {
        const flight = await Flight.findById(flightId);

        if (!flight) {
            throw new HttpException(404, "Flight not found!");
        }

        res.status(200).json(flight);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
}

export async function searchFlight(req, res) {
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
