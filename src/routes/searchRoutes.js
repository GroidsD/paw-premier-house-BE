// const express = require("express");
// const router = express.Router();
// const { searchProducts } = require("../services/productSearchService.js");

// router.get("/api/search", async (req, res) => {
//   try {
//     const { q } = req.query;
//     if (!q) return res.status(400).json({ error: "Thiếu tham số ?q=" });
//     const results = await searchProducts(q, "vi");
//     // Nếu có sản phẩm, chỉ trả về list sản phẩm match
//     if (results.length === 0) {
//       return res.json({
//         results: [],
//         message: "Không tìm thấy sản phẩm phù hợp.",
//       });
//     }
//     return res.json({ results });
//   } catch (err) {
//     console.error("❌ Lỗi tìm kiếm:", err);
//     res.status(500).json({ error: err.message || "Internal server error" });
//   }
// });

// module.exports = router;
