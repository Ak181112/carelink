// const mongoose = require("mongoose");

// const contactMessageSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   email: { type: String, required: true, lowercase: true, trim: true },
//   phone: { type: String, default: "" },
//   subject: { type: String, required: true, trim: true },
//   message: { type: String, required: true, trim: true },
//   status: { type: String, enum: ["new", "read", "resolved"], default: "new", index: true },
// }, { timestamps: true });

// module.exports = mongoose.model("ContactMessage", contactMessageSchema);

const mongoose = require("mongoose");

const contactReplySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },

    sentTo: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sentAt: {
      type: Date,
      default: Date.now,
    },

    subject: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const contactMessageSchema = new mongoose.Schema(
  {

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },


    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },


    status: {
      type: String,
      enum: [
        "new",
        "read",
        "in_progress",
        "awaiting_user",
        "resolved",
        "closed",
      ],
      default: "new",
      index: true,
    },

    priority: {
      type: String,
      enum: [
        "low",
        "normal",
        "high",
        "urgent",
      ],
      default: "normal",
      index: true,
    },

    /* ----------------------------------------------------------
       Admin internal note
       This is NEVER sent to the customer.
    ---------------------------------------------------------- */

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },

    /* ----------------------------------------------------------
       Reply history
    ---------------------------------------------------------- */

    replies: {
      type: [contactReplySchema],
      default: [],
    },

    /* ----------------------------------------------------------
       Audit fields
    ---------------------------------------------------------- */

    readAt: {
      type: Date,
      default: null,
    },

    readBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    lastRepliedAt: {
      type: Date,
      default: null,
    },

    lastRepliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ============================================================
   INDEXES
============================================================ */

contactMessageSchema.index({
  status: 1,
  createdAt: -1,
});

contactMessageSchema.index({
  priority: 1,
  createdAt: -1,
});

contactMessageSchema.index({
  email: 1,
  createdAt: -1,
});

contactMessageSchema.index({
  createdAt: -1,
});

module.exports = mongoose.model(
  "ContactMessage",
  contactMessageSchema
);