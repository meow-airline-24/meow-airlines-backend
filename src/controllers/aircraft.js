import express, { Router } from "express";
import HttpException from "../exceptions/HttpException.js";
import AircraftModel from "../models/aircraft_models.js";
import Aircraft from "../models/aircrafts.js";

export async function createAircraft(req, res) {
  try {
    const { model, manufacture_year, status } = req.body;
    const aircraftModel = await AircraftModel.findOne({ model_name: model });
    if (!aircraftModel) {
      throw new HttpException(
        404,
        `Model '${model}' does not exist! Cannot create aircraft.`
      );
    }
    // the same model and manufacture_year is already registered
    const existingAircraft = await Aircraft.findOne({
      model,
      manufacture_year,
      status,
    });
    if (existingAircraft) {
      throw new HttpException(409, "Aircraft already registered.");
    }
    const newAircraft = await Aircraft.create({
      model,
      manufacture_year,
      status: status ?? "Active",
    });
    console.log("New Aircraft created:", newAircraft);
    return res.status(201).json(newAircraft);
  } catch (error) {
    console.error("Error creating Aircraft:", error);
    res
      .status(error.statusCode || 500)
      .json({ error: error.message || "Internal server error." });
  }
}

export async function updateAircraft(req, res) {
  try {
    const { _id, model, manufacture_year, status } = req.body;
    let aircraft = await Aircraft.findById(_id);
    if (!aircraft) {
      throw new HttpException(404, "Aircraft not found!");
    }
    aircraft.model = model || aircraft.model;
    aircraft.manufacture_year = manufacture_year || aircraft.manufacture_year;
    aircraft.status = status || aircraft.status;
    const updatedAircraft = await aircraft.save();
    return res.status(200).json(updatedAircraft);
  } catch (error) {
    console.error("Error updating flight:", error);
    res.status(500).json({ message: "Internal Server Error." });
  }
}

export async function getAllAircraft(req, res) {
  const aircrafts = await Aircraft.find();
  res.status(200).json(aircrafts);
}
