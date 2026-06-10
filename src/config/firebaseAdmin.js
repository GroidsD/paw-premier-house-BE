const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Render
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    serviceAccount.private_key = serviceAccount.private_key.replace(
        /\\n/g,
        "\n",
    );
} else {
    // Local
    const serviceAccountPath = path.join(
        __dirname,
        "../secrets/pet-sanctuary-7f78f-firebase-adminsdk-fbsvc-83c3e52f53.json",
    );

    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

console.log("✅ Firebase Admin SDK initialized successfully");

module.exports = admin;
