/**
 * Migration Script: Convert plain text product descriptions to Markdown format.
 *
 * What it does:
 *   - Converts double newlines → Markdown paragraphs (already valid)
 *   - Converts lines starting with "-" or "*" → proper Markdown list items
 *   - Converts lines that look like headings (ALL CAPS short lines) → ## Heading
 *   - Skips products that already contain Markdown syntax
 *
 * Usage:
 *   node src/scripts/migrateDescriptionToMarkdown.js
 *
 * Safety:
 *   - Uses a dry-run mode by default (set DRY_RUN=false to apply changes)
 *   - Logs a summary of affected rows before committing
 */

import db from "../models/index.js";

const DRY_RUN = process.env.DRY_RUN !== "false";

/**
 * Returns true if the text already contains Markdown syntax.
 * Skips migration for those rows.
 */
function alreadyMarkdown(text) {
    if (!text) return false;
    return (
        /^#{1,6}\s/m.test(text) ||   // headings
        /\*\*.+?\*\*/m.test(text) ||  // bold
        /\[.+?\]\(.+?\)/m.test(text)  // links
    );
}

/**
 * Convert plain text → best-effort Markdown.
 */
function toMarkdown(text) {
    if (!text || typeof text !== "string") return text;

    const lines = text.split("\n");
    const result = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trimEnd();

        // Bullet-like lines → markdown list
        if (/^[-*•]\s+/.test(line)) {
            line = "- " + line.replace(/^[-*•]\s+/, "");
            result.push(line);
            continue;
        }

        // Lines that look like headings: short, uppercase, no punctuation ending
        const trimmed = line.trim();
        if (
            trimmed.length > 0 &&
            trimmed.length <= 40 &&
            trimmed === trimmed.toUpperCase() &&
            /^[A-ZÀ-Ỹ0-9\s]+$/.test(trimmed)
        ) {
            result.push(`## ${trimmed}`);
            continue;
        }

        result.push(line);
    }

    // Collapse multiple blank lines into at most two
    return result.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

async function run() {
    try {
        console.log("🔍 Connecting to database...");
        await db.sequelize.authenticate();
        console.log("✅ Connected.\n");

        const products = await db.Product.findAll({
            attributes: ["product_id", "name", "description"],
        });

        console.log(`📦 Total products: ${products.length}`);

        let skipped = 0;
        let willUpdate = 0;
        const updates = [];

        for (const product of products) {
            const desc = product.description;

            if (!desc || !desc.trim()) {
                skipped++;
                continue;
            }

            if (alreadyMarkdown(desc)) {
                console.log(`⏭  [#${product.product_id}] "${product.name}" – already markdown, skipping.`);
                skipped++;
                continue;
            }

            const converted = toMarkdown(desc);

            if (converted === desc) {
                skipped++;
                continue;
            }

            willUpdate++;
            updates.push({ product, converted });

            console.log(`\n📝 [#${product.product_id}] "${product.name}"`);
            console.log("   BEFORE:", JSON.stringify(desc.slice(0, 80)));
            console.log("   AFTER :", JSON.stringify(converted.slice(0, 80)));
        }

        console.log(`\n📊 Summary:`);
        console.log(`   - To update : ${willUpdate}`);
        console.log(`   - Skipped   : ${skipped}`);

        if (DRY_RUN) {
            console.log("\n⚠️  DRY RUN mode – no changes applied.");
            console.log("   Run with DRY_RUN=false to apply:\n");
            console.log("   DRY_RUN=false node src/scripts/migrateDescriptionToMarkdown.js\n");
        } else {
            console.log("\n💾 Applying updates...");
            for (const { product, converted } of updates) {
                await product.update({ description: converted });
                console.log(`   ✅ Updated #${product.product_id} – ${product.name}`);
            }
            console.log(`\n🎉 Done! ${willUpdate} products updated.`);
        }

        await db.sequelize.close();
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

run();
