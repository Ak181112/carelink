/**
 * Formats phone input to Sri Lankan 10-digit format starting with 07 (e.g. 0712345678).
 * Strips out any non-digit characters, limits length to 10 digits, and enforces '07' prefix if user starts typing digits.
 */
export const formatPhoneNumber = (value: string): string => {
  // Extract only numbers
  let digits = value.replace(/\D/g, "");

  if (!digits) return "";

  // If user types numbers, ensure it starts with 07
  if (digits.length >= 1 && !digits.startsWith("0")) {
    digits = "07" + digits;
  } else if (digits.length >= 2 && !digits.startsWith("07")) {
    digits = "07" + digits.slice(2);
  }

  // Restrict to max 10 digits
  return digits.slice(0, 10);
};

/**
 * Validates whether a phone number is a valid 10-digit Sri Lankan mobile number (07XXXXXXXX).
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  return /^07\d{8}$/.test(phone);
};
