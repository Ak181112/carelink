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
const { uploadProfile, uploadDocuments: uploadFiles } = require("../middleware/upload");

//public routes
router.get("/approved", getAllApprovedCaretakers);
router.get("/view/:id", getCaretakerById);

//auth required
router.use(protect);

//profile routes
router.get("/profile", authorize("caretaker"), getMyProfile);

router.post(
  "/profile",
  authorize("caretaker"),
  uploadProfile.single("photo"),
  createOrUpdateProfile
);

router.put(
  "/profile",
  authorize("caretaker"),
  uploadProfile.single("photo"),
  createOrUpdateProfile
);

// aplication routes
router.post(
  "/apply",
  authorize("caretaker"),
  uploadFiles.fields([
    { name: "nicDocument", maxCount: 1 },
    { name: "drivingLicense", maxCount: 1 },
    { name: "certificates", maxCount: 5 },
    { name: "photo", maxCount: 1 },
  ]),
  submitApplication
);

//document upload only
router.post(
  "/upload-documents",
  authorize("caretaker"),
  uploadFiles.fields([
    { name: "nicDocument", maxCount: 1 },
    { name: "drivingLicense", maxCount: 1 },
    { name: "certificates", maxCount: 5 },
  ]),
  uploadDocuments
);

//status check
router.get("/status", authorize("caretaker"), getApplicationStatus);

module.exports = router;