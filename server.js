import express from "express"; // Use import instead of require
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

// import cron from "node-cron";
// import Flight from "./models/flight.js"; xóa Flight - cần k?

import router from "./src/routes/index.js";

import { DEBUG, MONGODB_URL, API_HOST, API_PORT } from "./env.js";

const corsOptions = {
  origin: (DEBUG ? "*" : ["127.0.0.1", API_HOST]),
  optionsSuccessStatus: 200
};

try {
  await mongoose.connect(MONGODB_URL);
  console.log("Connection to database established.");
} catch (error) {
  console.log("ERROR: Could not connect to database.");
  if (DEBUG) {
    console.log("MONGODB_URL =", MONGODB_URL);
  }
}

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(router);

// xóa flight hết hạn mỗi ngày
// startFlightCleanupTask();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(API_PORT, () => {
  console.log(`Server running at http://localhost:${API_PORT}`);
});
