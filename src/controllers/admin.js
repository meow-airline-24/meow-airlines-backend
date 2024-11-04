import User from "../models/users.js";

export async function testAdmin(req, res) {
  const user = req.user.toObject();
  delete user.pwhash;
  res.status(200).json(user);
}
