import { doc, setDoc } from 'firebase/firestore';
import { db } from './src/lib/firebase';
import { CATEGORIES as INITIAL_CATEGORIES } from './src/constants';

async function restoreDefaultOptions() {
    try {
        console.log("Restoring default options for walls and floors...");
        
        const wallsDefault = INITIAL_CATEGORIES.find(c => c.id === 'walls');
        const floorsDefault = INITIAL_CATEGORIES.find(c => c.id === 'floors');

        if (wallsDefault) {
            await setDoc(doc(db, 'app_categories', 'walls'), {
                id: 'walls',
                name: wallsDefault.name,
                iconName: 'walls',
                options: wallsDefault.options,
                order: 0
            }, { merge: true });
            console.log("Restored walls");
        }
        
        if (floorsDefault) {
             await setDoc(doc(db, 'app_categories', 'floors'), {
                id: 'floors',
                name: floorsDefault.name,
                iconName: 'floors',
                options: floorsDefault.options,
                order: 1
            }, { merge: true });
            console.log("Restored floors");
        }
        console.log("Done.");
    } catch (e) {
        console.error("Error restoring:", e);
    }
}
restoreDefaultOptions();
