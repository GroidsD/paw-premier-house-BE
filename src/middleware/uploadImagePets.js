const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploadImagePets");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const petStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);

        // lấy tên pet từ body, fallback nếu chưa có
        const petName = req.body.name || req.body.petName || "pet";

        const slug = petName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);

        cb(null, `${slug}-${timestamp}-${random}${ext}`);
    },
});

const petUpload = multer({
    storage: petStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Chỉ chấp nhận file ảnh!"), false);
        }
    },
});

module.exports = {
    multiUpload: petUpload.array("pet", 10),
    singleUpload: petUpload.single("pet"),
};
