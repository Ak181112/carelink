const ContactMessage = require("../models/ContactMessage");

// submit a contact message (public)
const submitMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contactMessage = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
      contactMessage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitMessage };
