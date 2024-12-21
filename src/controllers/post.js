import Post from "../models/posts.js";

export async function createPost(req, res) {
  const { title, content } = req.body;
  // Validate the input
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  const post = new Post({
    title,
    content,
  });

  // Save the post to the database
  const savedPost = await post.save();

  res.status(201).json({
    message: "Post saved successfully",
    post: savedPost,
  });
}

export async function getPostById(req, res) {
  const { postId } = req.params;
  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  return res.status(200).json(post);
}

export async function getAllPosts(req, res) {
  const posts = await Post.find({}, "title _id");
  res.status(200).json(posts);
}
