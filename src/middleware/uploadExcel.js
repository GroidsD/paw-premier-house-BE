const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploadsExcel");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const auditStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const originalName = path
            .parse(file.originalname)
            .name.replace(/[^a-z0-9]/gi, "")
            .toLowerCase();
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const safeFilename = `${originalName}-${timestamp}${ext}`;
        cb(null, safeFilename);
    },
});

const auditUpload = multer({
    storage: auditStorage,
    limits: { fileSize: 30 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Just Accept Excel files!"), false);
        }
    },
});

module.exports = {
    auditUpload: auditUpload.single("checkListFile"),
};
