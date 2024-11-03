import { Schema, model, ObjectId } from "mongoose";

const PostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  coverImageUrl: { type: String },
  isPublished: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  author_id: { type: ObjectId, ref: "Admin", required: true }
});

const Post = model("Post", PostSchema);
export default Post;
