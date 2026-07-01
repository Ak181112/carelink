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


// file filter

const fileFilter = (req, file, cb) => {
  const allowedImage = /jpeg|jpg|png/;
  const allowedDoc = /pdf/;

  const ext = path.extname(file.originalname).toLowerCase();

  const isImage = allowedImage.test(ext);
  const isPdf = allowedDoc.test(ext);

  const mime = file.mimetype;

  // allow images and pdfs
  if (isImage || isPdf) {
    return cb(null, true);
  }

  cb(new Error("Only images (jpeg, jpg, png) and PDF files are allowed"));
};

// profile image only upload
const uploadProfile = multer({
  storage: storage("profiles"),
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;

    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);

    if (ext && mime) return cb(null, true);

    cb(new Error("Only image files allowed for profile photo"));
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