import User from "../models/users.js";
import bcrypt from "bcryptjs";
import HttpException from "../exceptions/HttpException.js";

async function hash(password) {
  return await bcrypt.hash(password, 10);
}

export async function createAdmin(req, res) { // debug
  const { email, password, name, gender, id_type, id_number } = req.body;

  if (await User.findOne({ email })) {
    throw new HttpException(409, "Email already registered.");
  }
  const pwhash = await hash(password);

  let role = "admin";

  let newUser = await User.create({
    email,
    pwhash,
    name,
    role,
    gender,
    id_type,
    id_number,
  });

  newUser = newUser.toObject();
  delete newUser.pwhash;

  res.status(200).json(newUser);
}

export async function testAdmin(req, res) {
  const user = req.user.toObject();
  delete user.pwhash;
  res.status(200).json(user);
}
