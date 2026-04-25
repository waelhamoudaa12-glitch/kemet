import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, User, Phone, Calendar, ShieldCheck, X, Loader2, Sparkles, Search, ChevronLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { STYLES, CATEGORIES } from '../constants';
import { Category, Option } from '../types';

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

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

  const filteredUsers = users.filter(u => 
    (u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.phoneNumber?.includes(searchQuery))
  );

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
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[160] bg-white flex flex-col font-sans"
          >
            <header className="p-4 md:p-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">{selectedUser.displayName}</h2>
                  <p className="text-gray-400 text-xs md:text-sm font-medium">تصميم المستخدم النهائي (Final Ticket)</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-24 bg-gray-50/50">
              <div className="max-w-4xl mx-auto space-y-12">
                {/* User Info Card */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-24 h-24 bg-blue-600 flex items-center justify-center rounded-3xl shadow-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-right">
                    <h3 className="text-3xl font-black mb-2">{selectedUser.displayName}</h3>
                    <div className="flex flex-wrap justify-center md:justify-end gap-4 text-gray-500 font-bold">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-500" />
                        <span className="font-mono">{selectedUser.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{selectedUser.createdAt?.toDate()?.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Design Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Selected Style */}
                  <div className="md:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden group">
                    <div className="relative h-64 overflow-hidden">
                      {selectedUser.selections?.style && (
                        <>
                          <img 
                            src={STYLES.find(s => s.id === selectedUser.selections.style)?.image} 
                            alt="Selected Style"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                            <span className="text-blue-400 font-black text-xs uppercase tracking-widest mb-2">النمط المختار</span>
                            <h4 className="text-3xl font-black text-white">{STYLES.find(s => s.id === selectedUser.selections.style)?.name || selectedUser.selections.style}</h4>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Selections Breakdown */}
                  {CATEGORIES.map((cat: Category) => {
                    const selectedOptionId = selectedUser.selections?.[cat.id];
                    const option = cat.options.find((o: Option) => o.id === selectedOptionId);
                    
                    if (!option) return null;

                    return (
                      <div key={cat.id} className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 flex gap-6">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-md">
                          <img 
                            src={option.image} 
                            alt={option.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <cat.icon className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-wider">{cat.name}</span>
                          </div>
                          <h5 className="text-xl font-bold text-gray-900">{option.name}</h5>
                          {option.color && (
                             <div className="flex items-center gap-2 mt-2">
                               <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: option.color }} />
                               <span className="text-[10px] text-gray-400 font-bold uppercase">{option.color}</span>
                             </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Final QR/Ticket Placeholder */}
                <div className="bg-blue-600 p-12 rounded-[3rem] text-center text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
                  
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-6 opacity-80" />

                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="p-4 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="bg-blue-600 p-2 md:p-3 rounded-2xl">
            <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-3xl font-black tracking-tighter">لوحة التحكم</h1>
            <p className="text-gray-400 text-[10px] md:text-sm font-medium">إدارة {users.length} مستخدم مسجل</p>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
           <div className="relative">
              <input 
                type="text"
                placeholder="بحث بالاسم أو الرقم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-sm"
              />
              <Loader2 className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 ${loading ? 'animate-spin' : 'hidden'}`} />
              {!loading && (
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              )}
           </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-black"
        >
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </header>

      <div className="md:hidden p-4 bg-white border-b border-gray-100">
         <input 
            type="text"
            placeholder="بحث بالاسم أو الرقم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-xs"
          />
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-16 bg-gray-50/50">
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
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
            <Search className="w-16 h-16 opacity-20" />
            <p className="text-xl font-bold">لم يتم العثور على نتائج للبحث "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-blue-600 font-bold hover:underline"
            >
              إعادة تعيين البحث
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredUsers.map((u) => {
                const isNew = isNewUser(u.createdAt);
                return (
                  <motion.div 
                    layout
                    key={u.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setSelectedUser(u)}
                    className={`p-8 bg-white border ${isNew ? 'border-blue-200 ring-4 ring-blue-50' : 'border-gray-100'} rounded-[2rem] shadow-xl relative group transition-all hover:translate-y-[-4px] cursor-pointer`}
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
