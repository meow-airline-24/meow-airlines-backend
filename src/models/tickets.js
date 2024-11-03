import { Schema, model, ObjectId } from "mongoose";

const TicketSchema = new Schema({
  booking_id: { type: ObjectId, ref: "Booking", required: true },
  passenger_name: { type: String, required: true },
  dob: { type: Date, required: true },
  nin: { type: String },
  country_code: { type: Number },
  seat_number: { type: String, required: true },
  flight_id: { type: ObjectId, ref: "Flight", required: true },
  ticket_price: { type: Number, required: true },
});

const Ticket = model("Ticket", TicketSchema);
export default Ticket;
