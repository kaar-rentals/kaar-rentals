const admin = require("firebase-admin");

// Initialize Firebase Admin using env-based credentials
// Prefer GOOGLE_APPLICATION_CREDENTIALS or JSON in FIREBASE_SERVICE_ACCOUNT
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: serviceAccountJson
      ? admin.credential.cert(serviceAccountJson)
      : admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "kaar-rentals.appspot.com"
  });
}

const bucket = admin.storage().bucket();

module.exports = bucket;
