/**
 * Extracts local image URLs starting with /uploadImageProducts/ from a string.
 * This works for both Markdown and plain text.
 * It also strips query strings to ensure consistent comparisons.
 * @param {string} text - The content to parse.
 * @returns {string[]} - Array of unique image URLs found.
 */
export const extractLocalImageUrls = (text) => {
    if (!text || typeof text !== "string") return [];
    
    // Matches URLs like /uploadImageProducts/filename.ext
    const regex = /\/uploadImageProducts\/[^ )"'\n\r\t<>?]+/gi;
    const matches = text.match(regex) || [];
    
    // Return unique values
    return [...new Set(matches)];
};
