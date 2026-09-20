const fs = require("fs/promises");
const Tesseract = require("tesseract.js");

/* ============================================================
   TEXT NORMALIZATION
============================================================ */

const normalizeForMatching = (text = "") =>
  String(text)
    .normalize("NFKC")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");

const normalizeAddress = (text = "") =>
  String(text)
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .replace(/[,:;]+/g, ",")
    .replace(/,+/g, ",")
    .trim()
    .toLowerCase();

/* ============================================================
   ADDRESS EXTRACTION
============================================================ */

const extractAddressOnly = (rawText = "") => {
  const normalizedText = normalizeForMatching(rawText);

  if (!normalizedText) return "";

  const lines = normalizedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const addressIndex = lines.findIndex((line) =>
    /\baddress\b/i.test(line)
  );

  if (addressIndex === -1) return "";

  const addressLines = [];

  for (let i = addressIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];

    /*
     * Stop when we reach another major NIC field.
     */
    if (
      /\b(date\s+of\s+issue|date\s+of\s+birth|place\s+of\s+birth|sex|name|full\s+name|national\s+identity\s+card|identity\s+card|nic)\b/i.test(
        line
      )
    ) {
      break;
    }

    /*
     * Ignore obvious empty/separator lines.
     */
    if (!line || /^[-_=]+$/.test(line)) continue;

    addressLines.push(line);
  }

  return normalizeAddress(addressLines.join(" "));
};

/* ============================================================
   NIC NUMBER EXTRACTION
============================================================ */

const extractNicNumber = (rawText = "") => {
  const compactText = String(rawText)
    .replace(/\s+/g, "")
    .toUpperCase();

  const oldFormat = compactText.match(/\d{9}[VX]/);
  if (oldFormat) return oldFormat[0];

  const newFormat = compactText.match(/\d{12}/);
  if (newFormat) return newFormat[0];

  return "";
};

/* ============================================================
   RESULT PARSER
============================================================ */

const parseResult = (rawText = "", confidence = 0, provider = "unknown") => {
  const raw = String(rawText || "");
  const normalizedText = normalizeForMatching(raw);

  const address = extractAddressOnly(raw);
  const nicNumber = extractNicNumber(raw);

  return {
    rawText: normalizedText,
    address,
    nicNumber,
    confidence: Number(confidence || 0),
    success: Boolean(normalizedText && (address || nicNumber)),
    provider,
  };
};

/* ============================================================
   GOOGLE CLOUD VISION
============================================================ */

async function extractWithGoogleVision(imagePath) {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

  if (!apiKey) return null;

  const bytes = await fs.readFile(imagePath);

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(
      apiKey
    )}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: bytes.toString("base64"),
            },

            features: [
              {
                type: "DOCUMENT_TEXT_DETECTION",
              },
            ],
          },
        ],
      }),
    }
  );

  const body = await response.json();

  if (!response.ok) {
    throw new Error(
      body.error?.message || "Google Vision request failed"
    );
  }

  const visionResponse = body.responses?.[0];

  if (visionResponse?.error?.message) {
    throw new Error(visionResponse.error.message);
  }

  const annotation = visionResponse?.fullTextAnnotation;

  const rawText = annotation?.text || "";

  if (!rawText) {
    return parseResult("", 0, "google-vision");
  }

  /*
   * Calculate a useful confidence estimate from
   * available page/block/paragraph/word confidence values.
   */
  const confidenceValues = [];

  for (const page of annotation.pages || []) {
    if (Number.isFinite(page.confidence)) {
      confidenceValues.push(Number(page.confidence));
    }

    for (const block of page.blocks || []) {
      if (Number.isFinite(block.confidence)) {
        confidenceValues.push(Number(block.confidence));
      }

      for (const paragraph of block.paragraphs || []) {
        if (Number.isFinite(paragraph.confidence)) {
          confidenceValues.push(Number(paragraph.confidence));
        }

        for (const word of paragraph.words || []) {
          if (Number.isFinite(word.confidence)) {
            confidenceValues.push(Number(word.confidence));
          }
        }
      }
    }
  }

  const confidence =
    confidenceValues.length > 0
      ? (confidenceValues.reduce((sum, value) => sum + value, 0) /
          confidenceValues.length) *
        100
      : 0;

  return parseResult(
    rawText,
    confidence,
    "google-vision"
  );
}

/* ============================================================
   TESSERACT FALLBACK
============================================================ */

async function extractNICAddress(imagePath) {
  try {
    const visionResult = await extractWithGoogleVision(imagePath);

    if (visionResult) {
      return visionResult;
    }
  } catch (error) {
    console.warn(
      "Google Vision OCR failed; falling back to Tesseract:",
      error.message
    );
  }

  try {
    const result = await Tesseract.recognize(
      imagePath,
      "eng",
      {
        logger: () => {},
      }
    );

    return parseResult(
      result.data.text || "",
      result.data.confidence || 0,
      "tesseract"
    );
  } catch (error) {
    console.error("OCR Error:", error.message);

    return {
      rawText: "",
      address: "",
      nicNumber: "",
      confidence: 0,
      success: false,
      provider: "none",
      error: error.message,
    };
  }
}

module.exports = {
  extractNICAddress,
};