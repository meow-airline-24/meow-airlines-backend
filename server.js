import express from "express"; // Use import instead of require
import mongoose from "mongoose";

import router from "./src/routes/index.js";

import { DEBUG, MONGODB_URL, API_HOST, API_PORT } from "./env.js";


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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(API_PORT, () => {
  console.log(`Server running at http://localhost:${API_PORT}`);
});