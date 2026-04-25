import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function test() {
  try {
    console.log("Trying to create user...");
    const num = Math.floor(Math.random() * 100000);
    const user = await createUserWithEmailAndPassword(auth, `test${num}@kemet.app`, "kemet_default_password_123");
    console.log("CREATED SUCCESSFULLY: ", user.user.uid);
  } catch (e) {
    console.log("FAIL: ", e.code, e.message);
  }
}
test().then(() => process.exit()).catch();
