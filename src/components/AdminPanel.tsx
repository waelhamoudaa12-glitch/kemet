import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, User, Phone, Calendar, ShieldCheck, X, Loader2, Sparkles } from 'lucide-react';

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Order by createdAt descending so newest appear first
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (error: any) {
        console.error('Firestore Error Details:', error);
        
        // Detailed error info for debugging
        const errInfo = {
          error: error.message,
          operationType: 'delete',
          path: `users/${userId}`,
          authInfo: {
            userId: auth.currentUser?.uid,
            email: auth.currentUser?.email,
          }
        };
        
        console.error('Firestore Error JSON:', JSON.stringify(errInfo));
        alert('حدث خطأ أثناء الحذف: ' + (error.message.includes('permission-denied') ? 'ليس لديك صلاحية كافية' : error.message));
      }
    }
  };

  const isNewUser = (createdAt: any) => {
    if (!createdAt) return false;
    const date = createdAt.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < 24 * 60 * 60 * 1000; // Less than 24 hours
  };

  return (
    <div className="fixed inset-0 z-[150] bg-white flex flex-col font-sans">
      <header className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="bg-blue-600 p-3 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter">لوحة التحكم</h1>
            <p className="text-gray-400 text-sm font-medium">إدارة {users.length} مستخدم مسجل</p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="w-14 h-14 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black"
        >
          <X className="w-8 h-8" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-8 lg:p-16 bg-gray-50/50">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-full gap-6">
             <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
             <p className="font-bold text-gray-400 tracking-widest uppercase text-xs">Fetching Data...</p>
           </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
            <User className="w-16 h-16 opacity-20" />
            <p className="text-xl font-bold">لا يوجد مستخدمين مسجلين بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {users.map((u) => {
                const isNew = isNewUser(u.createdAt);
                return (
                  <motion.div 
                    layout
                    key={u.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-8 bg-white border ${isNew ? 'border-blue-200 ring-4 ring-blue-50' : 'border-gray-100'} rounded-[2rem] shadow-xl relative group transition-all hover:translate-y-[-4px]`}
                  >
                    {isNew && (
                      <div className="absolute top-6 right-6 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-bounce">
                        <Sparkles className="w-3 h-3" />
                        جديد
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center text-center mb-10 mt-4">
                      <div className={`w-20 h-20 ${u.isAdmin ? 'bg-blue-600' : 'bg-gray-100'} flex items-center justify-center rounded-3xl mb-4 shadow-inner`}>
                        <User className={`w-10 h-10 ${u.isAdmin ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">{u.displayName}</h3>
                      {u.isAdmin ? (
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-2">ADMINISTRATOR</span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Verified Member</span>
                      )}
                    </div>

                    <div className="space-y-4 mb-10">
                      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                        <Phone className="w-5 h-5 text-blue-500" />
                        <span className="font-mono font-bold text-lg">{u.phoneNumber}</span>
                      </div>
                      
                      {u.selections && (
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                          <p className="text-[10px] font-black text-blue-600 uppercase mb-2">Selected Design</p>
                          <div className="flex flex-col gap-1">
                            {Object.entries(u.selections).map(([key, val]: [string, any]) => {
                                const categoryName = key === 'style' ? 'النمط' : 
                                    (key === 'walls' ? 'الحوائط' : 
                                    (key === 'floors' ? 'الأرضيات' : 
                                    (key === 'ceilings' ? 'الأسقف' : 
                                    (key === 'doors' ? 'الأبواب' : 
                                    (key === 'lighting' ? 'الإضاءة' : 
                                    (key === 'bathrooms' ? 'الحمامات' : 
                                    (key === 'kitchen' ? 'المطبخ' : key)))))));
                                
                                return (
                                    <div key={key} className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-gray-400">{categoryName}:</span>
                                        <span className="text-blue-800">{val}</span>
                                    </div>
                                );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-400 px-2">
                        <Calendar className="w-4 h-4" />
                        <span>انضم: {u.createdAt?.toDate()?.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) || '---'}</span>
                      </div>
                    </div>

                    {!u.isAdmin ? (
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="w-full py-5 bg-red-50 text-red-500 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        <Trash2 className="w-5 h-5" />
                        Delete Account
                      </button>
                    ) : (
                      <div className="py-5 bg-gray-50 text-gray-300 font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed">
                        <ShieldCheck className="w-5 h-5" />
                        System Owner
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
