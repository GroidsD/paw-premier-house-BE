const path = require("path");
const fs = require("fs/promises");

const PUBLIC_DIR = path.join(__dirname, "..", "public");

async function safeUnlinkByUrl(url) {
    try {
        if (!url) return;

        const clean = String(url).split("?")[0];
        const rel = clean.startsWith("/") ? clean.slice(1) : clean;

        const absPath = path.join(PUBLIC_DIR, rel);

        await fs.unlink(absPath);
    } catch (e) {
        if (e?.code !== "ENOENT")
            console.warn("safeUnlinkByUrl error:", e.message);
    }
}

module.exports = { safeUnlinkByUrl };
