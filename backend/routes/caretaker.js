const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  createOrUpdateProfile,
  submitApplication,
  getApplicationStatus,
  getAllApprovedCaretakers,
  getCaretakerById,
  uploadDocuments,
} = require("../controllers/caretakerController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const { uploadProfile, uploadDocuments: uploadDocs } = require("../middleware/upload");

router.get("/approved", getAllApprovedCaretakers);
router.get("/view/:id", getCaretakerById);

router.use(protect);

router.get("/profile", authorize("caretaker"), getMyProfile);
router.post("/profile", authorize("caretaker"), uploadProfile.single("photo"), createOrUpdateProfile);
router.put("/profile", authorize("caretaker"), uploadProfile.single("photo"), createOrUpdateProfile);

router.post(
  "/apply",
  authorize("caretaker"),
  uploadDocs.fields([
    { name: "nicDocument", maxCount: 1 },
    { name: "drivingLicense", maxCount: 1 },
    { name: "certificates", maxCount: 5 },
    { name: "photo", maxCount: 1 },
  ]),
  submitApplication
);

router.post(
  "/upload-documents",
  authorize("caretaker"),
  uploadDocs.fields([
    { name: "nicDocument", maxCount: 1 },
    { name: "drivingLicense", maxCount: 1 },
    { name: "certificates", maxCount: 5 },
  ]),
  uploadDocuments
);

router.get("/status", authorize("caretaker"), getApplicationStatus);

module.exports = router;
