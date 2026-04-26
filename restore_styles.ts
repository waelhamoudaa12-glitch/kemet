import { doc, writeBatch, collection, getDocs } from 'firebase/firestore';
import { db } from './src/lib/firebase';
import { STYLES as INITIAL_STYLES } from './src/constants';

async function restoreAllStyles() {
    try {
        console.log("Fetching all current styles...");
        const stylesSnap = await getDocs(collection(db, 'app_styles'));
        
        console.log("Restoring default options for all styles...");
        const batch = writeBatch(db);
        
        // Delete unwanted styles that might have been added
        const initialStyleIds = INITIAL_STYLES.map(s => s.id);
        stylesSnap.forEach(docSnap => {
            if (!initialStyleIds.includes(docSnap.id)) {
                // Delete if it's an unrecognized style to clean up
                batch.delete(doc(db, 'app_styles', docSnap.id));
            }
        });

        // Set all INITIAL_STYLES
        INITIAL_STYLES.forEach((s, idx) => {
            const ref = doc(db, 'app_styles', s.id);
            batch.set(ref, { 
                id: s.id, 
                name: s.name, 
                description: s.description,
                image: s.image,
                order: idx 
            });
        });

        await batch.commit();
        console.log("Done restoring all styles.");
    } catch (e) {
        console.error("Error restoring:", e);
    }
}
restoreAllStyles();
