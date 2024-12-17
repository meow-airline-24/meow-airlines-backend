import { Schema, model, ObjectId } from "mongoose";

const TicketSchema = new Schema({
  booking_id: { type: ObjectId, ref: "Booking", required: true },
  status: {
    type: String,
    enum: ["confirmed", "canceled"],
    required: true,
  },
  passenger_name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: Boolean, required: true },
  id_type: { type: String, enum: ["nin", "passport"], required: true },
  id_number: { type: String, required: true },
  issuing_date: { type: Date, default: Date.now }, // ticket count (yearly), created AT
  country_code: { type: Number, required: true },
  seat_id: [{ type: ObjectId, ref: "Seat", required: true }],
});

const Ticket = model("Ticket", TicketSchema);
export default Ticket;
