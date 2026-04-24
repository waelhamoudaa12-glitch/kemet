import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Trash2, User, Phone, Calendar, ShieldCheck, X } from 'lucide-react';

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (err) {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-white flex flex-col">
      <header className="p-8 border-b border-border-light flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-4">
            لوحة الإدارة <ShieldCheck className="w-8 h-8 text-blue-600" />
          </h1>
          <p className="text-gray-400 text-sm">إدارة المستخدمين المسجلين في KEMET</p>
        </div>
        <button onClick={onClose} className="p-4 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-8 h-8" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-8 lg:p-24">
        {loading ? (
           <div className="flex items-center justify-center h-64 font-bold text-gray-400 animate-pulse">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
              <motion.div 
                layout
                key={u.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 border border-border-light bg-white shadow-sm relative group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-full">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{u.displayName}</p>
                    {u.isAdmin && <span className="text-[10px] font-bold text-blue-600 uppercase border border-blue-600 px-2 py-0.5 rounded">Admin</span>}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />
                    <span>{u.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{u.createdAt?.toDate()?.toLocaleDateString('ar-EG') || '---'}</span>
                  </div>
                </div>

                {!u.isAdmin && (
                  <button 
                    onClick={() => handleDeleteUser(u.id)}
                    className="w-full py-4 border border-red-100 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف المستخدم
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
