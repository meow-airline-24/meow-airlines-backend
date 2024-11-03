import { Schema, model } from "mongoose";

const AircraftModelSchema = new Schema({
  model_name: { type: String, unique: true, required: true },
  capacity: { type: Number, required: true },
  rows: { type: Number, required: true },
  columns: { type: Number, required: true },
  manufacturer: { type: String, required: true }
});

const AircraftModel = model("AircraftModel", AircraftModelSchema);
export default AircraftModel;
