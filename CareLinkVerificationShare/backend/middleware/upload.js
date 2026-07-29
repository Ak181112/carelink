const multer = require("multer");
const path = require("path");
const fs = require("fs");


// storage engine fun

const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, `../uploads/${folder}`);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);

      const userId = req.user?.id || "guest";

      cb(null, `${userId}_${Date.now()}${ext}`);
    },
  });


// A rejected upload is the caller's mistake, so it must surface as 400 and not 500
const uploadError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const isImageFile = (file) => {
  const allowed = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();

  return allowed.test(ext) && allowed.test(file.mimetype);
};

const isPdfFile = (file) => {
  const ext = path.extname(file.originalname).toLowerCase();

  return ext === ".pdf" && file.mimetype === "application/pdf";
};


// file filter

const fileFilter = (req, file, cb) => {
  // The NIC is the only document that goes through Tesseract OCR, and Tesseract
  // cannot read PDFs. Accepting one here would silently fail verification later.
  if (file.fieldname === "nicDocument") {
    if (isImageFile(file)) return cb(null, true);

    return cb(
      uploadError(
        "NIC document must be an image (jpeg, jpg or png) so it can be read by OCR. PDF files are not supported."
      )
    );
  }

  // allow images and pdfs (extension AND mimetype must both match)
  if (isImageFile(file) || isPdfFile(file)) {
    return cb(null, true);
  }

  cb(uploadError("Only images (jpeg, jpg, png) and PDF files are allowed"));
};

// profile image only upload
const uploadProfile = multer({
  storage: storage("profiles"),
  fileFilter: (req, file, cb) => {
    if (isImageFile(file)) return cb(null, true);

    cb(uploadError("Only image files (jpeg, jpg, png) allowed for profile photo"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// document upload OCR only
const uploadDocuments = multer({
  storage: storage("documents"),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = {
  uploadProfile,
  uploadDocuments,
};