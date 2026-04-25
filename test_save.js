import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function test() {
  await signInWithEmailAndPassword(auth, "waelweza123123@kemet.app", "kemet_default_password_123");
  console.log("Logged in");
  await setDoc(doc(db, "app_styles", "test_style_123"), { name: "test", image: "base64...", description: "desc" });
  console.log("Saved");
}
test().then(() => process.exit()).catch(e => { console.error(e); process.exit(1); });
