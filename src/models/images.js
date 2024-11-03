import { Schema, model } from "mongoose";

const ImageSchema = new Schema({
  filename: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true }
});

const Image = model("Image", ImageSchema);
export default Image;
