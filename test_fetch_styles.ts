import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/lib/firebase';

async function testFetch() {
    try {
        console.log("Fetching styles...");
        const stylesSnap = await getDocs(collection(db, 'app_styles'));
        console.log("Styles count:", stylesSnap.size);
        stylesSnap.forEach(doc => console.log(doc.id, doc.data()));

        console.log("Fetching categories...");
        const catsSnap = await getDocs(collection(db, 'app_categories'));
        console.log("Categories count:", catsSnap.size);
        catsSnap.forEach(doc => console.log(doc.id, doc.data()));
    } catch (e) {
        console.error("Error fetching:", e);
    }
}
testFetch();
