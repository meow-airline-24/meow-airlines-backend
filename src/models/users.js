import { Schema, model, ObjectId } from "mongoose";

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true, index: true },
  pwhash: { type: String, required: true },
  name: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "customer"],
    required: true,
  },
  dob: { type: Date },
  nin: { type: String },
  country_code: { type: Number },
  phone: { type: String },
});

const User = model("User", UserSchema);
export default User;
