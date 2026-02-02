// utils/safeUnlinkByUrl.js
const path = require("path");
const fs = require("fs/promises");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
// chỉnh __dirname theo vị trí file util của bạn

async function safeUnlinkByUrl(url) {
    try {
        if (!url) return;

        // url dạng "/uploadImageProducts/abc.png"
        const clean = String(url).split("?")[0]; // bỏ query nếu có
        const rel = clean.startsWith("/") ? clean.slice(1) : clean;

        const absPath = path.join(PUBLIC_DIR, rel);

        await fs.unlink(absPath);
    } catch (e) {
        // file không tồn tại thì bỏ qua
        if (e?.code !== "ENOENT")
            console.warn("safeUnlinkByUrl error:", e.message);
    }
}

module.exports = { safeUnlinkByUrl };
