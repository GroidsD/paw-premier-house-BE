const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploadImageProducts");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// === STORAGE CHO ẢNH SẢN PHẨM ===
const productStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const productName = req.body.productName || "evidence";
        const slug = productName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        const timestamp = Date.now();
        cb(null, `${slug}-${timestamp}${ext}`);
    },
});

// === MULTER UPLOADERS ===
const productUpload = multer({
    storage: productStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Chỉ chấp nhận file ảnh!"), false);
    },
});

// === EXPORT ===
module.exports = {
    multiUpload: productUpload.array("evidence", 10),
    singleUpload: productUpload.single("evidence"),
};
