import User from "../models/users.js";
import HttpException from "../exceptions/HttpException.js";
import Ticket from "../models/tickets.js";
import Booking from "../models/bookings.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "meowayairlines@gmail.com", 
    pass: "ivrm zvfs ddvn blro",  
  },
});

// Create an @meowlines.com email
export async function createAirlineEmail(req, res) {
  try {
    const { email, name } = req.body;

    if (!email && !name) {
      throw new HttpException(
        400,
        "Either 'email' or 'name' must be provided to create an airline email."
      );
    }

    let airlineEmail = "";
    if (email) {
      const emailPrefix = email.split("@")[0];
      airlineEmail = `${emailPrefix}@meowlines.com`;
    } else if (name) {
      const sanitizedName = name.replace(/\s+/g, "").toLowerCase();
      airlineEmail = `${sanitizedName}@meowlines.com`;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email, name },
      { airline_email: airlineEmail },
      { new: true } 
    );

    if (!updatedUser) {
      throw new HttpException(404, "User not found.");
    }

    res.status(200).json({
      message: "Airline email created successfully.",
      airline_email: airlineEmail,
    });
  } catch (error) {
    console.error("Error creating airline email:", error);
    res.status(error.status || 500).json({ message: error.message });
  }
}

export async function sendEmail(booking_id, user_email) {
  try {
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      throw new HttpException(404, `Booking with ID ${booking_id} not found.`);
    }

    const tickets = await Ticket.find({ booking_id });

    if (tickets.length === 0) {
      throw new HttpException(
        404,
        `No tickets found for booking ID ${booking_id}.`
      );
    }

    let emailBody = `Dear Customer,\n\nYour booking with ID ${booking_id} is confirmed.\n\nHere are the ticket details:\n`;

    tickets.forEach((ticket) => {
      emailBody += `\nPassenger Name: ${ticket.passenger_name}\nTicket ID: ${ticket._id}\n`;
    });

    emailBody += "\nThank you for choosing Meowlines!";

    const mailOptions = {
      from: "meowayairlines@gmail.com", 
      to: user_email,
      subject: "Booking Confirmation - Meowlines",
      text: emailBody,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result);
    return result; 
  } catch (error) {
    console.error("Error in sendEmail function:", error);
    throw error; 
  }
}
