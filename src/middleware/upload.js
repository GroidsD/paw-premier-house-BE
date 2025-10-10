const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage chung cho ảnh sản phẩm (và mặc định)
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const productName = req.body.productName || "evidence"; // Mặc định là "image" nếu không có tên sản phẩm
    const slug = productName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const timestamp = Date.now();
    const newFilename = `evidence-${Date.now()}${ext}`;
    cb(null, newFilename);
  },
});

// Cấu hình storage riêng cho ảnh người dùng
// const userImageStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir); // Vẫn lưu vào cùng thư mục uploads
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const timestamp = Date.now();
//     const userId = req.body.userId || "unknown-user"; // Lấy userId từ form data, fallback nếu không có

//     // Tên file cho ảnh người dùng: user-[id]-timestamp.ext
//     const newFilename = `user-${userId}-${timestamp}${ext}`;
//     cb(null, newFilename);
//   },
// });

// Middleware upload cho ảnh sản phẩm (hoặc ảnh chung)
const productUpload = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh!"), false);
    }
  },
});

module.exports = {
  singleUpload: productUpload.single("evidence"),
  // userSingleUpload: userImageUpload.single("image"),
};
