import { Schema, model, ObjectId } from "mongoose";

const FlightSchema = new Schema({
  flight_number: { type: String, unique: true, required: true }, 
  airline: { type: String, required: true },
  departure_airport: { type: String, required: true },
  arrival_airport: { type: String, required: true },
  departure_time: { type: Date, required: true },
  arrival_time: { type: Date, required: true },
  book_exp: { type: Date, required: true }, 
  aircraft_id: { type: ObjectId, ref: "Aircraft" }, 
});

const Flight = model("Flight", FlightSchema);
export default Flight;
