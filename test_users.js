import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function test() {
  try {
    await signInWithEmailAndPassword(auth, "waelweza123123@kemet.app", "kemet_default_password_123");
    console.log("OLD EMAIL LOGGED IN OK");
  } catch(e) {
    console.log("OLD EMAIL FAIL:", e.message);
  }
  
  try {
    await signInWithEmailAndPassword(auth, "admin_waelweza123123@kemet.app", "kemet_default_password_123");
    console.log("NEW EMAIL LOGGED IN OK");
  } catch(e) {
    console.log("NEW EMAIL FAIL:", e.message);
  }
}
test().then(() => process.exit()).catch();
