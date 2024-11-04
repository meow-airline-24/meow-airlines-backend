import User from "../models/users.js";
import bcrypt from "bcryptjs";

async function hash(password) {
  // https://stackoverflow.com/a/67052696/13680015
  return await bcrypt.hash(password, 10);
}

export async function getSelfUserInfo(req, res) {
  const user = req.user.toObject();
  delete user.pwhash;
  res.status(200).json(user);
}

export async function createUser(req, res) {
  const { email, password, name, role } = req.body;

  if (role === "admin" && req.user.role !== "admin") {
    throw new HttpException(403, "Only admins can create other admins.");
  }
  
  if (await User.findOne({ email })) {
    throw new HttpException(409, "Email already registered");
  }
  const pwhash = await hash(password);

  let newUser = await User.create({
    email,
    pwhash,
    name,
    role,
  });

  newUser = newUser.toObject();
  delete newUser.pwhash;

  res.status(200).json(newUser);
}
