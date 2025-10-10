const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploadsPDF");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const calibrationStorage = multer.diskStorage({
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

const calibrationUpload = multer({
  storage: calibrationStorage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Just Accpet file PDF!"), false);
    }
  },
});

module.exports = {
  calibrationUpload: calibrationUpload.single("calibrationFile"),
};
