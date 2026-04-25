import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    console.log("Trying to create user and doc...");
    const num = Math.floor(Math.random() * 100000);
    const email = `test${num}@kemet.app`;
    const userCredential = await createUserWithEmailAndPassword(auth, email, "kemet_default_password_123");
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
       uid: userCredential.user.uid,
       phoneNumber: `010${num}`,
       displayName: `Test ${num}`,
       isAdmin: false,
       createdAt: new Date().toISOString(),
       lastUpdated: new Date().toISOString()
    });
    console.log("CREATED SUCCESSFULLY: ", userCredential.user.uid);
  } catch (e) {
    console.log("FAIL: ", e.code, e.message);
  }
}
test().then(() => process.exit()).catch();
