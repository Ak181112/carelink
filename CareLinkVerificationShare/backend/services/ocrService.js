const Tesseract = require("tesseract.js");

//Clean OCR text

const cleanText = (text = "") => {
  return text
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z0-9,./\- ]/g, "")
    .toLowerCase()
    .trim();
};

 //Extract address section from NIC OCR text
const extractAddressOnly = (rawText = "") => {
  const text = cleanText(rawText);

  // Find "address" in here
  const addressIndex = text.indexOf("address");

  if (addressIndex === -1) {
    return "";
  }

  let addressPart = text.substring(addressIndex + 7).trim();

  // Stop extracting when any of these words appear. Cutting at the *earliest*
  // match keeps the result stable regardless of the order of this list:
  // trimming one by one would let "name" swallow the "full name" boundary.
  const stopWords = [
    "full name",
    "name",
    "date of birth",
    "dob",
    "sex",
    "national identity card",
    "identity card",
    "nic",
  ];

  const cutIndex = stopWords.reduce((earliest, word) => {
    const index = addressPart.indexOf(word);

    if (index === -1) return earliest;

    return earliest === -1 ? index : Math.min(earliest, index);
  }, -1);

  if (cutIndex !== -1) {
    addressPart = addressPart.substring(0, cutIndex).trim();
  }

  return addressPart;
};

//Extract NIC text + address
const extractNICAddress = async (imagePath) => {
  try {
    const result = await Tesseract.recognize(imagePath, "eng", {
      logger: () => {},
    });

    const rawText = result.data.text || "";

    const confidence = result.data.confidence || 0;

    const cleanedText = cleanText(rawText);

    const address = extractAddressOnly(rawText);

    const nicNumberMatch =
      rawText.match(/[0-9]{9}[vVxX]/) ||
      rawText.match(/[0-9]{12}/);

    return {
      rawText: cleanedText,
      address,
      nicNumber: nicNumberMatch ? nicNumberMatch[0] : "",
      confidence,
      success: confidence > 30,
    };
  } catch (error) {
    console.error("OCR Error:", error.message);

    return {
      rawText: "",
      address: "",
      nicNumber: "",
      confidence: 0,
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  extractNICAddress,
};