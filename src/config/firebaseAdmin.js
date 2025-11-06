const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    path.join(
        __dirname,
        "../secrets/pet-sanctuary-7f78f-firebase-adminsdk-fbsvc-24ed5672cd.json"
    );

if (!fs.existsSync(serviceAccountPath)) {
    console.error(
        "❌ Firebase service account file not found:",
        serviceAccountPath
    );
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

console.log("✅ Firebase Admin SDK initialized successfully");

module.exports = admin;
