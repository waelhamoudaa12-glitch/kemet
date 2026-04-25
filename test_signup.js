import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function test() {
  try {
    console.log("Trying to sign in with non-existent user...");
    await signInWithEmailAndPassword(auth, "xyzabc123123@kemet.app", "kemet_default_password_123");
    console.log("LOGGED IN");
  } catch (e) {
    console.log("Expected fail: ", e.code, e.message);
  }
}
test().then(() => process.exit()).catch();
