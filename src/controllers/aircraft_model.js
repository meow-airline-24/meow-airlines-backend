import AircraftModel from "../models/aircraft_models.js";
import HttpException from "../exceptions/HttpException.js";

export async function createAircraftModel(req, res) {
    try {
        const { model_name, capacity, rows, columns, manufacturer} = req.body;
        if (await AircraftModel.findOne({ model_name, capacity, rows, columns, manufacturer })) {
            throw new HttpException(409, "Aircraft Model already exists!");
        }
        const newAircraftModel = await AircraftModel.create({
        model_name,
        capacity,
        rows,
        columns,
        manufacturer,
        });
        res.status(201).json(newAircraftModel);
        console.log("New Model created: ", newAircraftModel);
    } catch (error) {
        console.log("Error creating Model: ", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
}

export async function updateAircraftModel(req, res) {
    try {
        const { _id, model_name, capacity, rows, columns, manufacturer } = req.body;
        let aircraftModel = await AircraftModel.findById(_id);
        if (!aircraftModel) {
            throw new HttpException(404, "Model doesn't exist!");
        }
        aircraftModel.model_name = model_name || aircraftModel.model_name;
        aircraftModel.capacity = capacity || aircraftModel.capacity;
        aircraftModel.rows = rows || aircraftModel.rows;
        aircraftModel.columns = columns || aircraftModel.columns;
        aircraftModel.manufacturer = manufacturer || aircraftModel.manufacturer;
        const updatedAircraftModel = await aircraftModel.save();
        res.status(201).json(updatedAircraftModel);
    } catch (error) {
        console.error("Error updating Model:", error);
        res.status(500).json({ message: "Internal Server Error." });
    }
}