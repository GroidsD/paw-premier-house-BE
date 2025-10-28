// const CATEGORY_KEYWORDS = {
//   toy: ["đồ chơi", "toy", "play", "bóng"],
//   food: ["thức ăn", "food", "treat", "bánh thưởng"],
//   grooming: ["lược", "groom", "brush"],
//   health: ["vitamin", "health", "sức khỏe"],
//   accessory: ["vòng cổ", "collar", "bát", "leash"],
// };

// function detectCategoryByText(q) {
//   const s = (q || "").toLowerCase();
//   for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
//     if (kws.some((kw) => s.includes(kw))) return cat;
//   }
//   return null;
// }

// function contentMatchesCategory(content, cat) {
//   if (!content || !cat) return false;
//   const s = content.toLowerCase();
//   return (CATEGORY_KEYWORDS[cat] || []).some((kw) => s.includes(kw));
// }

// export { detectCategoryByText, contentMatchesCategory };
