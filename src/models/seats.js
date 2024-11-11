import { Schema, model, ObjectId } from "mongoose";

const SeatSchema = new Schema({
  aircraft_id: { type: ObjectId, ref: "Aircraft", required: true },
  flight_id: { type: ObjectId, ref: "Flight", required: true },
  seat_number: { type: String, required: true },
  class: {
    type: String,
    enum: ["Economy", "Business", "First"],
    required: true,
  },
  availability: { type: Boolean, default: true },
  price: { type: Number, require: true },
});

const Seat = model("Seat", SeatSchema);
export default Seat;
