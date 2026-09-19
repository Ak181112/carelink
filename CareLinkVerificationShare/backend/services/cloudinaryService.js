const cloudinary = require("cloudinary").v2;
const fs = require("fs");

let configured = false;
function configure() {
  if (configured) return;
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    configured = true;
    return;
  }
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
}

async function uploadLocalFile(filePath, options = {}) {
  configure();
  if (!configured) return null;
  const result = await cloudinary.uploader.upload(filePath, {
    folder: options.folder || "carelink-plus",
    resource_type: options.resourceType || "auto",
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });
  return result.secure_url;
}

function removeLocalFile(filePath) {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (error) {
    console.warn("Unable to remove temporary upload:", error.message);
  }
}

module.exports = { uploadLocalFile, removeLocalFile };
