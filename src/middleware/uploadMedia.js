const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploadMedia");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const mediaStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const entity = (req.body.entity_type || "media")
            .toString()
            .replace(/[^a-z0-9]/gi, "_");
        cb(null, `${entity}-${timestamp}${ext}`);
    },
});

const allowed = (mimetype) => {
    if (!mimetype) return false;
    if (mimetype.startsWith("image/")) return true;
    if (mimetype === "application/pdf") return true;
    if (mimetype === "application/msword") return true;
    if (mimetype.startsWith("application/vnd.openxmlformats-officedocument"))
        return true;
    return false;
};

const mediaUpload = multer({
    storage: mediaStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (allowed(file.mimetype)) cb(null, true);
        else cb(new Error("File type not allowed"), false);
    },
});

module.exports = {
    mediaSingleUpload: mediaUpload.single("media"),
    mediaMultipleUpload: mediaUpload.array("media", 10),
};
