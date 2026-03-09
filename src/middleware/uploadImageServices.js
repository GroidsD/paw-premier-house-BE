import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "../public/uploadImageServices");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const slugify = (str = "") =>
    str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);

const serviceStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || "");
        const raw = req.body?.serviceName || req.body?.name || "service";
        const base = slugify(raw) || "service";
        const stamp = Date.now();
        const rand = Math.random().toString(16).slice(2, 8);
        cb(null, `${base}-${stamp}-${rand}${ext}`);
    },
});

const serviceUpload = multer({
    storage: serviceStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype?.startsWith("image/")) return cb(null, true);
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "serviceImage"));
    },
});

export const serviceSingleUpload = serviceUpload.single("serviceImage");
export const serviceMultiUpload = serviceUpload.array("serviceImage", 10);

export const handleServiceUploadError = (err, req, res, next) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({ message: "Ảnh vượt quá 5MB!" });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
                message: "Chỉ chấp nhận file ảnh (đúng field upload)!",
            });
        }
        return res
            .status(400)
            .json({ message: "Upload thất bại!", error: err.code });
    }

    return res.status(400).json({ message: err.message || "Upload thất bại!" });
};
