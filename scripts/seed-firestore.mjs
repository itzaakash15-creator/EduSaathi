/**
 * CLI script to seed Firebase Firestore with all verified Indian Government schemes.
 * Usage: node scripts/seed-firestore.mjs
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, writeBatch } from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

// 1. Load environment variables from .env.local
const envPath = resolve(rootDir, ".env.local");
if (!existsSync(envPath)) {
  console.error("❌ .env.local file not found. Please create it with your Firebase configuration first.");
  process.exit(1);
}

const envContent = readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
    const [key, ...values] = trimmed.split("=");
    env[key.trim()] = values.join("=").trim().replace(/^["']|["']$/g, "");
  }
});

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("your_")) {
  console.error("❌ Firebase API key is missing or placeholder in .env.local.");
  process.exit(1);
}

console.log(`Connecting to Firebase project: ${firebaseConfig.projectId}...`);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Read schemes-data.ts and parse the array
const schemesPath = resolve(rootDir, "src/lib/schemes-data.ts");
const schemesRaw = readFileSync(schemesPath, "utf-8");

// Extract the array contents
const arrayMatch = schemesRaw.match(/export const REAL_SCHEMES:\s*Opportunity\[\]\s*=\s*(\[[\s\S]*\]);/);
if (!arrayMatch) {
  console.error("❌ Could not extract REAL_SCHEMES from src/lib/schemes-data.ts");
  process.exit(1);
}

// Safely evaluate the array definition
const arrayCode = arrayMatch[1];
const schemes = new Function(`return ${arrayCode};`)();

console.log(`Found ${schemes.length} verified government schemes.`);

// 3. Batch write into Firestore
async function seed() {
  const CHUNK_SIZE = 400;
  let totalUploaded = 0;

  for (let i = 0; i < schemes.length; i += CHUNK_SIZE) {
    const chunk = schemes.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const scheme of chunk) {
      const ref = doc(db, "opportunities", scheme.id);
      batch.set(ref, scheme, { merge: true });
    }

    await batch.commit();
    totalUploaded += chunk.length;
    console.log(`Uploaded batch ${i / CHUNK_SIZE + 1} (${totalUploaded}/${schemes.length})...`);
  }

  console.log(`✅ Successfully seeded ${totalUploaded} schemes to Firestore collection 'opportunities'!`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error seeding Firestore:", err);
  process.exit(1);
});
