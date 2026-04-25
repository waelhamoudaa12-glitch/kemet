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
  const col = await getDocs(collection(db, "users"));
  col.forEach(doc => console.log(doc.id, doc.data()));
  process.exit();
}
test().catch(console.error);
