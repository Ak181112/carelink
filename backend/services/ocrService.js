const fs = require("fs/promises");
const Tesseract = require("tesseract.js");

const cleanText = (text = "") => text
  .replace(/\s+/g, " ")
  .replace(/[^a-zA-Z0-9,./\- ]/g, "")
  .toLowerCase()
  .trim();

const extractAddressOnly = (rawText = "") => {
  const text = cleanText(rawText);
  const addressIndex = text.indexOf("address");
  if (addressIndex === -1) return "";
  let addressPart = text.substring(addressIndex + 7).trim();
  const stopWords = ["full name", "name", "date of birth", "dob", "sex", "national identity card", "identity card", "nic"];
  for (const word of stopWords) {
    const index = addressPart.indexOf(word);
    if (index !== -1) addressPart = addressPart.substring(0, index).trim();
  }
  return addressPart;
};

const parseResult = (rawText, confidence = 0) => {
  const cleanedText = cleanText(rawText);
  const address = extractAddressOnly(rawText);
  const nicNumberMatch = rawText.match(/[0-9]{9}[vVxX]/) || rawText.match(/[0-9]{12}/);
  return {
    rawText: cleanedText,
    address,
    nicNumber: nicNumberMatch ? nicNumberMatch[0] : "",
    confidence,
    success: confidence > 30,
  };
};

async function extractWithGoogleVision(imagePath) {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) return null;
  const bytes = await fs.readFile(imagePath);
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [{
        image: { content: bytes.toString("base64") },
        features: [{ type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 }],
      }],
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || "Google Vision request failed");
  const annotation = body.responses?.[0]?.fullTextAnnotation;
  const rawText = annotation?.text || "";
  if (!rawText) return { ...parseResult("", 0), provider: "google-vision" };
  return { ...parseResult(rawText, 95), provider: "google-vision" };
}

async function extractNICAddress(imagePath) {
  try {
    const visionResult = await extractWithGoogleVision(imagePath);
    if (visionResult) return visionResult;
  } catch (error) {
    console.warn("Google Vision OCR failed; falling back to Tesseract:", error.message);
  }

  try {
    const result = await Tesseract.recognize(imagePath, "eng", { logger: () => {} });
    return { ...parseResult(result.data.text || "", result.data.confidence || 0), provider: "tesseract" };
  } catch (error) {
    console.error("OCR Error:", error.message);
    return { rawText: "", address: "", nicNumber: "", confidence: 0, success: false, provider: "none", error: error.message };
  }
}

module.exports = { extractNICAddress };
