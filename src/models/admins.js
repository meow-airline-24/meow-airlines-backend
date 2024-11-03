import { Schema, model } from "mongoose";

const AdminSchema = new Schema({
  username: { type: String, unique: true, required: true, index: true },
  pwhash: { type: String, required: true },
  name: { type: String, required: true },
  dob: { type: Date },
});

const Admin = model("Admin", AdminSchema);
export default Admin;
