const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ============================================================
   STORAGE
   ============================================================ */

const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(
        __dirname,
        `../uploads/${folder}`
      );

      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, {
            recursive: true,
          });
        }

        cb(null, dir);
      } catch (error) {
        cb(error);
      }
    },

    filename: (req, file, cb) => {
      const ext = path
        .extname(file.originalname)
        .toLowerCase();

      const userId =
        req.user?.id || "guest";

      const safeUserId = String(userId).replace(
        /[^a-zA-Z0-9_-]/g,
        ""
      );

      const filename = `${safeUserId}_${Date.now()}${ext}`;

      cb(null, filename);
    },
  });

/* ============================================================
   GENERIC DOCUMENT FILTER
   ============================================================ */

const fileFilter = (req, file, cb) => {
  const ext = path
    .extname(file.originalname)
    .toLowerCase();

  const allowedImages = [
    ".jpeg",
    ".jpg",
    ".png",
    ".webp",
  ];

  const allowedDocuments = [
    ".pdf",
  ];

  const allowed =
    allowedImages.includes(ext) ||
    allowedDocuments.includes(ext);

  if (allowed) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only JPG, JPEG, PNG, WEBP images and PDF files are allowed"
    )
  );
};

/* ============================================================
   PROFILE UPLOAD
   ============================================================ */

const uploadProfile = multer({
  storage: storage("profiles"),

  fileFilter: (req, file, cb) => {
    const ext = path
      .extname(file.originalname)
      .toLowerCase();

    const allowedImages = [
      ".jpeg",
      ".jpg",
      ".png",
      ".webp",
    ];

    if (!allowedImages.includes(ext)) {
      return cb(
        new Error(
          "Only JPG, JPEG, PNG, and WEBP profile images are allowed"
        )
      );
    }

    /* Basic MIME validation */
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      file.mimetype &&
      !allowedMimeTypes.includes(file.mimetype)
    ) {
      return cb(
        new Error(
          "Invalid profile image type"
        )
      );
    }

    cb(null, true);
  },

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

/* ============================================================
   CARETAKER / VERIFICATION DOCUMENTS
   ============================================================ */

const uploadDocuments = multer({
  storage: storage("documents"),

  fileFilter: (req, file, cb) => {
    const ext = path
      .extname(file.originalname)
      .toLowerCase();

    const allowedImages = [
      ".jpeg",
      ".jpg",
      ".png",
      ".webp",
    ];

    const allowedDocuments = [
      ".pdf",
    ];

    if (
      !allowedImages.includes(ext) &&
      !allowedDocuments.includes(ext)
    ) {
      return cb(
        new Error(
          "Only JPG, JPEG, PNG, WEBP images and PDF documents are allowed"
        )
      );
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (
      file.mimetype &&
      !allowedMimeTypes.includes(file.mimetype)
    ) {
      return cb(
        new Error(
          "Invalid document file type"
        )
      );
    }

    cb(null, true);
  },

  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
});

/* ============================================================
   EXPORTS
   ============================================================ */

module.exports = {
  uploadProfile,
  uploadDocuments,
};