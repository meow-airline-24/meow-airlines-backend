import User from "../models/users.js";
import bcrypt from "bcryptjs";
import HttpException from "../exceptions/HttpException.js";

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
  const { email, password, name, gender, id_type, id_number } = req.body;

  if (await User.findOne({ email })) {
    throw new HttpException(409, "Email already registered.");
  }
  const pwhash = await hash(password);

  let role = "customer";

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

export async function updateUser(req, res) {
  const { email, password, name, gender, id_type, id_number } = req.body;
  const loggedInUser = req.user;

  // Validation rules for unique fields
  const uniqueFields = [
    { field: "email", error: "Email already registered by another user" },
    { field: "id_number", error: "ID number already registered by another user" },
  ];

  for (const { field, error } of uniqueFields) {
    if (req.body[field]) {
      const existingUser = await User.findOne({ [field]: req.body[field] });
      if (
        existingUser &&
        existingUser._id.toString() !== loggedInUser._id.toString()
      ) {
        throw new HttpException(409, error);
      }
      loggedInUser[field] = req.body[field];
    }
  }

  // Special logic for password
  if (password) {
    loggedInUser.pwhash = await hash(password);
  }

  // General updates for other fields
  const updatableFields = { name, gender, id_type };
  for (const [key, value] of Object.entries(updatableFields)) {
    if (value) {
      loggedInUser[key] = value;
    }
  }

  // Validation: If `id_type` is updated, `id_number` is required
  if (id_type && !id_number) {
    throw new HttpException(400, "Changing ID type requires a new ID number.");
  }

  await loggedInUser.save();

  // Return updated user details, excluding sensitive information
  const updatedUser = loggedInUser.toObject();
  delete updatedUser.pwhash;

  res.status(200).json(updatedUser);
}


export async function deleteUser(req, res) {
  try {
    const userIdToDelete = req.body.userId; // UserId to delete
    const loggedInUser = req.user; // from`userMustHaveLoggedIn` middleware

    // Admin có thể xóa bất cứ user nào tùy theo Id, customer chỉ có thể xóa bản thân
    if (loggedInUser.role === "admin") {
      if (!userIdToDelete) {
        throw new HttpException(400, "Missing userId to be deleted");
      }

      const userToDelete = await User.findById(userIdToDelete);
      if (!userToDelete) {
        throw new HttpException(404, "User not found");
      }

      await User.deleteOne({ _id: userIdToDelete });
      return res
        .status(200)
        .json({ message: `User ${userIdToDelete} deleted successfully` });
    } else if (loggedInUser.role === "customer") {
      // chỉ có 2 role
      // Customers can only delete their own account
      const customerId = loggedInUser._id;

      if (userIdToDelete && userIdToDelete !== String(customerId)) {
        throw new HttpException(
          403,
          "Customers can only delete their own account"
        );
      }

      await User.deleteOne({ _id: customerId });
      return res
        .status(200)
        .json({ message: "Your account has been deleted successfully" });
    } else {
      throw new HttpException(403, "Unauthorized role");
    }
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
}
