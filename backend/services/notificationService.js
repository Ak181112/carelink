const Notification = require("../models/Notification");

async function notify(userId, title, message, type = "general") {
  return Notification.create({ userId, title, message, type });
}

module.exports = { notify };
