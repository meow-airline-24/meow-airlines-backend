import { Schema, model, ObjectId } from "mongoose";

const AircraftSchema = new Schema({
  model: { type: String, ref: "AircraftModel", required: true },
  manufacture_year: { type: Number, required: true },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
});

const Aircraft = model("Aircraft", AircraftSchema);
export default Aircraft;
