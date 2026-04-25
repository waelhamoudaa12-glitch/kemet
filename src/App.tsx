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
import { Category, Option } from './types';
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
  [categoryId: string]: string | string[];
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
  const [selections, setSelections] = useState<Record<string, string | string[]>>({});
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
        if (u.email === '0101234567123@kemet.app' || u.email === 'waelhamoudaa12@gmail.com') {
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
  const saveSelection = async (newSelections: any, isFinal = false) => {
    if (user) {
      try {
        // Save to user profile for persistence
        await setDoc(doc(db, 'users', user.uid), {
          selections: newSelections,
          lastUpdated: serverTimestamp()
        }, { merge: true });

        // If it's a final design submission, save to 'designs' collection for admin focus
        if (isFinal) {
          const designId = `${user.uid}_${Date.now()}`;
          await setDoc(doc(db, 'designs', designId), {
            userId: user.uid,
            userName: user.displayName || user.phoneNumber,
            userPhone: user.phoneNumber,
            style: newSelections.style,
            selections: newSelections,
            createdAt: serverTimestamp()
          });
        }
      } catch (err: any) {
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
    const newSelections = { style: styleId };
    setSelections(newSelections);
    saveSelection(newSelections);
    setCurrentCategoryIndex(0);
    setCurrentPage('configurator');
  };

  const handleOptionSelect = (catId: string, optionId: string) => {
    const currentSelections = selections[catId] as string[] || [];
    let newCategorySelections: string[];

    if (currentSelections.includes(optionId)) {
      newCategorySelections = currentSelections.filter(id => id !== optionId);
    } else {
      newCategorySelections = [...currentSelections, optionId];
    }

    const newSelections = { ...selections, [catId]: newCategorySelections };
    setSelections(newSelections);
    saveSelection(newSelections);
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
    { id: 'contact', label: 'اتصل بنا' },
    ...(user ? [{ id: 'mydesign', label: 'تصميمي' }] : []),
  ];

  return (
    <div className="min-h-screen bg-egypt-black font-sans text-gold-100 flex flex-col">
      {/* Top Navigation Header */}
      <motion.header 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        className="fixed top-0 left-0 right-0 h-20 md:h-24 bg-egypt-dark/80 backdrop-blur-xl border-b border-gold-500/10 z-50 flex items-center justify-between px-4 md:px-12 shadow-2xl"
      >
        <div className="flex items-center cursor-pointer shrink-0 group" onClick={() => setCurrentPage('home')}>
           <div className="flex flex-col items-center">
             <h1 className="text-2xl md:text-3xl font-black tracking-[0.3em] text-white group-hover:text-gold-500 transition-colors uppercase">KEMET</h1>
             <div className="w-full h-px bg-gold-500/30 scale-x-50 group-hover:scale-x-100 transition-transform"></div>
           </div>
        </div>

        <div className="flex items-center gap-1 md:gap-4 flex-1 justify-end overflow-hidden">
          <nav className="flex items-center gap-2 md:gap-4 lg:gap-6 mx-1 md:mx-4 overflow-x-auto no-scrollbar py-2">
              {navItems.map(item => (
                  <button 
                      key={item.id}
                      onClick={() => {
                          if (item.id === 'home' || item.id === 'about') {
                              setCurrentPage(item.id as AppState);
                          } else if (item.id === 'contact') {
                              window.open('https://wa.me/201554853093', '_blank');
                          } else if (item.id === 'mydesign') {
                               if (!user) {
                                setIsAuthModalOpen(true);
                                return;
                              }
                              setCurrentPage(item.id as AppState);
                          }
                      }}
                      className={`flex items-center gap-1 group transition-all relative py-1 shrink-0 ${
                          currentPage === item.id ? 'text-gold-500' : 'text-white hover:text-gold-500'
                      }`}
                  >
                      <span className="text-[9px] md:text-xs font-black uppercase tracking-[0.15em] block whitespace-nowrap">{item.label}</span>
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 transition-all ${currentPage === item.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100'}`} />
                  </button>
              ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-4 shrink-0">
              <button 
                onClick={() => setCurrentPage('styles')}
                className={`bg-gold-500 text-egypt-black px-2 md:px-6 py-1.5 md:py-3 rounded-full hover:bg-gold-600 transition-all shadow-lg active:scale-95 shrink-0 flex items-center gap-2 ${currentPage === 'styles' ? 'ring-4 ring-gold-500/20' : ''}`}
              >
                <span className="text-[8px] md:text-sm font-black uppercase tracking-tight whitespace-nowrap">ابدأ التصميم</span>
              </button>

              <div className="h-6 w-px bg-gold-500/10 mx-0.5 hidden sm:block"></div>

              {user ? (
                  <div className="flex items-center gap-1 md:gap-4 shrink-0">
                      <div className="hidden lg:block text-[9px] uppercase font-bold text-gold-200/50 tracking-tighter text-right max-w-[70px] truncate">
                          {user.displayName || user.phoneNumber}
                      </div>
                      {isAdmin && (
                          <button 
                              onClick={() => setIsAdminPanelOpen(true)}
                              className="text-[10px] md:text-sm font-bold text-gold-500 hover:text-gold-600 border border-gold-500/20 p-2 md:px-4 md:py-2 rounded-full bg-gold-500/5 flex items-center transition-all"
                          >
                              <Lock className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                              <span className="hidden md:inline">إدارة</span>
                          </button>
                      )}
                      <button 
                          onClick={() => signOut(auth)}
                          className="text-[10px] md:text-sm font-bold text-red-500 hover:text-red-700 border border-red-100 p-2 md:px-4 md:py-2 rounded-full bg-red-50/50 transition-all"
                      >
                          <span className="md:hidden">X</span>
                          <span className="hidden md:inline">خروج</span>
                      </button>
                  </div>
              ) : (
                  <button 
                      onClick={() => setIsAuthModalOpen(true)}
                      className="text-[10px] md:text-sm font-bold text-gold-500 hover:text-gold-600 border border-gold-500/20 px-4 md:px-6 py-2 md:py-2.5 rounded-full hover:bg-gold-500/5 transition-all"
                  >
                      دخول
                  </button>
              )}
          </div>
        </div>
      </motion.header>


      {/* Main Content Area */}
      <main className="flex-1 pt-20 md:pt-24">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative min-h-screen flex flex-col lg:flex-row overflow-hidden pharaonic-pattern"
            >
              {/* Left Content: Hero Section */}
              <div className="w-full lg:w-1/2 p-8 lg:p-24 flex flex-col justify-center bg-egypt-black/40 backdrop-blur-sm relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8"
                >
                  <span className="bg-gold-500/10 text-gold-500 border border-gold-500/30 px-6 py-2.5 text-xs font-black uppercase tracking-[0.3em] rounded-full inline-block shadow-glow">
                    مستشار التشطيب الملكي الذكي
                  </span>
                </motion.div>
                
                <motion.h1 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-6xl md:text-8xl lg:text-9xl mb-8 font-black leading-[1.1] md:leading-[0.9] text-white"
                >
                  اصنع عالمك <br /><span className="gold-gradient italic">بلمسة كيميت</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-base md:text-xl lg:text-2xl text-gold-200/50 mb-12 max-w-md font-medium leading-relaxed"
                >
                  نحن هنا لنحول جدران منزلك إلى لوحة فنية ملكية. اختر خاماتك وتفاصيلك بفخامة الفراعنة وعراقة كيميت.
                </motion.p>
                
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                  <motion.button
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStart}
                    className="bg-gold-500 text-egypt-black px-12 md:px-16 py-5 md:py-7 text-xl font-black rounded-2xl flex items-center justify-center gap-6 shadow-[0_10px_40px_rgba(212,175,55,0.4)]"
                  >
                    ابدأ رحلتك الملكية
                    <ArrowRight className="w-6 h-6" />
                  </motion.button>

                  <motion.button
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.open('https://wa.me/201554853093', '_blank')}
                    className="bg-egypt-dark text-gold-500 border-2 border-gold-500/30 px-12 md:px-16 py-5 md:py-7 text-xl font-black rounded-2xl flex items-center justify-center shadow-xl hover:bg-gold-500/5 transition-all"
                  >
                    اتصل بنا
                  </motion.button>
                </div>
              </div>

              {/* Right Content: Stylized Preview */}
              <div className="hidden lg:flex w-1/2 bg-egypt-dark p-12 flex-col justify-center items-center relative">
                <div className="absolute top-0 right-0 w-full h-full pharaonic-pattern opacity-20" />
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="relative w-full max-w-lg aspect-[3/4]"
                >
                   <AnimatePresence mode="wait">
                     <motion.img 
                      key={heroImageIndex}
                      initial={{ opacity: 0, scale: 1.2 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      src={heroImages[heroImageIndex]} 
                      className="absolute inset-0 w-full h-full object-cover shadow-[0_0_80px_rgba(212,175,55,0.1)] border-8 border-gold-500/10 rounded-[3rem]"
                      alt="Architecture"
                    />
                   </AnimatePresence>
                  <div className="absolute -bottom-8 -right-8 bg-gold-500 p-10 shadow-3xl max-w-xs z-10 rounded-[2rem] border-4 border-egypt-black">
                      <p className="font-mono text-[10px] text-egypt-black font-black mb-2 tracking-[0.4em]">KEMET / 0{heroImageIndex + 1}</p>
                      <p className="text-2xl font-black leading-none text-egypt-black tracking-tighter italic">نحن نهتم بالتفاصيل التي لا يراها الآخرون.</p>
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
              className="min-h-screen py-24 px-8 lg:px-24 max-w-7xl mx-auto"
            >
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
                 <div className="lg:w-1/2 text-right">
                    <span className="text-gold-500 font-bold uppercase tracking-[0.4em] text-xs mb-6 lg:mb-8 block underline underline-offset-8">KEMET Identity</span>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 lg:mb-10 leading-tight text-white">نحن <span className="gold-gradient">KEMET</span> <br/> مستقبل التشطيب</h2>
                    <div className="prose prose-lg md:prose-xl font-medium text-gold-200/50 leading-relaxed mb-10 lg:mb-12">
                       <p>شركة KEMET هي شريكك الموثوق في رحلة تحويل مساحتك الخاصة إلى واقع ملموس. استوحينا اسمنا من "كيميت" (الأرض السوداء) لنعكس العراقة والأصالة في البناء والتشطيب.</p>
                       <p className="mt-4 md:mt-6">نحن نؤمن بالشفافية، الجودة، والابتكار. نوفر لك الأدوات اللازمة لتصميم بيتك بنفسك، مع توفير أفضل الخامات تحت إشراف نخبة من المهندسين.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 md:gap-8 py-6 md:py-8 border-t border-gold-500/10">
                       <div>
                          <p className="text-3xl md:text-4xl font-black mb-1 md:mb-2 text-gold-500">1,200+</p>
                          <p className="text-[10px] md:text-sm text-gold-200/30 font-bold uppercase tracking-widest">عميل سعيد</p>
                       </div>
                       <div>
                          <p className="text-3xl md:text-4xl font-black mb-1 md:mb-2 text-gold-500">15</p>
                          <p className="text-[10px] md:text-sm text-gold-200/30 font-bold uppercase tracking-widest">جائزة تصميم</p>
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
              className="max-w-7xl mx-auto px-6 py-12 lg:py-24"
            >
              <div className="mb-12 lg:mb-20">
                <motion.span 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gold-500 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4 block"
                >
                  الخطوة الأولى: اختيار النمط الملكي
                </motion.span>
                <h2 className="text-4xl md:text-6xl lg:text-8xl mb-8 font-black tracking-tighter leading-none text-white">
                  اختر <span className="gold-gradient">طرازك المفضل</span>
                </h2>
                <div className="w-24 h-2 bg-gold-500 shadow-glow"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                {STYLES.map((style, idx) => (
                  <motion.div
                    key={style.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleSelectStyle(style.id)}
                    className="cursor-pointer group flex flex-row items-stretch bg-egypt-dark border border-gold-500/10 rounded-[2.5rem] overflow-hidden hover:border-gold-500/40 transition-all duration-500 hover:-translate-y-2 shadow-2xl"
                  >
                    <div className="w-2/5 shrink-0 overflow-hidden relative">
                      <img 
                        src={style.image} 
                        alt={style.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gold-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-4">
                        <div className="bg-gold-500 text-egypt-black p-4 rounded-full shadow-2xl">
                          <ArrowRight className="w-6 h-6 -rotate-45" />
                        </div>
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl md:text-3xl font-black text-white">{style.name}</h3>
                        <span className="text-[10px] font-mono text-gold-500/30 font-black tracking-widest uppercase">KEMET 0{idx+1}</span>
                      </div>
                      <p className="text-gold-200/50 font-medium text-sm md:text-base leading-relaxed">
                        {style.description}
                      </p>
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
              className="flex flex-col h-screen overflow-hidden"
            >
              {/* Top Navigation for Mobile/Tablet */}
              <div className="lg:hidden bg-white border-b border-gray-100 px-6 py-4 flex gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                {CATEGORIES.map((cat, idx) => (
                  <button
                    key={cat.id}
                    onClick={() => setCurrentCategoryIndex(idx)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      currentCategoryIndex === idx 
                        ? 'bg-black text-white shadow-lg' 
                        : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    saveSelection(selections, true);
                    setCurrentPage('summary');
                  }}
                  className="px-6 py-2 rounded-full text-xs font-black bg-gold-500 text-egypt-black shadow-lg animate-pulse mr-2"
                >
                  لقد انتهيت
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Desktop Category Sidebar */}
                <div className="hidden lg:flex w-80 bg-egypt-dark border-l border-gold-500/10 p-10 flex-col gap-8 overflow-y-auto">
                  <div className="mb-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-500 block mb-3">النمط المختار</span>
                    <h3 className="text-2xl font-black text-white">{STYLES.find(s => s.id === selectedStyle)?.name}</h3>
                  </div>
                  
                  <nav className="space-y-4">
                    {CATEGORIES.map((cat, idx) => (
                      <button
                        key={cat.id}
                        onClick={() => setCurrentCategoryIndex(idx)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                          currentCategoryIndex === idx 
                            ? 'bg-gold-500/10 border border-gold-500/20 text-gold-500 font-black shadow-inner shadow-gold-500/5' 
                            : 'text-gold-200/30 hover:text-gold-500 hover:bg-gold-500/5'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          currentCategoryIndex === idx ? 'bg-gold-500 text-egypt-black shadow-glow' : 'bg-egypt-black text-gold-500/40'
                        }`}>
                          <cat.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-[10px] uppercase tracking-widest font-black mb-0.5 opacity-40">القسم {idx + 1}</p>
                          <p className="text-sm font-bold">{cat.name}</p>
                        </div>
                        {Array.isArray(selections[cat.id]) && (selections[cat.id] as string[]).length > 0 && (
                          <div className="bg-gold-500 text-egypt-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                            {(selections[cat.id] as string[]).length}
                          </div>
                        )}
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        saveSelection(selections, true);
                        setCurrentPage('summary');
                      }}
                      className="w-full flex items-center gap-4 p-6 rounded-2xl transition-all bg-gold-500 text-egypt-black shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:scale-105 mt-8 border border-white/20 group"
                    >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-egypt-black text-gold-500 group-hover:rotate-12 transition-transform shadow-lg">
                          <Palette className="w-6 h-6" />
                        </div>
                      <div className="flex-1 text-right">
                        <p className="text-[10px] uppercase tracking-widest font-black text-egypt-black/60 mb-0.5">الخطوة النهائية</p>
                        <p className="text-lg font-black tracking-tight">لقد انتهيت</p>
                      </div>
                    </button>
                  </nav>

                  <div className="mt-auto p-6 bg-gold-500/5 rounded-3xl border border-gold-500/10">
                    <p className="text-gold-500 text-[10px] font-black leading-relaxed uppercase tracking-widest">
                       نحن نوفر أفضل الخامات والضمانات الملكية لكل اختيار تقوم به.
                    </p>
                  </div>
                </div>

                {/* Main Configurator Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 bg-egypt-black pharaonic-pattern">
                  <motion.div
                    key={currentCategoryIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto text-right"
                  >
                    <header className="mb-12 lg:mb-16">
                      <div className="flex items-center justify-end gap-2 text-gold-500 mb-4">
                        <span className="text-xs font-black uppercase tracking-[0.3em]">
                          {CATEGORIES[currentCategoryIndex].name}
                        </span>
                        {(() => {
                           const Icon = CATEGORIES[currentCategoryIndex].icon;
                           return <Icon className="w-5 h-5" />;
                        })()}
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-white">
                        اختر <span className="gold-gradient">{CATEGORIES[currentCategoryIndex].name}</span>
                      </h2>
                      <p className="text-gold-200/50 text-sm md:text-lg max-w-2xl ml-auto leading-relaxed font-medium">
                        اختر ما يناسب ذوقك وتطلعاتك الملكية، نحن نضمن لك الجودة والجمال في كل قطعة تحت اسم كيميت.
                      </p>
                    </header>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {CATEGORIES[currentCategoryIndex].options.map((option) => (
                        <motion.button
                          key={option.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOptionSelect(CATEGORIES[currentCategoryIndex].id, option.id)}
                          className={`group relative text-right flex flex-col items-stretch rounded-[2rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-500 border-2 ${
                            Array.isArray(selections[CATEGORIES[currentCategoryIndex].id]) && (selections[CATEGORIES[currentCategoryIndex].id] as string[]).includes(option.id)
                              ? 'border-gold-500 bg-gold-500/10 shadow-[0_0_40px_rgba(212,175,55,0.2)] scale-[1.02]' 
                              : 'border-gold-500/5 bg-egypt-dark hover:border-gold-500/20'
                          }`}
                        >
                          <div className="aspect-square relative overflow-hidden">
                            <img 
                              src={option.image} 
                              alt={option.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                              referrerPolicy="no-referrer"
                            />
                            {Array.isArray(selections[CATEGORIES[currentCategoryIndex].id]) && (selections[CATEGORIES[currentCategoryIndex].id] as string[]).includes(option.id) && (
                              <div className="absolute inset-0 bg-gold-500/20 backdrop-blur-[2px] flex items-center justify-center">
                                 <div className="bg-gold-500 text-egypt-black p-2 rounded-full shadow-2xl scale-125">
                                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-3 md:p-5 flex flex-col justify-center flex-1">
                            <p className="text-[8px] md:text-[10px] font-black text-gold-500 uppercase tracking-widest mb-0.5 opacity-60">KEMET ROYAL</p>
                            <h4 className="text-sm md:text-lg font-black leading-tight text-white truncate">{option.name}</h4>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <footer className="mt-24 pb-12 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-gray-100 pt-12">
                      <button 
                        disabled={currentCategoryIndex === 0}
                        onClick={() => setCurrentCategoryIndex(prev => prev - 1)}
                        className="flex items-center gap-4 text-gray-400 hover:text-black transition-all disabled:opacity-30 px-6 py-3 rounded-2xl hover:bg-gray-50"
                      >
                        <ChevronRight className="w-6 h-6" />
                        <span className="text-xs font-bold uppercase tracking-widest">تراجع</span>
                      </button>
                      
                      <div className="flex gap-3">
                        {CATEGORIES.map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              i === currentCategoryIndex ? 'w-12 bg-blue-600' : 'w-3 bg-gray-100'
                            }`} 
                          />
                        ))}
                      </div>

                      <button 
                        onClick={() => {
                          if (currentCategoryIndex < CATEGORIES.length - 1) {
                            setCurrentCategoryIndex(prev => prev + 1);
                          } else {
                            saveSelection(selections, true);
                            setCurrentPage('summary');
                          }
                        }}
                        className="group flex items-center gap-6 bg-black text-white px-10 py-5 rounded-2xl font-black transition-all shadow-xl hover:bg-gray-800"
                      >
                        <span className="text-xs uppercase tracking-widest text-right">
                          {(!Array.isArray(selections[CATEGORIES[currentCategoryIndex].id]) || (selections[CATEGORIES[currentCategoryIndex].id] as string[]).length === 0)
                            ? 'تخطي القسم' 
                            : (currentCategoryIndex < CATEGORIES.length - 1 ? 'القسم التالي' : 'عرض الملخص')}
                        </span>
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                      </button>
                    </footer>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {currentPage === 'mydesign' && (
            <motion.div 
              key="mydesign"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen py-24 px-8 lg:px-24 max-w-7xl mx-auto"
            >
              <div className="mb-16 md:mb-24">
                 <span className="text-gold-500 font-bold uppercase tracking-[0.4em] text-xs mb-4 block underline underline-offset-8 decoration-2">Personal Selection</span>
                 <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] text-white">تصميمي <br/><span className="gold-gradient">الخاص</span></h2>
                 <p className="text-gray-400 text-sm md:text-xl font-medium max-w-2xl leading-relaxed italic">
                    هذا هو ذوقك الذي يعبر عنك بناءً على طراز {STYLES.find(s => s.id === selections.style)?.name || 'الذي لم يتم تحديده بعد'}. يمكنك استعراض اختياراتك أو البدء من جديد.
                 </p>
              </div>

              {Object.keys(selections).length === 0 ? (
                <div className="bg-gray-50 rounded-[3rem] p-12 md:p-24 text-center border-2 border-dashed border-gray-200">
                   <Palette className="w-16 h-16 mx-auto mb-8 text-gray-300" />
                   <h3 className="text-3xl font-black mb-4">لا توجد اختيارات بعد</h3>
                   <p className="text-gray-500 mb-8 max-w-sm mx-auto">ابدأ رحلة تصميم منزلك الآن واختر أفضل الخامات والموديلات.</p>
                   <button 
                    onClick={() => setCurrentPage('styles')}
                    className="bg-black text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl"
                   >
                     ابدأ التصميم الآن
                   </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {CATEGORIES.map((cat: Category, idx) => {
                      const selectionIds = selections[cat.id] as string[] || [];
                      const selectedOptions = cat.options.filter(o => selectionIds.includes(o.id));
                      
                      return (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden flex flex-col"
                        >
                          <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                             <div className="flex items-center gap-2">
                                <cat.icon className="w-5 h-5 text-gold-500" />
                                <span className="text-sm text-gold-500 font-black uppercase tracking-widest">{cat.name}</span>
                             </div>
                             <span className="bg-gold-500 text-egypt-black text-[10px] px-2 py-1 rounded-full font-bold">
                               {selectedOptions.length} اختيارات
                             </span>
                          </div>

                          <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedOptions.length > 0 ? (
                              selectedOptions.map(option => (
                                <div key={option.id} className="relative group/opt aspect-square rounded-2xl overflow-hidden border border-gray-100">
                                  <img 
                                    src={option.image} 
                                    alt={option.name}
                                    className="w-full h-full object-cover group-hover/opt:scale-110 transition-transform"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-black/40 flex items-end p-3 opacity-0 group-hover/opt:opacity-100 transition-opacity">
                                    <p className="text-[10px] text-white font-bold leading-tight">{option.name}</p>
                                  </div>
                                  {option.color && (
                                    <div 
                                      className="absolute top-2 left-2 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                      style={{ backgroundColor: option.color }}
                                    />
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="col-span-full py-8 text-center text-gray-300">
                                <p className="text-xs font-bold uppercase tracking-widest">لم يتم اختيار أي عنصر</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-24 bg-egypt-dark rounded-[3rem] p-12 md:p-20 text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden border border-gold-500/20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    
                    <div className="relative z-10 text-center md:text-right">
                       <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">هل أعجبك <span className="gold-gradient">تصميمك الملكي؟</span></h3>
                       <p className="text-gold-200/50 max-w-md font-medium text-lg leading-relaxed">إذا كنت تريد أن ترى تصميمك في بيتك، يرجى أن ترسل لهذا الرقم على الواتساب 01554853093</p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row gap-6 w-full md:w-auto">
                      <button 
                        onClick={() => window.open('https://wa.me/201554853093', '_blank')}
                        className="bg-gold-500 text-egypt-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                      >
                        WhatsApp
                      </button>
                      <button 
                         onClick={() => setCurrentPage('styles')}
                         className="bg-egypt-black text-gold-500 border border-gold-500/30 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gold-500/5 transition-all"
                      >
                        New Design
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {currentPage === 'summary' && (
            <motion.div 
              key="summary"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-h-screen py-16 px-6 lg:px-20 bg-gray-50/50 overflow-y-auto"
            >
              <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 mb-12">
                  <div className="flex flex-col lg:flex-row">
                    {/* Left Side: Receipt Details */}
                    <div className="flex-1 p-8 md:p-16 flex flex-col">
                      <div className="flex justify-between items-start mb-12">
                        <div>
                          <span className="text-gold-500 font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4 block underline underline-offset-8 decoration-2">KEMET Final Ticket</span>
                          <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-white">ملخص <br/><span className="gold-gradient">اختياراتك</span></h2>
                        </div>
                        <div className="text-left hidden sm:block">
                           <div className="w-16 h-16 border-4 border-black flex items-center justify-center font-black text-2xl mb-2">K</div>
                           <p className="text-[10px] font-mono text-gray-300 font-bold">VERIFIED DESIGN</p>
                        </div>
                      </div>

                      <div className="space-y-6 flex-1">
                        {CATEGORIES.map((cat, idx) => {
                          const selectionIds = selections[cat.id] as string[] || [];
                          const selectedOptions = cat.options.filter(o => selectionIds.includes(o.id));
                          
                          return (
                            <div key={cat.id} className="flex justify-between items-start py-4 border-b border-gray-50 group hover:px-2 transition-all">
                               <div className="flex items-start gap-4">
                                  <div className="w-8 h-8 rounded-lg bg-gold-500/5 flex items-center justify-center text-gold-200/30 group-hover:bg-gold-500/10 group-hover:text-gold-500 transition-colors mt-1">
                                     <cat.icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-2">{cat.name}</p>
                                     <div className="flex flex-wrap gap-2">
                                       {selectedOptions.length > 0 ? (
                                         selectedOptions.map(opt => (
                                           <span key={opt.id} className="bg-gray-50 px-3 py-1 rounded-full text-xs font-bold border border-gray-100">
                                              {opt.name}
                                           </span>
                                         ))
                                       ) : (
                                         <span className="text-gray-300 text-xs italic">لا توجد اختيارات</span>
                                       )}
                                     </div>
                                  </div>
                               </div>
                               <span className="text-[10px] font-mono text-gray-200">#{idx + 1}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-12 pt-12 border-t-2 border-dashed border-gray-100 flex flex-col sm:flex-row gap-6">
                        <button 
                          onClick={() => window.open('https://wa.me/201554853093', '_blank')}
                          className="flex-1 bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all flex items-center justify-center gap-4 shadow-xl"
                        >
                          تواصل عبر الواتساب
                          <ArrowRight className="w-5 h-5 opacity-50" />
                        </button>
                        <button 
                          onClick={() => setCurrentCategoryIndex(0) || setCurrentPage('configurator')}
                          className="flex-1 border-2 border-gray-100 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:border-black transition-all"
                        >
                          تعديل الاختيارات
                        </button>
                      </div>
                    </div>

                    {/* Right Side: Visual Confirmation */}
                    <div className="w-full lg:w-[45%] bg-gold-500 relative overflow-hidden flex flex-col p-8 md:p-16 text-egypt-black min-h-[400px]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
                        
                        <div className="relative z-10 flex-1 flex flex-col justify-center text-center">
                          {/* Check icon removed */}
                          <h3 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">جاهز للتنفيذ!</h3>
                          <p className="text-egypt-black/60 font-medium mb-12 max-w-sm mx-auto leading-relaxed">
                            لقد قمت باختيار أفضل الخامات بناءً على نمط <br/>
                            <span className="text-white font-black text-2xl">{STYLES.find(s => s.id === selectedStyle)?.name}</span>
                          </p>
                          
                          <div className="bg-white/10 backdrop-blur-md rounded-[2.5rem] p-4 p-8 border border-white/20 mt-auto">
                             <div className="w-full aspect-video rounded-2xl overflow-hidden mb-6 shadow-2xl">
                                <img 
                                  src={STYLES.find(s => s.id === selectedStyle)?.image} 
                                  className="w-full h-full object-cover"
                                  alt="Style"
                                />
                             </div>
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1">DESIGN CODE</p>
                             <p className="font-mono text-2xl font-black tracking-tighter">KE-OPT-{selectedStyle?.toUpperCase()}</p>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center flex-wrap gap-12 py-12 opacity-30 grayscale contrast-125">
                   {CATEGORIES.slice(0, 4).map(cat => <cat.icon key={cat.id} className="w-12 h-12" />)}
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

