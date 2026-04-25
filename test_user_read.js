import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, getDoc, doc } from "firebase/firestore";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
     const email = "waelweza123123@kemet.app";
     const pass = "kemet_default_password_123";
     await signInWithEmailAndPassword(auth, email, pass);
     console.log("Logged in");
     
     const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
     if (userDoc.exists()) {
        console.log("User doc exists: ", userDoc.data());
     } else {
        console.log("User doc does not exist");
     }
  } catch(e) {
     console.error("Test failed: ", e.code, e.message);
  }
  process.exit();
}
test();
