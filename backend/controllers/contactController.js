const ContactMessage = require("../models/ContactMessage");
const {
  sendContactReplyEmail,
} = require("../services/emailService");

async function createContact(req, res, next) {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
    } = req.body;

    if (
      !name ||
      !email ||
      !subject ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, subject and message are required.",
      });
    }

    const contactMessage =
      await ContactMessage.create({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone: phone
          ? String(phone).trim()
          : "",
        subject: String(subject).trim(),
        message: String(message).trim(),
      });

    res.status(201).json({
      success: true,
      message:
        "Message sent successfully",
      contactMessage,
    });
  } catch (error) {
    next(error);
  }
}

async function listContacts(
  req,
  res,
  next
) {
  try {
    const messages =
      await ContactMessage.find()
        .sort({
          createdAt: -1,
        })
        .populate(
          "readBy",
          "name email"
        )
        .populate(
          "resolvedBy",
          "name email"
        )
        .populate(
          "lastRepliedBy",
          "name email"
        )
        .populate(
          "replies.sentBy",
          "name email"
        );

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
}

async function updateContactStatus(
  req,
  res,
  next
) {
  try {
    const {
      status,
    } = req.body;

    const allowedStatuses = [
      "new",
      "read",
      "in_progress",
      "awaiting_user",
      "resolved",
      "closed",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid contact message status.",
      });
    }

    const message =
      await ContactMessage.findById(
        req.params.id
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message:
          "Message not found",
      });
    }

    if (
      status === "read" &&
      message.status !== "read"
    ) {
      message.readAt =
        new Date();

      message.readBy =
        req.user._id;
    }

    if (
      [
        "in_progress",
        "awaiting_user",
        "resolved",
        "closed",
      ].includes(status)
    ) {
      if (!message.readAt) {
        message.readAt =
          new Date();
      }

      if (!message.readBy) {
        message.readBy =
          req.user._id;
      }
    }

    if (
      [
        "resolved",
        "closed",
      ].includes(status)
    ) {
      if (!message.resolvedAt) {
        message.resolvedAt =
          new Date();
      }

      message.resolvedBy =
        req.user._id;
    }

    if (
      [
        "new",
        "read",
        "in_progress",
        "awaiting_user",
      ].includes(status)
    ) {
      message.resolvedAt =
        null;

      message.resolvedBy =
        null;
    }

    message.status =
      status;

    await message.save();

    const updatedMessage =
      await ContactMessage.findById(
        message._id
      )
        .populate(
          "readBy",
          "name email"
        )
        .populate(
          "resolvedBy",
          "name email"
        )
        .populate(
          "lastRepliedBy",
          "name email"
        )
        .populate(
          "replies.sentBy",
          "name email"
        );

    res.json({
      success: true,
      message:
        updatedMessage,
    });
  } catch (error) {
    next(error);
  }
}

async function markContactAsRead(
  req,
  res,
  next
) {
  try {
    const message =
      await ContactMessage.findById(
        req.params.id
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message:
          "Message not found",
      });
    }

    if (!message.readAt) {
      message.readAt =
        new Date();
    }

    message.readBy =
      req.user._id;

    if (
      message.status === "new"
    ) {
      message.status =
        "read";
    }

    await message.save();

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
}

async function updateContactPriority(
  req,
  res,
  next
) {
  try {
    const {
      priority,
    } = req.body;

    const allowedPriorities = [
      "low",
      "normal",
      "high",
      "urgent",
    ];

    if (
      !allowedPriorities.includes(
        priority
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid contact message priority.",
      });
    }

    const message =
      await ContactMessage.findByIdAndUpdate(
        req.params.id,
        {
          priority,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message:
          "Message not found",
      });
    }

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
}


async function updateContactAdminNote(
  req,
  res,
  next
) {
  try {
    const adminNote =
      typeof req.body.adminNote ===
      "string"
        ? req.body.adminNote.trim()
        : "";

    const message =
      await ContactMessage.findByIdAndUpdate(
        req.params.id,
        {
          adminNote,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message:
          "Message not found",
      });
    }

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
}


async function replyToContact(
  req,
  res,
  next
) {
  try {
    const {
      replyMessage,
      status,
    } = req.body;

    if (
      typeof replyMessage !==
        "string" ||
      !replyMessage.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reply message is required.",
      });
    }

    const trimmedReply =
      replyMessage.trim();

    if (
      trimmedReply.length >
      10000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reply message must not exceed 10,000 characters.",
      });
    }

    const allowedStatuses = [
      "new",
      "read",
      "in_progress",
      "awaiting_user",
      "resolved",
      "closed",
    ];

    if (
      status &&
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid contact message status.",
      });
    }

    const contactMessage =
      await ContactMessage.findById(
        req.params.id
      );

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message:
          "Message not found",
      });
    }

    await sendContactReplyEmail({
      email:
        contactMessage.email,

      name:
        contactMessage.name,

      originalSubject:
        contactMessage.subject,

      replyMessage:
        trimmedReply,

      adminName:
        req.user?.name ||
        "CareLink+ Support",
    });

    contactMessage.replies.push({
      message:
        trimmedReply,

      sentTo:
        contactMessage.email,

      sentBy:
        req.user._id,

      sentAt:
        new Date(),

      subject:
        contactMessage.subject,
    });

    contactMessage.lastRepliedAt =
      new Date();

    contactMessage.lastRepliedBy =
      req.user._id;

    if (!contactMessage.readAt) {
      contactMessage.readAt =
        new Date();
    }

    if (!contactMessage.readBy) {
      contactMessage.readBy =
        req.user._id;
    }

    contactMessage.status =
      status || "awaiting_user";

    if (
      [
        "resolved",
        "closed",
      ].includes(
        contactMessage.status
      )
    ) {
      contactMessage.resolvedAt =
        contactMessage.resolvedAt ||
        new Date();

      contactMessage.resolvedBy =
        req.user._id;
    } else {
      contactMessage.resolvedAt =
        null;

      contactMessage.resolvedBy =
        null;
    }

    await contactMessage.save();

    const updatedMessage =
      await ContactMessage.findById(
        contactMessage._id
      )
        .populate(
          "readBy",
          "name email"
        )
        .populate(
          "resolvedBy",
          "name email"
        )
        .populate(
          "lastRepliedBy",
          "name email"
        )
        .populate(
          "replies.sentBy",
          "name email"
        );

    res.json({
      success: true,

      message:
        "Reply sent successfully.",

      contactMessage:
        updatedMessage,
    });
  } catch (error) {
    next(error);
  }
}



module.exports = {
  createContact,
  listContacts,
  updateContactStatus,
  markContactAsRead,
  updateContactPriority,
  updateContactAdminNote,
  replyToContact,
};