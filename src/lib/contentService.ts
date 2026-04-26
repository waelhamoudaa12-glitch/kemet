import { collection, query, onSnapshot, doc, getDocs, setDoc, deleteDoc, orderBy, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { Style, Category } from '../types';
import { STYLES as INITIAL_STYLES, CATEGORIES as INITIAL_CATEGORIES } from '../constants';

export const syncInitialData = async () => {
    // Check if styles exist
    const stylesSnap = await getDocs(collection(db, 'app_styles'));
    if (stylesSnap.empty) {
        console.log("Initializing styles...");
        const batch = writeBatch(db);
        INITIAL_STYLES.forEach((s, idx) => {
            const ref = doc(db, 'app_styles', s.id);
            batch.set(ref, { ...s, order: idx });
        });
        await batch.commit();
    }

    // Check if categories exist
    const catsSnap = await getDocs(collection(db, 'app_categories'));
    if (catsSnap.empty) {
        console.log("Initializing categories...");
        const batch = writeBatch(db);
        INITIAL_CATEGORIES.forEach((c, idx) => {
            const ref = doc(db, 'app_categories', c.id);
            // Store icon name instead of component
            const iconName = c.icon.name || c.id; 
            batch.set(ref, { 
                id: c.id, 
                name: c.name, 
                iconName: iconName, 
                options: c.options, 
                order: idx 
            });
        });
        await batch.commit();
    }
};

export const subscribeToStyles = (callback: (styles: Style[]) => void) => {
    const q = query(collection(db, 'app_styles'), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const styles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Style));
        callback(styles);
    });
};

export const subscribeToCategories = (callback: (categories: any[]) => void) => {
    const q = query(collection(db, 'app_categories'), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(cats);
    });
};

export const updateStyle = async (id: string, data: Partial<Style>) => {
    await setDoc(doc(db, 'app_styles', id), data, { merge: true });
};

export const deleteStyle = async (id: string) => {
    await deleteDoc(doc(db, 'app_styles', id));
};

export const updateCategory = async (id: string, data: any) => {
    await setDoc(doc(db, 'app_categories', id), data, { merge: true });
};

export const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, 'app_categories', id));
};
