import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, User, Phone, Calendar, ShieldCheck, X, Loader2, Sparkles, Search, ChevronLeft, ArrowRight, CheckCircle2, Palette } from 'lucide-react';
import { STYLES, CATEGORIES } from '../constants';
import { Category, Option } from '../types';

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    // Listen to users collection
    const usersQ = query(collection(db, 'users'));

    const unsubUsers = onSnapshot(usersQ, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory to avoid missing field index issues in Firestore
      const sortedUsers = usersData.sort((a: any, b: any) => {
        const timeA = a.lastUpdated?.toMillis() || a.createdAt?.toMillis() || 0;
        const timeB = b.lastUpdated?.toMillis() || b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setAllUsers(sortedUsers);
      setLoading(false);
    }, (err) => console.error("Users fetch error:", err));

    return () => unsubUsers();
  }, []);

  const filteredItems = allUsers.filter(item => {
    const name = item.displayName;
    const phone = item.phoneNumber;
    return (name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
           (phone?.includes(searchQuery));
  });

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) {
      try {
        await deleteDoc(doc(db, 'users', itemId));
      } catch (error: any) {
        console.error('Firestore Error Details:', error);
        
        // Detailed error info for debugging
        const errInfo = {
          error: error.message,
          operationType: 'delete',
          path: `users/${itemId}`,
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
    <div className="fixed inset-0 z-[150] bg-egypt-black flex flex-col font-sans">
      <AnimatePresence>
        {selectedUser && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[160] bg-egypt-black flex flex-col font-sans"
          >
            <header className="p-4 md:p-8 border-b border-gold-500/10 flex items-center justify-between bg-egypt-dark sticky top-0 z-10">
              <div className="flex items-center gap-4 text-white">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-gold-500/10 rounded-full transition-all text-gold-500"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight">{selectedUser.userName}</h2>
                  <p className="text-gold-500/40 text-xs md:text-sm font-medium">تصميم المستخدم النهائي (Final Ticket)</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-gold-500/10 rounded-full transition-all text-gold-500/40"
              >
                <X className="w-6 h-6" />
              </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-24 bg-egypt-black pharaonic-pattern">
              <div className="max-w-4xl mx-auto space-y-12">
                {/* User Info Card */}
                <div className="bg-egypt-dark p-8 rounded-[2.5rem] shadow-xl border border-gold-500/10 flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-24 h-24 bg-gold-500 flex items-center justify-center rounded-3xl shadow-lg">
                    <User className="w-12 h-12 text-egypt-black" />
                  </div>
                  <div className="flex-1 text-center md:text-right">
                    <h3 className="text-3xl font-black mb-2 text-white">{selectedUser.userName}</h3>
                    <div className="flex flex-wrap justify-center md:justify-end gap-4 text-gold-200/40 font-black">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gold-500" />
                        <span className="font-mono tracking-widest">{selectedUser.userPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gold-500" />
                        <span>{selectedUser.createdAt?.toDate()?.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Design Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Selected Style */}
                  <div className="md:col-span-2 bg-egypt-dark rounded-[2.5rem] shadow-xl border border-gold-500/10 overflow-hidden group">
                    <div className="relative h-64 md:h-80 overflow-hidden">
                      {selectedUser.selections?.style ? (
                        <>
                          <img 
                            src={STYLES.find(s => s.id === selectedUser.selections.style)?.image} 
                            alt="Selected Style"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-egypt-black via-transparent to-transparent flex flex-col justify-end p-8 md:p-12">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-gold-500 rounded-2xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                                <Sparkles className="w-6 h-6 text-egypt-black" />
                              </div>
                              <span className="text-gold-500 font-black text-sm uppercase tracking-[0.2em]">النمط المختار</span>
                            </div>
                            <h4 className="text-4xl md:text-5xl font-black text-white">{STYLES.find(s => s.id === selectedUser.selections.style)?.name || selectedUser.selections.style}</h4>
                            <p className="text-gold-200/40 mt-2 font-medium max-w-xl">
                              {STYLES.find(s => s.id === selectedUser.selections.style)?.description}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-egypt-black flex flex-col items-center justify-center text-gold-500/20 gap-4">
                            <Palette className="w-16 h-16 opacity-20" />
                            <p className="text-xl font-black">لم يتم اختيار نمط بعد</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selections Breakdown */}
                   {selectedUser.selections ? (
                    CATEGORIES.map((cat: Category) => {
                      const selection = selectedUser.selections[cat.id];
                      if (!selection) return null;

                      // Normalize to array for consistent handling
                      const selectedIds = Array.isArray(selection) ? selection : [selection];
                      const selectedOptions = cat.options.filter((o: Option) => selectedIds.includes(o.id));
                      
                      if (selectedOptions.length === 0) return null;

                      return selectedOptions.map((option: Option) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={`${cat.id}-${option.id}`} 
                          className="bg-egypt-dark p-6 rounded-[2.5rem] shadow-xl border border-gold-500/10 flex gap-6 hover:border-gold-500/30 transition-all text-right"
                        >
                          <div className="w-28 h-28 rounded-3xl overflow-hidden shrink-0 shadow-lg border-2 border-gold-500/10 bg-egypt-black">
                            <img 
                              src={option.image} 
                              alt={option.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-2 text-gold-500 mb-2">
                              <cat.icon className="w-5 h-5" />
                              <span className="text-xs font-black uppercase tracking-[0.1em]">{cat.name}</span>
                            </div>
                            <h5 className="text-2xl font-black text-white leading-tight">{option.name}</h5>
                            {option.color && (
                               <div className="flex items-center gap-3 mt-3 bg-gold-500/5 px-3 py-2 rounded-full w-fit">
                                 <div className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: option.color }} />
                                 <span className="text-[10px] text-gold-500/40 font-black uppercase tracking-wider">{option.color}</span>
                               </div>
                            )}
                          </div>
                        </motion.div>
                      ));
                    })
                  ) : (
                    <div className="md:col-span-2 text-center py-20 text-gold-500/30">
                        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin opacity-20" />
                        <p className="text-xl font-black tracking-tighter">المستخدم لم يبدأ في اختيار التفاصيل بعد</p>
                    </div>
                  )}
                </div>

                {/* Final QR/Ticket Placeholder */}
                <div className="bg-gold-500 p-12 rounded-[3rem] text-center text-egypt-black relative overflow-hidden shadow-2xl shadow-gold-500/20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-egypt-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
                  <h4 className="text-3xl font-black tracking-widest italic">KEMET ARCHITECTURE</h4>
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="p-4 md:p-8 border-b border-gold-500/10 flex justify-between items-center bg-egypt-dark sticky top-0 z-10 shadow-xl">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="bg-gold-500 p-2 md:p-3 rounded-2xl shadow-glow">
            <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-egypt-black" />
          </div>
          <div className="text-right">
            <h1 className="text-xl md:text-3xl font-black tracking-tighter text-white">لوحة التحكم الملكية</h1>
            <p className="text-gold-200/30 text-[10px] md:text-sm font-black uppercase tracking-widest">إدارة {allUsers.length} تصميم مكتشف</p>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 hidden md:block">
           <div className="relative">
              <input 
                type="text"
                placeholder="بحث بالاسم أو الرقم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-egypt-black border border-gold-500/10 rounded-2xl py-3 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all font-black text-sm text-white"
              />
              <Loader2 className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500/30 ${loading ? 'animate-spin' : 'hidden'}`} />
              {!loading && (
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500/30" />
              )}
           </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center hover:bg-gold-500/10 rounded-full transition-all text-gold-500/40 hover:text-gold-500"
        >
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </header>

      <div className="md:hidden p-4 bg-egypt-dark border-b border-gold-500/10">
         <input 
            type="text"
            placeholder="بحث بالاسم أو الرقم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-egypt-black border border-gold-500/10 rounded-xl py-3 px-6 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all font-black text-xs text-white"
          />
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-16 bg-egypt-black pharaonic-pattern">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-full gap-6">
             <Loader2 className="w-12 h-12 animate-spin text-gold-500" />
             <p className="font-black text-gold-500/40 tracking-widest uppercase text-xs">Fetching Designs...</p>
           </div>
        ) : allUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gold-500/20 gap-4">
            <User className="w-16 h-16 opacity-20" />
            <p className="text-xl font-black">لا يوجد مستخدمين بعد</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gold-500/20 gap-4">
            <Search className="w-16 h-16 opacity-20" />
            <p className="text-xl font-black">لم يتم العثور على نتائج للبحث "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-gold-500 font-black hover:underline uppercase tracking-widest text-xs"
            >
              إعادة تعيين البحث
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 text-right">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((u) => {
                const isNew = isNewUser(u.createdAt || u.lastUpdated);
                const name = u.displayName;
                const phone = u.phoneNumber;
                const dateLabel = 'آخر تحديث';
                const timestamp = u.lastUpdated || u.createdAt;

                return (
                  <motion.div 
                    layout
                    key={u.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setSelectedUser({ ...u, userName: name, userPhone: phone })}
                    className={`p-8 bg-egypt-dark border ${isNew ? 'border-gold-500 ring-4 ring-gold-500/10' : 'border-gold-500/10'} rounded-[2rem] shadow-2xl relative group transition-all hover:translate-y-[-4px] cursor-pointer`}
                  >
                    {isNew && (
                      <div className="absolute top-6 right-6 bg-gold-500 text-egypt-black text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-gold-500/20 animate-bounce">
                        <Sparkles className="w-3 h-3" />
                        جديد
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center text-center mb-6 mt-4">
                      <div className="w-24 h-24 relative mb-4">
                        <div className="absolute inset-0 bg-egypt-black rounded-3xl shadow-inner flex items-center justify-center">
                          <User className="w-12 h-12 text-gold-500/20" />
                        </div>
                        {u.selections?.style && (
                          <img 
                            src={STYLES.find(s => s.id === u.selections.style)?.image}
                            alt="Selected Style"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-lg border-2 border-egypt-dark ring-4 ring-gold-500/5"
                          />
                        )}
                      </div>
                      <h3 className="text-2xl font-black tracking-tight text-white">{name || '---'}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-black text-gold-500 bg-gold-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
                          MEMBER
                        </span>
                        {u.selections?.style && (
                          <span className="text-[10px] font-black text-egypt-black bg-gold-500 px-3 py-1 rounded-full uppercase tracking-widest">
                            DESIGNED
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        {/* Quick Image Preview Gallery */}
                        {u.selections && Object.keys(u.selections).length > 0 && (
                          <div className="flex flex-wrap justify-center gap-2 mb-4 p-2 bg-egypt-black rounded-2xl border border-gold-500/5">
                            {(() => {
                               const previewOptions: any[] = [];
                               Object.entries(u.selections).forEach(([key, val]) => {
                                 const category = CATEGORIES.find(c => c.id === key);
                                 if (!category) return;
                                 const ids = Array.isArray(val) ? val : [val];
                                 ids.forEach(id => {
                                   const opt = category.options.find(o => o.id === id);
                                   if (opt) previewOptions.push({ ...opt, catId: key });
                                 });
                               });
                               
                               return previewOptions.slice(0, 8).map((option, idx) => (
                                 <div key={`${option.catId}-${option.id}-${idx}`} className="w-10 h-10 rounded-lg overflow-hidden border-2 border-egypt-dark shadow-sm ring-1 ring-gold-500/10">
                                   <img 
                                     src={option.image} 
                                     alt={option.name} 
                                     className="w-full h-full object-cover"
                                     referrerPolicy="no-referrer"
                                   />
                                 </div>
                               ));
                            })()}
                            {(() => {
                               let totalCount = 0;
                               Object.values(u.selections).forEach(v => {
                                 totalCount += Array.isArray(v) ? v.length : 1;
                               });
                               return totalCount > 8 ? (
                                 <div className="w-10 h-10 rounded-lg bg-egypt-dark border border-gold-500/10 flex items-center justify-center text-[10px] font-black text-gold-500/40">
                                   +{totalCount - 8}
                                 </div>
                               ) : null;
                            })()}
                          </div>
                        )}

                      <div className="flex items-center gap-4 bg-egypt-black p-4 rounded-2xl border border-gold-500/5">
                        <Phone className="w-5 h-5 text-gold-500" />
                        <span className="font-mono font-black text-lg text-white tracking-widest">{phone || '---'}</span>
                      </div>
                      
                      {u.selections && (
                        <div className="bg-gold-500/5 p-4 rounded-2xl border border-gold-500/10">
                          <p className="text-[10px] font-black text-gold-500 uppercase tracking-widest mb-2 opacity-40">
                             Selection Summary
                          </p>
                          <div className="flex flex-col gap-1">
                            {Object.entries(u.selections).map(([key, val]: [string, any]) => {
                                if (key === 'style') {
                                    const styleName = STYLES.find(s => s.id === val)?.name || val;
                                    return (
                                        <div key={key} className="flex justify-between items-center text-[10px] font-black">
                                            <span className="text-gold-500/40">النمط:</span>
                                            <span className="text-white truncate max-w-[120px]">{styleName}</span>
                                        </div>
                                    );
                                }

                                const cat = CATEGORIES.find(c => c.id === key);
                                if (!cat) return null;

                                const ids = Array.isArray(val) ? val : [val];
                                const names = cat.options.filter(o => ids.includes(o.id)).map(o => o.name);
                                
                                return (
                                    <div key={key} className="flex justify-between items-center text-[10px] font-black">
                                        <span className="text-gold-500/40">{cat.name}:</span>
                                        <span className="text-white truncate max-w-[120px]">
                                            {names.length > 1 ? `${names.length} عناصر` : (names[0] || '---')}
                                        </span>
                                    </div>
                                );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-[10px] text-gold-500/30 px-2 font-black uppercase tracking-widest">
                        <Calendar className="w-4 h-4" />
                        <span>{dateLabel}: {timestamp?.toDate()?.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }) || '---'}</span>
                      </div>
                    </div>

                    {!u.isAdmin ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(u.id);
                        }}
                        className="w-full py-5 bg-red-500/5 text-red-500 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        <Trash2 className="w-5 h-5" />
                        حذف السجل
                      </button>
                    ) : (
                      <div className="py-5 bg-gold-500/5 text-gold-500/20 font-black text-xs uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 cursor-not-allowed">
                        <ShieldCheck className="w-5 h-5" />
                        System Owner
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) /* Closing map and list */ }
      </main>
    </div>
  );
}
