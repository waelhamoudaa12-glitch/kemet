import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, orderBy, getDocs } from "firebase/firestore";
import { readFileSync } from "fs";

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  const q = query(collection(db, 'app_styles'), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  console.log("With orderBy:", snap.docs.length);

  const q2 = query(collection(db, 'app_styles'));
  const snap2 = await getDocs(q2);
  console.log("Without orderBy:", snap2.docs.length);
}
test().then(() => process.exit()).catch(e => { console.error(e); process.exit(1); });
