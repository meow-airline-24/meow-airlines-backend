import { Router } from "express";
import { createTicket, publicSearchTicket, searchTicketAuth, updateTicket } from "../../controllers/ticket.js";
import CA from "../../exceptions/catchAsync.js";
import userMustHaveLoggedIn from "../../middleware/userMustHaveLoggedIn.js";
import requireAdminRole from "../../middleware/requireAdminRole.js";

const ticketRouter = Router();

ticketRouter.post(
    "/create",
    CA(requireAdminRole),
    CA(createTicket)
)

ticketRouter.post(
    "/edit",
    CA(requireAdminRole),
    CA(updateTicket)
)

ticketRouter.post(
    "/public_search",
    CA(publicSearchTicket)
)

ticketRouter.post(
    "/search",
    CA(userMustHaveLoggedIn),
    CA(searchTicketAuth)
)

export default ticketRouter;