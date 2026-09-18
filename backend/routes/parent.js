const express = require("express");
const router = express.Router();
const { getParentProfiles, getParentProfile, createParentProfile, updateParentProfile, deleteParentProfile } = require("../controllers/parentController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

router.use(protect);
router.use(authorize("family_member", "admin"));

router.get("/", getParentProfiles);
router.get("/:id", getParentProfile);
router.post("/", createParentProfile);
router.put("/:id", updateParentProfile);
router.delete("/:id", deleteParentProfile);

module.exports = router;
