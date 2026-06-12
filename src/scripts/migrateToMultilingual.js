import db from "../models/index.js";

const migrateToMultilingual = async () => {
    try {
        console.log("Starting multilingual data migration...");


        // Migrate Features
        console.log("Migrating features...");
        const features = await db.Feature.findAll();
        
        for (const feature of features) {
            await feature.update({
                feature_name_en: feature.feature_name,
                description_en: feature.description,
            });
        }
        console.log(`Migrated ${features.length} features`);

        console.log("Multilingual data migration completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrateToMultilingual();
