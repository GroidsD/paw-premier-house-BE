const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../public/uploadImagePets");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const petImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const petName = req.body.name || req.body.pet_name || "unknown-pet";
        const slug = petName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        cb(null, `pet-${slug}-${timestamp}${ext}`);
    },
});

const petImageUpload = multer({
    storage: petImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Chỉ chấp nhận file ảnh!"), false);
    },
});

module.exports = {
    petSingleUpload: petImageUpload.single("image"),
    petMultipleUpload: petImageUpload.array("images", 10),
    petMediaUpload: petImageUpload.array("media", 10),
};
