import { Schema, model, ObjectId } from "mongoose";

const BookingSchema = new Schema({
  user_id: { type: ObjectId, ref: "User", required: true },
  flight_id: [{ type: ObjectId, ref: "Flight", required: true }], // Array of flight IDs
  booking_time: { type: Date, default: Date.now },
  status: { type: String, enum: ["confirmed", "canceled", "pending"], default: "pending" },
  total_amount: { type: Number, required: true },
  email: {type:String, required: true },
  phone: {type:String, required: true }
});

const Booking = model("Booking", BookingSchema);
export default Booking;
