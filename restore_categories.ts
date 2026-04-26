import { doc, writeBatch, collection, getDocs } from 'firebase/firestore';
import { db } from './src/lib/firebase';
import { CATEGORIES as INITIAL_CATEGORIES } from './src/constants';

async function restoreAllCategories() {
    try {
        console.log("Fetching all current categories...");
        const catsSnap = await getDocs(collection(db, 'app_categories'));
        
        console.log("Restoring default options for all categories...");
        const batch = writeBatch(db);
        
        // Delete unwanted cats that might have been added
        const initialCategoryIds = INITIAL_CATEGORIES.map(c => c.id);
        catsSnap.forEach(docSnap => {
            if (!initialCategoryIds.includes(docSnap.id)) {
                // Delete if it's an unrecognized category to clean up
                batch.delete(doc(db, 'app_categories', docSnap.id));
            }
        });

        // Set all INITIAL_CATEGORIES
        INITIAL_CATEGORIES.forEach((c, idx) => {
            const ref = doc(db, 'app_categories', c.id);
            // using c.id as iconName since in constants.ts icon is a React component and icon.name might be minified
            const iconName = c.id; 
            batch.set(ref, { 
                id: c.id, 
                name: c.name, 
                iconName: iconName, 
                options: c.options, 
                order: idx 
            });
        });

        await batch.commit();
        console.log("Done restoring all categories.");
    } catch (e) {
        console.error("Error restoring:", e);
    }
}
restoreAllCategories();
