const express = require("express");

const {
  protect,
  authorize,
} = require("../middleware/auth");

const c = require("../controllers/contactController");

const router = express.Router();

router.post(
  "/",
  c.createContact
);

router.use(
  protect,
  authorize("admin")
);

router.get(
  "/",
  c.listContacts
);

router.put(
  "/:id",
  c.updateContactStatus
);

router.put(
  "/:id/read",
  c.markContactAsRead
);

router.put(
  "/:id/priority",
  c.updateContactPriority
);

router.put(
  "/:id/note",
  c.updateContactAdminNote
);

router.post(
  "/:id/reply",
  c.replyToContact
);

module.exports = router;