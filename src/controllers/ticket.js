import Ticket from "../models/tickets.js";

export default async function createTicket(
  booking_id,
  status,
  passenger_name,
  dob,
  gender,
  id_type,
  id_number,
  country_code,
  seat_id
) {
  const ticket = await Ticket.create({
    booking_id,
    status,
    passenger_name,
    dob,
    gender,
    id_type,
    id_number,
    country_code,
    seat_id,
  });
  return ticket;
}
