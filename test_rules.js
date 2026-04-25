import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, getDocs, collection } from "firebase/firestore";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  await signInWithEmailAndPassword(auth, "waelweza123123@kemet.app", "kemet_default_password_123");
  console.log("Logged in");
  try {
     const col = await getDocs(collection(db, "users"));
     console.log("Users fetched: ", col.docs.length);
  } catch(e) {
     console.error("Rules failed: ", e.message);
  }
  process.exit();
}
test();
