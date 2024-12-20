import { Schema, model, ObjectId } from "mongoose";

const SeatSchema = new Schema({
  flight_id: { type: ObjectId, ref: "Flight" },
  aircraft_id: { type: ObjectId, ref: "Aircraft", required: true },
  seat_number: { type: String, required: true },
  class: {
    type: String,
    enum: ["Economy", "Business", "First"],
    required: true,
  },
  availability: { type: Boolean, default: true },
  price: { type: Number, required: true },
});

SeatSchema.index({ flight_id: 1, seat_number: 1 }, { unique: true });

const Seat = model("Seat", SeatSchema);
export default Seat;
