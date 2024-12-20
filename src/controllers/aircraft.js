import HttpException from "../exceptions/HttpException.js";
import AircraftModel from "../models/aircraft_models.js";
import Aircraft from "../models/aircrafts.js";
import Seat from "../models/seats.js"; // Seat for creating seat entries
import { createSeats } from "../controllers/seat.js";

export async function createAircraft(req, res) {
    try {
      const { model, manufacture_year, status } = req.body;
  
      // Check if the Aircraft Model exists
      const aircraftModel = await AircraftModel.findOne({ model_name: model });
      if (!aircraftModel) {
        throw new HttpException(404, `Model '${model}' does not exist! Cannot create aircraft.`);
      }
  
      console.log("Retrieved Aircraft Model:", aircraftModel);
  
      // Extract rows and columns for first, business, and economy class from the aircraft model
      const { rows, columns } = aircraftModel;
  
      const firstClassRows = rows[0]; 
      const firstClassColumns = columns[0];
      const businessClassRows = rows[1];
      const businessClassColumns = columns[1];
      const economyClassRows = rows[2]; 
      const economyClassColumns = columns[2];
  
      console.log(`First Class: ${firstClassRows} rows, ${firstClassColumns} columns`);
      console.log(`Business Class: ${businessClassRows} rows, ${businessClassColumns} columns`);
      console.log(`Economy Class: ${economyClassRows} rows, ${economyClassColumns} columns`);
  
      if (!rows || !columns || firstClassRows + businessClassRows + economyClassRows > 100) {
        throw new HttpException(
          400,
          "AircraftModel must have valid rows and columns, and the total seat count should not exceed row x column capacity."
        );
      }
  
      // Check if an identical Aircraft is already registered
      const existingAircraft = await Aircraft.findOne({ model, manufacture_year, status });
      if (existingAircraft) {
        throw new HttpException(409, "Aircraft already registered.");
      }
  
      // Create the new Aircraft
      const newAircraft = await Aircraft.create({
        model,
        manufacture_year,
        status: status ?? "Active",
      });
  
      console.log("New Aircraft created:", newAircraft);
  
      // Create seats for the new aircraft
      let seatIndex = 0;
      const createdSeats = [];
      let aircraft_next_row = 1;
  
      // Seat Class: First
      for (let i = 1; i <= firstClassRows; i++) {
        for (let j = 0; j < firstClassColumns; j++) {
          const seatNumber = `${String.fromCharCode(65 + j)}${i}`;
          const createdSeat = await createSeats(newAircraft._id, seatNumber, 'First', true, 5000);
          createdSeats.push(createdSeat);
        }
        aircraft_next_row = i + 1; // Move to next row after First Class
      }
  
      // Seat Class: Business
      for (let i = 1; i <= businessClassRows; i++) {
        for (let j = 0; j < businessClassColumns; j++) {
          const seatNumber = `${String.fromCharCode(65 + j)}${aircraft_next_row + i}`;
          const createdSeat = await createSeats(newAircraft._id, seatNumber, 'Business', true, 3000);
          createdSeats.push(createdSeat);
        }
        aircraft_next_row = aircraft_next_row + businessClassRows; // Set next start row for economy
      }
  
      // Seat Class: Economy
      for (let i = 1; i <= economyClassRows; i++) {
        for (let j = 0; j < economyClassColumns; j++) {
          const seatNumber = `${String.fromCharCode(65 + j)}${aircraft_next_row + i}`;
          const createdSeat = await createSeats(newAircraft._id, seatNumber, 'Economy', true, 1000);
          createdSeats.push(createdSeat);
        }
      }
  
      console.log(`Seats created: ${createdSeats.length}`);
  
      // Respond with the new Aircraft and created seats
      return res.status(201).json({
        aircraft: newAircraft,
        seats: createdSeats,
      });
    } catch (error) {
      console.error("Error creating Aircraft:", error);
      res.status(error.status || 500).json({ error: error.message || "Internal server error." });
    }
  }
  
  

export async function updateAircraft(req, res) {
    try {
        const {_id, model, manufacture_year, status } = req.body;
        let aircraft = await Aircraft.findById(_id);
        if(!aircraft) {
            throw new HttpException(404, "Aircraft not found!");
        }
        aircraft.model = model || aircraft.model;
        aircraft.manufacture_year = manufacture_year || aircraft.manufacture_year;
        aircraft.status = status || aircraft.status;
        const updatedAircraft = await aircraft.save();
        return res.status(200).json(updatedAircraft);
    } catch(error) {
        console.error("Error updating flight:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
}