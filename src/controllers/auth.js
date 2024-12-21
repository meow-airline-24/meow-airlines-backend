import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/users.js";
import HttpException from "../exceptions/HttpException.js";
import { DEBUG } from "../../env.js";

/**
 * Salt is to be embedded into JWT so that with the same base data, tokens are generated different each time.
 * For this purpose, salts are also required to be different each time they are acquired.
 */
function generateSalt() {
  return Date.now().toString() + (Math.random() * 19).toString();
}

function generateAccessToken(user, expiresIn = DEBUG ? "7d" : "1d") {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      salt: generateSalt(),
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn,
    }
  );
}

export async function logout(req, res) {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new HttpException(400, "No refresh token provided");
  }

  // Remove the refresh token from the server-side storage
  const tokenIndex = refreshTokens.indexOf(refreshToken);
  if (tokenIndex === -1) {
    throw new HttpException(403, "Invalid refresh token");
  }

  refreshTokens.splice(tokenIndex, 1); // Remove the refresh token

  // Clear the refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false, // Change to true in production for HTTPS
    path: "/",
  });

  res.status(200).json({
    message: "Logged out successfully",
  });
}

function generateRefreshToken(user, expiresIn = "30d") {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      salt: generateSalt(),
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn,
    }
  );
}

const refreshTokens = [];

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpException(404, "No user with such email address");
  }

  const isMatch = await bcrypt.compare(password, user.pwhash);
  if (!isMatch) {
    throw new HttpException(401, "Incorrect password");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  refreshTokens.push(refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // if true, HTTPS only
    path: "/",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });

  res.status(200).json({
    accessToken,
  });
}

export async function refreshAccessToken(req, res) {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new HttpException(400, "No refresh token");
  }
  if (!refreshTokens.includes(refreshToken)) {
    throw new HttpException(403, "Refresh token is invalid");
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new HttpException(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new HttpException(404, "User not found");

  const accessToken = generateAccessToken(user);
  res.status(200).json({
    accessToken,
  });
}
