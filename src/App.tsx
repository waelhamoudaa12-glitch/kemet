/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { STYLES, CATEGORIES } from './constants';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Palette, 
  Layout, 
  Lamp, 
  DoorOpen, 
  Bath, 
  Utensils, 
  CheckCircle2, 
  ArrowRight,
  Maximize2,
  Lock,
  UserCircle
} from 'lucide-react';

// --- Types ---

type AppState = 'home' | 'styles' | 'configurator' | 'summary' | 'about' | 'mydesign';

interface Selection {
  style: string;
  category: string;
  option: string;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  options: {
    id: string;
    name: string;
    image: string;
    color?: string;
  }[];
}

// --- Components ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<AppState>('home');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  const heroImages = [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fallback admin check for the number provided
        if (u.email === '0101234567123@kemet.app') {
          setIsAdmin(true);
        } else {
          try {
            const userDoc = await getDoc(doc(db, 'users', u.uid));
            const data = userDoc.data();
            setIsAdmin(data?.isAdmin === true);
            if (data?.selections) {
              setSelections(data.selections);
            }
          } catch (err) {
            console.error("Error fetching admin status:", err);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentPage !== 'home') return;
    
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [currentPage, heroImages.length]);

  const handleStart = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentPage('styles');
  };
  
  // Save selection to Firestore if logged in
  const saveSelection = async (newSelections: any) => {
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          selections: newSelections,
          lastUpdated: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error("Error saving selection:", err);
      }
    }
  };

  const handleSelectStyle = (styleId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedStyle(styleId);
    const newSelections = { ...selections, style: styleId };
    setSelections(newSelections);
    saveSelection(newSelections);
    setCurrentPage('configurator');
  };

  const handleOptionSelect = (catId: string, optionId: string) => {
    const newSelections = { ...selections, [catId]: optionId };
    setSelections(newSelections);
    saveSelection(newSelections);
    
    if (currentCategoryIndex < CATEGORIES.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    } else {
      setCurrentPage('summary');
    }
  };

  const reset = () => {
    setCurrentPage('home');
    setSelectedStyle(null);
    setCurrentCategoryIndex(0);
    setSelections({});
  };

  const navItems = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'about', label: 'عنا' },
    { id: 'styles', label: 'ابدأ التصميم' },
    ...(user ? [{ id: 'mydesign', label: 'تصميمي' }] : []),
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-brand-primary flex flex-row-reverse">
      {/* Persistent Sidebar */}
      <motion.aside 
        initial={{ x: 100 }} 
        animate={{ x: 0 }}
        className="fixed top-0 right-0 bottom-0 w-20 lg:w-64 bg-white border-l border-border-light z-50 flex flex-col items-center py-12"
      >
        <div className="mb-20 cursor-pointer" onClick={() => setCurrentPage('home')}>
           <h1 className="text-xl lg:text-3xl font-black tracking-tighter uppercase whitespace-nowrap">
             <span className="md:inline">Ke</span><span className="text-blue-600">met</span>
           </h1>
        </div>

        <nav className="flex-1 flex flex-col gap-10 w-full px-4 lg:px-8">
            {navItems.map(item => (
                <button 
                    key={item.id}
                    onClick={() => {
                        if (item.id === 'styles') {
                            if (!user) {
                                setIsAuthModalOpen(true);
                            } else {
                                setCurrentPage('styles');
                            }
                        } else {
                            setCurrentPage(item.id as AppState);
                        }
                    }}
                    className={`flex items-center gap-4 group transition-all ${
                        currentPage === item.id ? 'text-blue-600' : 'text-gray-400 hover:text-black'
                    }`}
                >
                    <div className={`w-2 h-2 rounded-full transition-all ${currentPage === item.id ? 'bg-blue-600 scale-125' : 'bg-transparent group-hover:bg-gray-200'}`} />
                    <span className="text-[10px] lg:text-sm font-bold uppercase tracking-widest block">{item.label}</span>
                </button>
            ))}
            
            <div className="mt-4 border-t border-border-light pt-8 flex flex-col gap-4">
                {user ? (
                    <>
                        <div className="text-[10px] uppercase font-bold text-gray-300 tracking-tighter block overflow-hidden text-ellipsis whitespace-nowrap text-right">
                            {user.displayName || user.phoneNumber}
                        </div>
                        {isAdmin && (
                            <button 
                                onClick={() => setIsAdminPanelOpen(true)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest text-right flex items-center justify-end gap-2"
                            >
                                <Lock className="w-3 h-3" />
                                لوحة الإدارة
                            </button>
                        )}
                        <button 
                            onClick={() => signOut(auth)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest text-right"
                        >
                            خروج
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest text-right"
                    >
                        دخول
                    </button>
                )}
            </div>
        </nav>

        <div className="mt-auto">
            <button 
                onClick={() => {
                    if (!user) {
                        setIsAuthModalOpen(true);
                    } else {
                        setCurrentPage('styles');
                    }
                }}
                className="w-14 h-14 lg:w-48 lg:h-auto bg-black text-white lg:py-5 flex items-center justify-center gap-3 lg:text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl"
            >
                <span className="hidden lg:inline">تصميم جديد</span>
                <Palette className="w-5 h-5" />
            </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 pr-20 lg:pr-64">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden"
            >
              {/* Left Content: Hero Section */}
              <div className="w-full lg:w-1/2 p-8 lg:p-24 flex flex-col justify-center bg-white relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8"
                >
                  <span className="bg-blue-50 text-blue-700 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] rounded-full inline-block">
                    مستشار التشطيب الذكي
                  </span>
                </motion.div>
                
                <motion.h1 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-6xl lg:text-9xl mb-8 font-light leading-[1.1] md:leading-[0.9]"
                >
                  اصنع عالمك بلمسة <br /><span className="font-bold">من Kemet</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-base md:text-lg lg:text-xl text-gray-500 mb-12 max-w-md font-light leading-relaxed"
                >
                  نحن هنا لنحول جدران منزلك إلى لوحة فنية. اختر خاماتك، ألوانك، وتفاصيل منزلك بكل سهولة وأناقة مع خبراءنا.
                </motion.p>
                
                <motion.button
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ x: -10 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStart}
                  className="bg-black text-white px-8 md:px-12 py-4 md:py-6 text-lg md:text-xl font-bold rounded-none flex items-center gap-4 md:gap-6 w-full md:w-max shadow-2xl justify-center"
                >
                  ابدأ اختيار تصميمك
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Right Content: Stylized Preview */}
              <div className="hidden lg:flex w-1/2 bg-brand-secondary p-12 flex-col justify-center items-center">
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="relative w-full max-w-lg aspect-square"
                >
                   <AnimatePresence mode="wait">
                     <motion.img 
                      key={heroImageIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      src={heroImages[heroImageIndex]} 
                      className="absolute inset-0 w-full h-full object-cover shadow-2xl"
                      alt="Architecture"
                    />
                   </AnimatePresence>
                  <div className="absolute -bottom-8 -right-8 bg-white p-8 shadow-2xl border-t-8 border-black max-w-xs z-10">
                      <p className="font-mono text-xs text-gray-400 mb-2">PRO / 0{heroImageIndex + 1}</p>
                      <p className="text-xl font-bold leading-snug">نحن نهتم بالتفاصيل التي لا يراها الآخرون.</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {currentPage === 'about' && (
            <motion.div 
              key="about"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen py-24 px-8 lg:px-24 max-w-7xl"
            >
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
                 <div className="lg:w-1/2">
                    <span className="text-blue-600 font-bold uppercase tracking-[0.4em] text-xs mb-6 lg:mb-8 block underline underline-offset-8">KEMET Identity</span>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 lg:mb-10 leading-tight">نحن KEMET <br/> مستقبل التشطيب</h2>
                    <div className="prose prose-lg md:prose-xl font-light text-gray-500 leading-relaxed mb-10 lg:mb-12">
                       <p>شركة KEMET هي شريكك الموثوق في رحلة تحويل مساحتك الخاصة إلى واقع ملموس. استوحينا اسمنا من "كيميت" (الأرض السوداء) لنعكس العراقة والأصالة في البناء والتشطيب.</p>
                       <p className="mt-4 md:mt-6">نحن نؤمن بالشفافية، الجودة، والابتكار. نوفر لك الأدوات اللازمة لتصميم بيتك بنفسك، مع توفير أفضل الخامات تحت إشراف نخبة من المهندسين.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 md:gap-8 py-6 md:py-8 border-t border-border-light">
                       <div>
                          <p className="text-3xl md:text-4xl font-bold mb-1 md:mb-2">1,200+</p>
                          <p className="text-[10px] md:text-sm text-gray-400 font-bold uppercase tracking-widest">عميل سعيد</p>
                       </div>
                       <div>
                          <p className="text-3xl md:text-4xl font-bold mb-1 md:mb-2">15</p>
                          <p className="text-[10px] md:text-sm text-gray-400 font-bold uppercase tracking-widest">جائزة تصميم</p>
                       </div>
                    </div>
                 </div>
                 <div className="lg:w-1/2 relative w-full">
                    <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
                       <img 
                          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200" 
                          alt="Our Workplace"
                          className="w-full h-full object-cover"
                       />
                    </div>
                    <div className="absolute -bottom-6 md:-bottom-10 -left-6 md:-left-10 bg-black text-white p-6 md:p-12 max-w-xs md:max-w-sm">
                       <p className="text-lg md:text-xl font-bold mb-2 md:mb-4 italic">رؤيتنا</p>
                       <p className="text-xs md:text-sm font-light leading-relaxed italic">"أن يصبح كل بيت في المنطقة العربية يعكس شخصية أصحابه من خلال حلول KEMET المبتكرة."</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {currentPage === 'styles' && (
            <motion.div 
              key="styles"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-7xl mx-auto px-6 py-24"
            >
              <div className="mb-12 md:mb-20">
                <span className="text-blue-600 font-bold uppercase tracking-[0.3em] text-xs mb-4 block">كتالوج الخيارات</span>
                <h2 className="text-3xl md:text-5xl lg:text-7xl mb-6 font-light">اختر <span className="font-bold">الستايل المفضل</span></h2>
                <div className="w-16 md:w-24 h-1 bg-black"></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4">
                {STYLES.map((style, idx) => (
                  <motion.div
                    key={style.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleSelectStyle(style.id)}
                    className="cursor-pointer group bg-white border border-border-light shadow-sm"
                  >
                    <div className="aspect-[4/5] overflow-hidden transition-all duration-700">
                      <img 
                        src={style.image} 
                        alt={style.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-8">
                      <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1 block">Style {idx+1}</span>
                      <h3 className="text-2xl font-bold mb-3">{style.name}</h3>
                      <p className="text-gray-400 font-light text-sm leading-relaxed">{style.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {currentPage === 'configurator' && (
            <motion.div 
              key="configurator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col lg:flex-row h-screen"
            >
              {/* Context Sidebar (Section specific) */}
              <div className="hidden lg:flex w-80 editorial-sidebar p-10 flex-col gap-6 overflow-y-auto">
                <div className="mb-12 border-b border-border-light pb-8">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-gray-400 block mb-2">التصنيف الحالي</span>
                  <p className="text-lg font-bold">{STYLES.find(s => s.id === selectedStyle)?.name}</p>
                </div>
                <div className="flex flex-col gap-4">
                  {CATEGORIES.map((cat, idx) => (
                    <button
                      key={cat.id}
                      onClick={() => setCurrentCategoryIndex(idx)}
                      className={`flex items-center gap-6 p-2 text-right transition-all group ${
                        currentCategoryIndex === idx 
                          ? 'text-brand-primary font-bold' 
                          : 'text-gray-400 font-light'
                      }`}
                    >
                      <div className={`w-8 h-8 flex items-center justify-center font-mono text-[10px] border transition-colors ${
                         currentCategoryIndex === idx ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-400 border-gray-100'
                      }`}>
                          {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </div>
                      <span className="flex-1 group-hover:text-black transition-colors">{cat.name}</span>
                      {selections[cat.id] && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-8 lg:p-16 overflow-y-auto bg-white">
                <motion.div
                  key={currentCategoryIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-6xl mx-auto"
                >
                  <div className="mb-12 lg:mb-16">
                    <span className="bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6 inline-block">
                      KEMET Selection
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-7xl font-light leading-tight mb-4">اختيار <span className="font-bold">{CATEGORIES[currentCategoryIndex].name}</span></h2>
                    <p className="text-gray-400 text-sm md:text-lg lg:text-xl font-light italic">تفاصيل تعكس فخامة اختيارك لنمط {STYLES.find(s => s.id === selectedStyle)?.name}</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {CATEGORIES[currentCategoryIndex].options.map((option) => (
                      <motion.div
                        key={option.id}
                        onClick={() => handleOptionSelect(CATEGORIES[currentCategoryIndex].id, option.id)}
                        className={`group cursor-pointer bg-white transition-all duration-500 relative border-t-4 ${
                          selections[CATEGORIES[currentCategoryIndex].id] === option.id 
                            ? 'border-black shadow-xl' 
                            : 'border-transparent'
                        }`}
                      >
                        <div className="aspect-[3/4] relative overflow-hidden bg-gray-50">
                          <img 
                            src={option.image} 
                            alt={option.name} 
                            className="w-full h-full object-cover transition-all duration-700"
                            referrerPolicy="no-referrer"
                          />
                           {option.color && (
                            <div 
                              className="absolute top-6 left-6 w-10 h-10 border-2 border-white shadow-xl flex items-center justify-center font-bold text-[10px] overflow-hidden"
                              style={{ backgroundColor: option.color }}
                            >
                               <div className="w-1 h-full bg-white/20 rotate-45"></div>
                            </div>
                          )}
                        </div>
                        <div className="py-6 flex justify-between items-center bg-white border-x border-b border-border-light px-6">
                          <div>
                              <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">KEMET Choice</p>
                              <span className="text-2xl font-bold">{option.name}</span>
                          </div>
                          {selections[CATEGORIES[currentCategoryIndex].id] === option.id && <CheckCircle2 className="w-6 h-6 text-black" />}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-20 flex justify-between items-center border-t border-border-light pt-12 mb-12">
                    <button 
                      disabled={currentCategoryIndex === 0}
                      onClick={() => setCurrentCategoryIndex(prev => prev - 1)}
                      className="group flex items-center gap-4 text-gray-400 hover:text-black transition-colors disabled:opacity-20"
                    >
                      <ChevronRight className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                      <span className="text-xs font-bold uppercase tracking-[0.3em]">القسم السابق</span>
                    </button>
                    
                    <div className="flex gap-4">
                        {CATEGORIES.map((_, i) => (
                            <div key={i} className={`h-[2px] transition-all duration-500 ${i === currentCategoryIndex ? 'w-12 bg-black' : 'w-6 bg-gray-100'}`} />
                        ))}
                    </div>

                    <button 
                      disabled={!selections[CATEGORIES[currentCategoryIndex].id]}
                      onClick={() => {
                          if (currentCategoryIndex < CATEGORIES.length - 1) {
                               setCurrentCategoryIndex(prev => prev + 1);
                          } else {
                              setCurrentPage('summary');
                          }
                      }}
                      className="group flex items-center gap-4 text-black font-black disabled:opacity-20"
                    >
                      <span className="text-xs font-bold uppercase tracking-[0.3em]">القسم التالي</span>
                      <ChevronLeft className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {currentPage === 'mydesign' && (
            <motion.div 
              key="mydesign"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen py-24 px-8 lg:px-24 max-w-7xl"
            >
              <div className="mb-12 md:mb-16">
                 <span className="text-blue-600 font-bold uppercase tracking-[0.4em] text-xs mb-4 block underline underline-offset-8">My Creations</span>
                 <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">تصميمي الخاص</h2>
                 <p className="text-gray-400 text-sm md:text-xl font-light italic">هذا هو اختيارك الذي تم حفظه لنمط {STYLES.find(s => s.id === selections.style)?.name || '---'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {CATEGORIES.map((cat, idx) => {
                  const selectionId = selections[cat.id];
                  const option = cat.options.find(o => o.id === selectionId);
                  
                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group bg-white border border-gray-100 shadow-sm relative overflow-hidden flex flex-col"
                    >
                      <div className="aspect-[3/2] overflow-hidden bg-gray-50">
                        {option ? (
                          <img 
                            src={option.image} 
                            alt={option.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold italic">
                            لم يتم الاختيار بعد
                          </div>
                        )}
                      </div>
                      <div className="p-8 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{cat.name}</span>
                           <span className="text-[10px] font-mono text-gray-300">#0{idx + 1}</span>
                        </div>
                        <h3 className="text-2xl font-bold">{option?.name || 'قيد الانتظار'}</h3>
                      </div>
                      {option && (
                        <div className="absolute top-4 right-4 bg-black text-white p-2 rounded-full shadow-xl">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-20 flex flex-col md:flex-row gap-6">
                <button 
                  onClick={() => setCurrentPage('styles')}
                  className="flex-1 bg-black text-white py-6 font-bold tracking-[0.2em] uppercase text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-4"
                >
                  بدء تصميم جديد
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 border-2 border-black py-6 font-bold tracking-[0.2em] uppercase text-sm hover:bg-black hover:text-white transition-all"
                >
                  طباعة التصميم
                </button>
              </div>
            </motion.div>
          )}

          {currentPage === 'summary' && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-h-screen flex items-center justify-center p-8 bg-brand-secondary/50 pt-16"
            >
              <div className="bg-white max-w-5xl w-full p-12 lg:p-24 shadow-2xl relative border-t-8 border-black">
                  <div className="flex flex-col lg:flex-row justify-between items-start mb-12 md:mb-20 gap-8">
                    <div>
                      <span className="text-blue-600 font-bold uppercase tracking-[0.4em] text-xs mb-4 block underline underline-offset-8">Final Selection</span>
                      <h2 className="text-4xl md:text-6xl font-black mb-4">ملخص تشطيبك</h2>
                      <p className="text-gray-400 text-sm md:text-xl font-light italic">قائمة اختياراتك بناءً على طراز {STYLES.find(s => s.id === selectedStyle)?.name}</p>
                    </div>
                    <div className="bg-gray-50 p-8 border border-border-light text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">KEMET Ticket</p>
                        <p className="font-mono text-xl tracking-tighter">#KEMET-2024</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                      {CATEGORIES.map((cat, idx) => (
                          <div key={cat.id} className="p-8 border border-border-light flex flex-col gap-4 bg-white hover:bg-gray-50 transition-colors">
                              <div className="w-10 h-10 border border-black flex items-center justify-center font-mono text-xs">
                                  {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                              </div>
                              <div>
                                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">{cat.name}</p>
                                  <p className="text-xl font-bold">{cat.options.find(o => o.id === selections[cat.id])?.name || 'لم يتم الاختيار'}</p>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                      <button className="flex-1 bg-black text-white py-6 font-bold tracking-[0.2em] uppercase text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-4">
                          تحميل ملف التصميم
                          <ArrowRight className="w-5 h-5 rotate-180" />
                      </button>
                      <button onClick={() => setCurrentPage('styles')} className="flex-1 border-2 border-black py-6 font-bold tracking-[0.2em] uppercase text-sm hover:bg-black hover:text-white transition-all">
                          تعديل الاختيارات
                      </button>
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {isAdmin && isAdminPanelOpen && <AdminPanel onClose={() => setIsAdminPanelOpen(false)} />}
    </div>
  );
}

