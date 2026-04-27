import { collection, query, onSnapshot, doc, getDocs, setDoc, deleteDoc, orderBy, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { Style, Category } from '../types';
import { STYLES as INITIAL_STYLES, CATEGORIES as INITIAL_CATEGORIES } from '../constants';

const INITIAL_PORTFOLIO = [
  {
    id: 'p1',
    title: 'فيلا المنصورة',
    description: 'تحويل كامل لمساحة المعيشة بنمط كلاسيكي حديث',
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400',
    afterImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=400',
    order: 0
  },
  {
    id: 'p2',
    title: 'شقة جاردن سيتي',
    description: 'تصميم عصري يركز على استغلال المساحات والإضاءة الطبيعية',
    beforeImage: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=400',
    afterImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=400',
    order: 1
  }
];

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

    // Check if portfolio exist
    const portfolioSnap = await getDocs(collection(db, 'portfolio'));
    if (portfolioSnap.empty) {
        console.log("Initializing portfolio...");
        const batch = writeBatch(db);
        INITIAL_PORTFOLIO.forEach((p, idx) => {
            const ref = doc(db, 'portfolio', p.id);
            batch.set(ref, { ...p, createdAt: new Date().toISOString() });
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
    }, (err) => {
        console.error("Error fetching categories:", err);
    });
};

export const subscribeToPortfolio = (callback: (projects: any[]) => void) => {
  const q = query(collection(db, 'portfolio'), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(projects);
  }, (err) => {
      console.error("Error fetching portfolio:", err);
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
