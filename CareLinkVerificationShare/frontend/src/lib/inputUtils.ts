/**
 * Formats name inputs:
 * 1. Strips any digits or special symbols (allows letters and spaces only).
 * 2. Auto-capitalizes the first letter of each word (Title Case).
 */
export const formatName = (value: string): string => {
  // Allow only letters and spaces (Unicode letters supported)
  const lettersOnly = value.replace(/[^a-zA-Z\s]/g, "");

  // Capitalize first letter of each word
  return lettersOnly.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Formats email inputs:
 * 1. Automatically converts all characters to lowercase.
 * 2. Removes any whitespace.
 */
export const formatEmail = (value: string): string => {
  return value.toLowerCase().replace(/\s/g, "");
};
