import { Router } from "express";
import authRouter from "./auth.js";
import userRouter from "./user.js";
import adminRouter from "./admin.js";
import aircraftRouter from "./aircraft.js";
import aircraftModelRouter from "./aircraft_model.js";
import bookingRouter from "./booking.js";
import flightRouter from "./flight.js";
import imageRouter from "./image.js";
import postRouter from "./post.js";
import seatRouter from "./seat.js";
import ticketRouter from "./ticket.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);

apiRouter.use("/user", userRouter);

apiRouter.use("/admin", adminRouter);

apiRouter.use("/aircraft", aircraftRouter);

apiRouter.use("/aircraft-model", aircraftModelRouter);

apiRouter.use("/booking", bookingRouter);

apiRouter.use("/flight", flightRouter);

apiRouter.use("/image", imageRouter);

apiRouter.use("/post", postRouter);

apiRouter.use("/seat", seatRouter);

apiRouter.use("/ticket", ticketRouter);

apiRouter.use("/", (req, res) => {
  res.json({
    message:
      "Wrong METHOD and/or PATH. Contact the authors for detailed API reference",
  });
});

export default apiRouter;
