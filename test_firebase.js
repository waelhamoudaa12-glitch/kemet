import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log("Firebase initialized. Checking auth...");
console.log("Auth state:", auth ? "initialized" : "not initialized");
process.exit(0);
