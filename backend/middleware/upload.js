const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, `../uploads/${folder}`);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${req.user.id}_${Date.now()}${ext}`);
    },
  });

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error("Only images (jpeg, jpg, png) and PDF files are allowed"));
};

const uploadProfile = multer({
  storage: storage("profiles"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadDocuments = multer({
  storage: storage("documents"),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

module.exports = { uploadProfile, uploadDocuments };
