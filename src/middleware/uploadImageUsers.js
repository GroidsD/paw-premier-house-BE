const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploadImageUsers");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const userImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const user_id = req.body.user_id || "unknown-user";
        cb(null, `user-${user_id}-${timestamp}${ext}`);
    },
});

const userImageUpload = multer({
    storage: userImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Chỉ chấp nhận file ảnh!"), false);
    },
});

module.exports = {
    userSingleUpload: userImageUpload.single("avatar"),
};
