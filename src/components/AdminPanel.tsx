import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, orderBy, setDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, User, Phone, Calendar, ShieldCheck, X, Loader2, Sparkles, 
  Search, ChevronLeft, ArrowRight, CheckCircle2, Palette, Plus, Settings, 
  Image as ImageIcon, Edit, Save, List, Home
} from 'lucide-react';
import { Category, Option } from '../types';
import * as LucideIcons from 'lucide-react';

const getIcon = (name: string) => {
  const icons: any = { ...LucideIcons, Home, Palette, ShieldCheck, Sparkles, User, Box: LucideIcons.Box, Layers: LucideIcons.Layers, Brush: LucideIcons.Brush, Layout: LucideIcons.Layout, Grid: LucideIcons.Grid };
  return icons[name] || Palette;
};

function ImageInput({ 
  value, 
  onChange, 
  required 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  required?: boolean 
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Resize to max 800
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          const MAX_HEIGHT = 800;
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        onChange(canvas.toDataURL('image/jpeg', 0.8));
        setUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const isDataUrl = value.startsWith('data:image');

  return (
    <div className="flex gap-4 text-right">
      {value && (
        <img src={value} alt="Preview" className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover shrink-0 border border-gold-500/20 bg-egypt-black" />
      )}
      <div className="flex-1 relative">
        <label className="text-xs font-black text-gold-500/40 uppercase tracking-widest text-right block mb-2">
           الصورة (رابط خارجي أو ملف)
        </label>
        <div className="flex gap-2 relative">
          {isDataUrl ? (
            <div className="flex-1 min-w-0 bg-egypt-black border border-gold-500/10 rounded-2xl py-3 px-4 text-gold-500 font-mono text-xs md:text-sm text-center flex items-center justify-center">
               تم اختيار ملف من الجهاز
               <button type="button" onClick={() => onChange('')} className="ml-2 text-red-500 hover:text-red-400">
                  <X className="w-4 h-4" />
               </button>
            </div>
          ) : (
            <input 
               type="text" 
               value={value}
               onChange={(e) => onChange(e.target.value)}
               className="flex-1 w-full min-w-0 bg-egypt-black border border-gold-500/10 rounded-2xl py-3 px-4 text-white font-mono text-xs md:text-sm text-left dir-ltr" 
               placeholder="https://..."
               required={required && !value}
            />
          )}
          {isDataUrl && (
            <input type="hidden" value={value} />
          )}
          <label className="shrink-0 bg-gold-500/10 hover:bg-gold-500/20 text-gold-500 px-4 py-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2 border border-gold-500/20">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            <span className="hidden sm:inline">تغيير الصورة</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>
        </div>
      </div>
    </div>
  );
}

export function AdminPanel({ 
  onClose, 
  appStyles, 
  appCategories 
}: { 
  onClose: () => void,
  appStyles: any[],
  appCategories: any[]
}) {
  const [activeTab, setActiveTab] = useState<'content'>('content');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Content management state
  const [editingStyle, setEditingStyle] = useState<any | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isAddingStyle, setIsAddingStyle] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // New option states for Categories
  const [newOptName, setNewOptName] = useState('');
  const [newOptImg, setNewOptImg] = useState('');
  
  // Local state for image forms
  const [activeStyleImage, setActiveStyleImage] = useState('');

  // Content management state
  const handleDeleteStyle = async (styleId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا النمط؟')) {
      try {
        await deleteDoc(doc(db, 'app_styles', styleId));
      } catch (error) {
        console.error("Delete style error:", error);
        alert("حدث خطأ أثناء الحذف");
      }
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا القسم بجميع خياراته؟')) {
      try {
        await deleteDoc(doc(db, 'app_categories', catId));
      } catch (error) {
        console.error("Delete category error:", error);
        alert("حدث خطأ أثناء الحذف");
      }
    }
  };

  const handleSaveStyle = async (styleData: any) => {
    console.log("Saving style data...", styleData);
    try {
      const id = styleData.id || `style_${Date.now()}`;
      await setDoc(doc(db, 'app_styles', id), {
        ...styleData,
        id,
        order: styleData.order ?? Date.now(),
        updatedAt: new Date()
      }, { merge: true });
      console.log("Style saved successfully");
      setIsAddingStyle(false);
      setEditingStyle(null);
    } catch (error) {
      console.error("Save style error:", error);
      alert("حدث خطأ أثناء الحفظ: " + String(error));
    }
  };

  const handleSaveCategory = async (catData: any) => {
    try {
      const id = catData.id || `cat_${Date.now()}`;
      await setDoc(doc(db, 'app_categories', id), {
        ...catData,
        id,
        order: catData.order ?? Date.now(),
        updatedAt: new Date()
      }, { merge: true });
      setIsAddingCategory(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Save category error:", error);
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-egypt-black flex flex-col font-sans">
      <header className="p-4 md:p-8 border-b border-gold-500/10 flex justify-between items-center bg-egypt-dark sticky top-0 z-10 shadow-xl">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="bg-gold-500 p-2 md:p-3 rounded-2xl shadow-glow">
            <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-egypt-black" />
          </div>
          <div className="text-right">
            <h1 className="text-xl md:text-3xl font-black tracking-tighter text-white">لوحة التعديل والتحكم الملكية</h1>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center hover:bg-gold-500/10 rounded-full transition-all text-gold-500/40 hover:text-gold-500"
        >
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </header>

      <div className="md:hidden p-4 bg-egypt-dark border-b border-gold-500/10 hidden">
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-16 bg-egypt-black pharaonic-pattern">
          <div className="max-w-6xl mx-auto space-y-16">
            {/* Styles Management */}
            <div>
              <div className="flex justify-between items-end mb-8">
                 <div className="text-right">
                    <h3 className="text-3xl font-black text-white">الأنماط (Styles)</h3>
                    <p className="text-gold-500/40 text-xs font-black uppercase tracking-widest mt-1">إدارة التصميمات الأساسية</p>
                 </div>
                 <button 
                   onClick={() => {
                     setIsAddingStyle(true);
                     setActiveStyleImage('');
                   }}
                   className="flex items-center gap-2 bg-gold-500 text-egypt-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-glow"
                 >
                   <Plus className="w-4 h-4" />
                   إضافة نمط جديد
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {appStyles.map(style => (
                    <div key={style.id} className="bg-egypt-dark rounded-[2rem] overflow-hidden border border-gold-500/10 group">
                       <div className="h-48 relative overflow-hidden">
                          <img src={style.image} alt={style.name} className="w-full h-full object-cover transition-transform group-hover:scale-105"  referrerPolicy="no-referrer"/>
                       </div>
                       <div className="p-6 text-right">
                          <h4 className="text-xl font-black text-white mb-2">{style.name}</h4>
                          <p className="text-gold-200/40 text-xs font-medium mb-6 line-clamp-2">{style.description}</p>
                          <div className="flex gap-2">
                             <button 
                               onClick={() => {
                                 setEditingStyle(style);
                                 setActiveStyleImage(style.image || '');
                               }}
                               className="flex-1 bg-gold-500/10 text-gold-500 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gold-500 hover:text-egypt-black transition-all flex items-center justify-center gap-2"
                             >
                                <Edit className="w-3 h-3" />
                                تعديل
                             </button>
                             <button 
                               onClick={() => handleDeleteStyle(style.id)}
                               className="w-12 bg-red-500/10 text-red-500 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            </div>

            {/* Categories Management */}
            <div>
              <div className="flex justify-between items-end mb-8">
                 <div className="text-right">
                    <h3 className="text-3xl font-black text-white">الأقسام (Categories)</h3>
                    <p className="text-gold-500/40 text-xs font-black uppercase tracking-widest mt-1">إدارة الخامات والموديلات</p>
                 </div>
                 <button 
                   onClick={() => setIsAddingCategory(true)}
                   className="flex items-center gap-2 bg-gold-500 text-egypt-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-glow"
                 >
                   <Plus className="w-4 h-4" />
                   إضافة قسم جديد
                 </button>
              </div>

              <div className="space-y-6">
                 {appCategories.map(cat => (
                    <div key={cat.id} className="bg-egypt-dark rounded-[2.5rem] p-8 border border-gold-500/10 flex flex-col md:flex-row gap-8 items-center text-right">
                       <div className="w-16 h-16 bg-gold-500 flex items-center justify-center rounded-2xl shrink-0 shadow-lg">
                          {(() => {
                             const Icon = getIcon(cat.iconName);
                             return <Icon className="w-8 h-8 text-egypt-black" />;
                          })()}
                       </div>
                       <div className="flex-1">
                          <h4 className="text-2xl font-black text-white mb-1">{cat.name}</h4>
                          <p className="text-gold-500/40 text-[10px] font-black uppercase tracking-widest">{cat.options?.length || 0} خيارات متاحة</p>
                       </div>
                       <div className="flex gap-4">
                          <button 
                             onClick={() => setEditingCategory(cat)}
                             className="bg-gold-500/10 text-gold-500 border border-gold-500/20 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-egypt-black transition-all flex items-center gap-2"
                          >
                             <Edit className="w-4 h-4" />
                             تعديل الخيارات
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="w-10 h-10 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          </div>
      </main>

      {/* Style Modal */}
      <AnimatePresence>
        {(isAddingStyle || editingStyle) && (
          <div className="fixed inset-0 z-[200] bg-egypt-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-egypt-dark w-full max-w-2xl rounded-[3rem] border border-gold-500/20 shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-white">{editingStyle ? 'تعديل النمط' : 'إضافة نمط جديد'}</h3>
                  <button onClick={() => { setIsAddingStyle(false); setEditingStyle(null); }} className="text-gold-500/40 hover:text-gold-500"><X /></button>
                </div>
                <form className="space-y-6" onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  await handleSaveStyle({
                    id: editingStyle?.id,
                    name: formData.get('name'),
                    description: formData.get('description'),
                    image: activeStyleImage,
                  });
                }}>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gold-500/40 uppercase tracking-widest text-right block">اسم النمط</label>
                    <input name="name" defaultValue={editingStyle?.name} className="w-full bg-egypt-black border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-right" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gold-500/40 uppercase tracking-widest text-right block">الوصف</label>
                    <textarea name="description" defaultValue={editingStyle?.description} className="w-full bg-egypt-black border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-right h-32" required />
                  </div>
                  <div className="space-y-2">
                    <ImageInput value={activeStyleImage} onChange={setActiveStyleImage} required />
                  </div>
                  <button type="submit" className="w-full bg-gold-500 text-egypt-black py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-glow">
                    <Save className="w-5 h-5" />
                    حفظ النمط
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {(isAddingCategory || editingCategory) && (
          <div className="fixed inset-0 z-[200] bg-egypt-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-egypt-dark w-full max-w-4xl max-h-[90vh] rounded-[3rem] border border-gold-500/20 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-8 md:p-12 overflow-y-auto">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-white">{editingCategory ? 'تعديل القسم والخامات' : 'إضافة قسم جديد'}</h3>
                  <button onClick={() => { setIsAddingCategory(false); setEditingCategory(null); setNewOptName(''); setNewOptImg(''); }} className="text-gold-500/40 hover:text-gold-500"><X /></button>
                </div>
                
                <form className="space-y-8" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  // Collect options
                  const options: any[] = editingCategory?.options || [];
                  handleSaveCategory({
                    id: editingCategory?.id,
                    name: formData.get('name'),
                    iconName: formData.get('iconName'),
                    options
                  });
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gold-500/40 uppercase tracking-widest text-right block">اسم القسم</label>
                       <input name="name" defaultValue={editingCategory?.name} className="w-full bg-egypt-black border border-gold-500/10 rounded-2xl py-4 px-6 text-white text-right" required />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-black text-gold-500/40 uppercase tracking-widest text-right block">اسم الأيقونة (Lucide Icon Name)</label>
                       <input name="iconName" defaultValue={editingCategory?.iconName} className="w-full bg-egypt-black border border-gold-500/10 rounded-2xl py-4 px-6 text-white font-mono dir-ltr text-left" required />
                    </div>
                  </div>

                  {/* Options Section */}
                  <div className="space-y-6">
                     <div className="flex justify-end items-center">
                        <h4 className="text-lg font-black text-white mb-2">إدارة الخيارات (الخامات/الموديلات)</h4>
                     </div>
                     
                     <div className="bg-egypt-black/50 p-6 rounded-[2rem] border border-gold-500/20 space-y-4">
                        <h5 className="text-gold-500 text-xs font-black uppercase tracking-widest text-right">إضافة خيار جديد</h5>
                        <div className="flex flex-col gap-4">
                           <input 
                             type="text" 
                             value={newOptName} 
                             onChange={e => setNewOptName(e.target.value)} 
                             placeholder="اسم الخيار (مثال: رخام إيطالي)" 
                             className="w-full bg-egypt-black border border-gold-500/10 rounded-2xl py-3 px-4 text-white text-right" 
                           />
                           <ImageInput value={newOptImg} onChange={setNewOptImg} />
                           <button 
                             type="button" 
                             onClick={() => {
                               if (newOptName && newOptImg) {
                                  const updatedOptions = [...(editingCategory?.options || []), {
                                     id: `opt_${Date.now()}`,
                                     name: newOptName,
                                     image: newOptImg
                                  }];
                                  setEditingCategory({ ...editingCategory! ?? { id: `cat_${Date.now()}`, name: '', iconName: '' }, options: updatedOptions });
                                  setNewOptName('');
                                  setNewOptImg('');
                               }
                             }} 
                             className="bg-gold-500/10 text-gold-500 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-egypt-black transition-all"
                           >
                             إضافة الخيار
                           </button>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(editingCategory?.options || []).map((opt: any, idx: number) => (
                           <div key={opt.id} className="bg-egypt-black p-4 rounded-2xl border border-gold-500/10 flex items-center gap-4 text-right">
                              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-gold-500/10">
                                 <img src={opt.image} alt={opt.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                 <p className="text-white font-black text-sm">{opt.name}</p>
                                 <button 
                                   type="button"
                                   onClick={() => {
                                      const updatedOptions = editingCategory.options.filter((_: any, i: number) => i !== idx);
                                      setEditingCategory({ ...editingCategory, options: updatedOptions });
                                   }}
                                   className="text-red-500 text-[10px] font-black uppercase mt-1 hover:underline flex items-center gap-1 justify-end w-full"
                                 >
                                    حذف <Trash2 className="w-3 h-3" />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <button type="submit" className="w-full bg-gold-500 text-egypt-black py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-glow mt-8">
                    <Save className="w-5 h-5" />
                    حفظ القسم والخيارات
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
