/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import Lenis from 'lenis';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';
import { subscribeToStyles, subscribeToCategories, subscribeToPortfolio, syncInitialData } from './lib/contentService';
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
  ArrowLeft,
  Maximize2,
  Edit3,
  UserCircle,
  Menu,
  X
} from 'lucide-react';

import { VisitorsDashboard } from './components/VisitorsDashboard';

// --- Types ---

type AppState = 'home' | 'styles' | 'style_preview' | 'configurator' | 'summary' | 'about' | 'portfolio' | 'mydesign' | 'visitors';

const SPRING_TRANSITION = { type: 'spring', stiffness: 300, damping: 30 };

const ICON_MAP: Record<string, any> = {
  walls: Palette,
  floors: Layout,
  ceilings: Maximize2,
  doors: DoorOpen,
  lighting: Lamp,
  bathrooms: Bath,
  kitchen: Utensils
};

const SmoothImage = ({ src, alt, className, referrerPolicy }: { src: string; alt: string; className?: string; referrerPolicy?: React.HTMLAttributeReferrerPolicy }) => {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-cover`}
                referrerPolicy={referrerPolicy}
            />
        </div>
    );
};

interface Selection {
  style: string;
  [categoryId: string]: string | string[];
}

// --- Components ---

export default function App() {
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<AppState>('home');
  const [pageHistory, setPageHistory] = useState<AppState[]>([]);

  const navigateTo = (page: AppState) => {
    if (page === currentPage) return;
    setPageHistory(prev => [...prev, currentPage]);
    setCurrentPage(page);
  };

  const goBack = () => {
    setPageHistory(prev => {
      const newHistory = [...prev];
      const previousPage = newHistory.pop();
      if (previousPage) {
        setCurrentPage(previousPage);
      }
      return newHistory;
    });
  };

  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string | string[]>>({});
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [appStyles, setAppStyles] = useState<any[]>([]);
  const [appCategories, setAppCategories] = useState<any[]>([]);
  const [appPortfolio, setAppPortfolio] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeProjectHover, setActiveProjectHover] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
    });
    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    syncInitialData();
    const unsubStyles = subscribeToStyles(setAppStyles);
    const unsubCats = subscribeToCategories((cats) => {
      // Map icons back to components
      const mappedCats = cats.map(c => ({
        ...c,
        icon: ICON_MAP[c.iconName] || Palette
      }));
      setAppCategories(mappedCats);
    });
    const unsubPortfolio = subscribeToPortfolio(setAppPortfolio);

    return () => {
      unsubStyles();
      unsubCats();
      unsubPortfolio();
    };
  }, []);

  const heroImages = [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"
  ];

  useEffect(() => {
    if (currentPage !== 'home') return;
    
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [currentPage, heroImages.length]);

  const handleStart = () => {
    navigateTo('styles');
  };
  
  // Save selection to Firestore
  const saveSelection = async (newSelections: any, isFinal = false) => {
    try {
      // If it's a final design submission, save to 'designs' collection
      if (isFinal) {
        const designId = `${Date.now()}`;
        await setDoc(doc(db, 'designs', designId), {
          style: newSelections.style,
          selections: newSelections,
          createdAt: serverTimestamp()
        });
      }
    } catch (err: any) {
      console.error("Error saving selection:", err);
    }
  };

  const handleSelectStyle = (styleId: string) => {
    setSelectedStyle(styleId);
    navigateTo('style_preview');
  };

  const handleConfirmStyle = () => {
    if (!selectedStyle) return;
    const newSelections = { style: selectedStyle };
    setSelections(newSelections);
    saveSelection(newSelections);
    setCurrentCategoryIndex(0);
    navigateTo('configurator');
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
    navigateTo('home');
    setSelectedStyle(null);
    setCurrentCategoryIndex(0);
    setSelections({});
  };

  const navItems = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'portfolio', label: 'من تصميمنا' },
    { id: 'about', label: 'عنا' },
    { id: 'visitors', label: 'الزوار' },
    { id: 'contact', label: 'اتصل بنا' },
  ];

  return (
    <div className="min-h-dvh bg-egypt-black font-sans text-gold-100 flex flex-col">
      {!isEditPanelOpen ? (
        <>
      {/* Top Navigation Header */}
      <motion.header 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        className="fixed top-0 left-0 right-0 h-20 md:h-24 bg-egypt-dark/80 backdrop-blur-xl border-b border-gold-500/10 z-50 flex items-center justify-between px-4 md:px-12 shadow-2xl"
      >
        <div className="flex items-center cursor-pointer shrink-0 group" onClick={() => navigateTo('home')}>
           <div className="flex flex-col items-center">
             <img src="/logo.jpg" alt="KEMET Logo" className="h-16 md:h-20 object-contain" onError={(e) => {
               (e.currentTarget as HTMLImageElement).style.display = 'none';
               const fallback = e.currentTarget.nextElementSibling as HTMLElement;
               if (fallback) fallback.style.display = 'flex';
             }} />
             <div className="hidden flex-col items-center">
               <h1 className="text-2xl md:text-3xl font-black tracking-[0.3em] text-white group-hover:text-gold-500 transition-colors uppercase">KEMET</h1>
               <div className="w-full h-px bg-gold-500/30 scale-x-50 group-hover:scale-x-100 transition-transform"></div>
             </div>
           </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end overflow-visible">
          {pageHistory.length > 0 && (
            <button 
              onClick={goBack}
              className="text-gold-500 hover:text-gold-400 p-2 md:px-4 md:py-2 border border-gold-500/20 rounded-lg md:rounded-full bg-gold-500/5 transition-all flex items-center gap-2"
            >
              <ChevronRight className="w-5 h-5 md:w-4 md:h-4" />
              <span className="hidden md:inline text-sm font-bold uppercase">رجوع</span>
            </button>
          )}

          {/* Hamburger Menu Button */}
          <div className="relative">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gold-500 hover:text-gold-400 p-2 border border-gold-500/20 rounded-lg bg-gold-500/5 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 md:w-6 md:h-6" /> : <Menu className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
            
            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-14 right-0 w-48 bg-egypt-dark border border-gold-500/10 rounded-xl shadow-2xl py-2 z-50 origin-top-right overflow-hidden"
                >
                  <div className="flex flex-col">
                    {navItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                if (item.id === 'home' || item.id === 'about' || item.id === 'portfolio' || item.id === 'visitors') {
                                    navigateTo(item.id as AppState);
                                } else if (item.id === 'contact') {
                                    window.open('https://wa.me/201554853093', '_blank');
                                }
                            }}
                            className={`flex items-center px-4 py-3 text-right hover:bg-gold-500/10 transition-colors ${
                                currentPage === item.id ? 'text-gold-500 bg-gold-500/5' : 'text-gray-300'
                            }`}
                        >
                            <span className="text-sm font-bold uppercase w-full">{item.label}</span>
                        </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1 md:gap-4 shrink-0">
              <button 
                onClick={() => navigateTo('styles')}
                className={`bg-gold-500 text-egypt-black px-2 md:px-6 py-1.5 md:py-3 rounded-full hover:bg-gold-600 transition-all shadow-lg active:scale-95 shrink-0 flex items-center gap-2 ${currentPage === 'styles' ? 'ring-4 ring-gold-500/20' : ''}`}
              >
                <span className="text-[8px] md:text-sm font-black uppercase tracking-tight whitespace-nowrap">ابدأ التصميم</span>
              </button>

              <div className="h-6 w-px bg-gold-500/10 mx-0.5 hidden sm:block"></div>

              <div className="flex items-center gap-1 md:gap-4 shrink-0">
                  <button 
                      onClick={() => setIsEditPanelOpen(true)}
                      className="text-[10px] md:text-sm font-bold text-gold-500 hover:text-gold-600 border border-gold-500/20 p-2 md:px-4 md:py-2 rounded-full bg-gold-500/5 flex items-center transition-all"
                  >
                      <Edit3 className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                      <span className="hidden md:inline">تعديل المحتوى</span>
                  </button>
              </div>
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
              className="relative min-h-dvh lg:min-h-screen flex flex-col lg:flex-row overflow-hidden pharaonic-pattern"
            >
              {/* Left Content: Hero Section */}
              <div className="w-full lg:w-1/2 p-8 lg:p-24 flex flex-col justify-center bg-egypt-black/40 backdrop-blur-sm relative z-10">
                
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
                  className="text-base md:text-xl lg:text-2xl text-white mb-12 max-w-md font-medium leading-relaxed"
                >
                  نحن هنا لنحول منزلك الي لوحة فنية من اختيار خاماتك وتفاصيلك بفخامه كيميت
                  <span className="block mt-4 text-gold-500 font-black tracking-widest">(حول منزلك من 2D الي 3D)</span>
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

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-12 pt-8 border-t border-gold-500/10"
                >
                  <p className="text-xs md:text-sm text-white font-black tracking-widest uppercase">
                    لعمل موقع مثل هذا يرجي التواصل عبر نفس الرقم المكتوب
                  </p>
                </motion.div>
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
                     <motion.div 
                        key={heroImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full shadow-[0_0_80px_rgba(212,175,55,0.1)] border-8 border-gold-500/10 rounded-[3rem] overflow-hidden"
                     >
                       <SmoothImage 
                         src={heroImages[heroImageIndex]} 
                         className="w-full h-full"
                         alt="Architecture"
                       />
                     </motion.div>
                   </AnimatePresence>
                 </motion.div>
               </div>

              {/* Portfolio Highlights Section */}
              <div className="max-w-7xl mx-auto px-8 lg:px-24 py-24 w-full">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                  <div className="text-right">
                    <span className="text-gold-500 font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4 block underline underline-offset-8"> masterpieces: من أعمالنا</span>
                    <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-white">روائع <span className="gold-gradient">كيميت</span></h2>
                    <p className="text-white/80 font-medium text-lg max-w-xl">اكتشف الفرق الذي نصنعه في كل مساحة. المس السهم لرؤية التحول.</p>
                  </div>
                  <button 
                    onClick={() => navigateTo('portfolio')}
                    className="text-gold-500 font-black uppercase tracking-widest text-xs border-b-2 border-gold-500/20 pb-2 hover:border-gold-500 transition-all flex items-center gap-2 group"
                  >
                    شاهد المعرض كاملاً
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                  {appPortfolio.slice(0, 4).map((project: any) => (
                    <motion.div 
                      key={project.id}
                      className="group relative"
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] border border-gold-500/10 shadow-2xl">
                         {/* Before Image */}
                         <img 
                            src={project.beforeImage} 
                            alt="Before" 
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${activeProjectHover === project.id ? 'opacity-0' : 'opacity-40'}`}
                         />
                         {/* After Image */}
                         <img 
                            src={project.afterImage} 
                            alt="After" 
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${activeProjectHover === project.id ? 'opacity-100' : 'opacity-0'}`}
                         />
                         
                         {/* Labels */}
                         <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md transition-all ${activeProjectHover === project.id ? 'bg-gold-500 text-egypt-black border-gold-500' : 'bg-egypt-black/60 text-gold-500 border-gold-500/10'}`}>
                               {activeProjectHover === project.id ? 'بعد' : 'قبل'}
                            </span>
                         </div>

                         {/* Hover Interaction Trigger Card */}
                         <div 
                           className="absolute inset-0 z-20 cursor-pointer"
                           onMouseEnter={() => setActiveProjectHover(project.id)}
                           onMouseLeave={() => setActiveProjectHover(null)}
                           onClick={() => setSelectedProject(project)}
                         />

                         {/* Overlay Info */}
                         <div className="absolute inset-0 bg-gradient-to-t from-egypt-black/80 via-transparent to-transparent pointer-events-none" />
                         <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-right pointer-events-none">
                            <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tighter">{project.title}</h3>
                            <p className="text-white/60 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">{project.description}</p>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {currentPage === 'about' && (
            <motion.div 
              key="about"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-dvh py-24 px-8 lg:px-24 max-w-7xl mx-auto"
            >
              <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
                 <div className="lg:w-1/2 text-right">
                    <span className="text-gold-500 font-bold uppercase tracking-[0.4em] text-xs mb-6 lg:mb-8 block underline underline-offset-8">KEMET Identity</span>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 lg:mb-10 leading-tight text-white">نحن <span className="gold-gradient">KEMET</span> <br/> مستقبل التشطيب</h2>
                    <div className="prose prose-lg md:prose-xl font-medium text-white/60 leading-relaxed mb-10 lg:mb-12">
                       <p>شركة KEMET هي شريكك الموثوق في رحلة تحويل مساحتك الخاصة إلى واقع ملموس. استوحينا اسمنا من "كيميت" (الأرض السوداء) لنعكس العراقة والأصالة في البناء والتشطيب.</p>
                       <p className="mt-4 md:mt-6">نحن نؤمن بالشفافية، الجودة، والابتكار. نوفر لك الأدوات اللازمة لتصميم بيتك بنفسك، مع توفير أفضل الخامات تحت إشراف نخبة من المهندسين.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 md:gap-8 py-6 md:py-8 border-t border-gold-500/10">
                       <div>
                          <p className="text-3xl md:text-4xl font-black mb-1 md:mb-2 text-gold-500">1,200+</p>
                          <p className="text-[10px] md:text-sm text-white/40 font-bold uppercase tracking-widest">عميل سعيد</p>
                       </div>
                       <div>
                          <p className="text-3xl md:text-4xl font-black mb-1 md:mb-2 text-gold-500">15</p>
                          <p className="text-[10px] md:text-sm text-white/40 font-bold uppercase tracking-widest">جائزة تصميم</p>
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

          {currentPage === 'portfolio' && (
            <motion.div 
              key="portfolio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="min-h-dvh py-24 px-8 lg:px-24 max-w-7xl mx-auto"
            >
              <div className="text-center mb-20 text-right">
                <span className="text-gold-500 font-bold uppercase tracking-[0.4em] text-xs mb-4 block">PortFolio Showcase</span>
                <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-white">من <span className="text-gold-500">تصميمنا</span></h2>
                <p className="text-white/70 max-w-2xl ml-auto text-lg leading-relaxed font-black">
                  نحن نفخر بتنفيذ أفكار عملائنا وتحويلها إلى واقع ملموس بدقة عالية وفخامة لا تضاهى. شاهد الفرق في التحول بين الصور قبل التشطيب وبعده.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {appPortfolio.map((project: any) => (
                  <motion.div 
                    key={project.id}
                    className="group"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <div className="mb-6 overflow-hidden rounded-[2.5rem] border-2 border-gold-500/10 shadow-2xl bg-egypt-dark relative group-hover:border-gold-500/30 transition-colors duration-500">
                      <div className="grid grid-cols-2">
                        {/* Before */}
                        <div className="relative aspect-[3/4] overflow-hidden border-r border-gold-500/10">
                          <img 
                            src={project.beforeImage} 
                            alt="Before" 
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-1000 ease-in-out" 
                          />
                          <div className="absolute top-6 left-6 bg-egypt-black/80 backdrop-blur-xl px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-white border border-white/10 z-10">قبل</div>
                        </div>
                        {/* After */}
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img 
                            src={project.afterImage} 
                            alt="After" 
                            className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-all duration-1000 ease-in-out" 
                          />
                          <div className="absolute top-6 right-6 bg-gold-500 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-egypt-black shadow-2xl z-10">بعد</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right px-4">
                      <h3 className="text-3xl font-black mb-3 text-white group-hover:text-gold-500 transition-colors uppercase tracking-tight italic">{project.title}</h3>
                      <p className="text-white/60 font-medium leading-relaxed italic text-sm mb-6">{project.description}</p>
                      <button 
                        onClick={() => setSelectedProject(project)}
                        className="bg-gold-500/10 text-gold-500 border border-gold-500/20 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-egypt-black transition-all flex items-center gap-2 justify-center w-full"
                      >
                         <Maximize2 className="w-4 h-4" />
                         عرض كل الصور
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-24 text-center">
                 <button 
                  onClick={() => window.open('https://wa.me/201554853093', '_blank')}
                  className="bg-gold-500 text-egypt-black px-12 py-6 rounded-2xl font-black text-xl hover:bg-white transition-all flex items-center gap-6 mx-auto shadow-[0_20px_60px_rgba(212,175,55,0.2)] group"
                >
                  ابدأ مشروعك معنا
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Project Details Modal */}
          <AnimatePresence>
            {selectedProject && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-egypt-black flex flex-col pt-24 overflow-hidden"
              >
                <div className="absolute top-8 left-8 z-10">
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-gold-500 text-egypt-black rounded-full shadow-glow"
                  >
                    <X className="w-6 h-6 md:w-8 md:h-8" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-12 md:px-20 md:py-20 pharaonic-pattern">
                  <div className="max-w-5xl mx-auto">
                    <div className="text-right mb-16">
                      <h2 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tighter">{selectedProject.title}</h2>
                      <p className="text-gold-500 font-bold uppercase tracking-[0.4em] text-sm mb-4 border-b border-gold-500/20 pb-4">Project Details / تفاصيل المشروع</p>
                      <p className="text-white/80 text-xl font-medium leading-relaxed max-w-3xl ml-auto">{selectedProject.description}</p>
                    </div>

                    <div className="space-y-24">
                       {/* Main Image Pair */}
                       <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <span className="bg-egypt-dark text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 inline-block">قبل التحول</span>
                                <div className="rounded-[2rem] overflow-hidden border border-gold-500/10 shadow-2xl">
                                   <SmoothImage src={selectedProject.beforeImage} alt="Before" className="w-full aspect-video md:aspect-[4/5] lg:aspect-video" />
                                </div>
                             </div>
                             <div className="space-y-4">
                                <span className="bg-gold-500 text-egypt-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest inline-block">بعد التشطيب</span>
                                <div className="rounded-[2rem] overflow-hidden border border-gold-500/10 shadow-2xl">
                                   <SmoothImage src={selectedProject.afterImage} alt="After" className="w-full aspect-video md:aspect-[4/5] lg:aspect-video" />
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Additional Image Pairs if any */}
                       {selectedProject.images?.map((pair: any, idx: number) => (
                          <div key={idx} className="space-y-8 pt-24 border-t border-gold-500/10">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-4">
                                    <span className="bg-egypt-dark text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 inline-block">قبل {idx + 2}</span>
                                    <div className="rounded-[2rem] overflow-hidden border border-gold-500/10 shadow-2xl">
                                       <SmoothImage src={pair.before} alt={`Before ${idx + 2}`} className="w-full aspect-video" />
                                    </div>
                                 </div>
                                 <div className="space-y-4">
                                    <span className="bg-gold-500 text-egypt-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest inline-block">بعد {idx + 2}</span>
                                    <div className="rounded-[2rem] overflow-hidden border border-gold-500/10 shadow-2xl">
                                       <SmoothImage src={pair.after} alt={`After ${idx + 2}`} className="w-full aspect-video" />
                                    </div>
                                 </div>
                              </div>
                          </div>
                       ))}
                    </div>

                    <div className="mt-32 text-center pb-20">
                        <button 
                          onClick={() => setSelectedProject(null)}
                          className="bg-egypt-dark text-gold-500 border border-gold-500/30 px-12 py-6 rounded-2xl font-black text-xl hover:bg-gold-500 hover:text-egypt-black transition-all"
                        >
                          العودة للمقالات
                        </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          {currentPage === 'styles' && (
            <div 
              key="styles"
              className="max-w-7xl mx-auto px-6 py-12 lg:py-24"
            >
              <div className="mb-12 lg:mb-20">
                <motion.span 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-gold-400 font-black uppercase tracking-[0.2em] text-lg md:text-xl mb-6 block border-b-2 border-gold-500 pb-2"
                >
                  الخطوة الأولى: اختيار النمط الملكي
                </motion.span>
                <h2 className="text-4xl md:text-6xl lg:text-8xl mb-8 font-black tracking-tighter leading-none text-white">
                  اختر <span className="gold-gradient">ستايلك</span>
                </h2>
                <div className="w-24 h-2 bg-gold-500 shadow-glow"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              {appStyles.map((style, idx) => (
                    <div
                      key={style.id}
                      onClick={() => handleSelectStyle(style.id)}
                      className="cursor-pointer group flex flex-row items-stretch bg-egypt-dark border border-gold-500/10 rounded-[2.5rem] overflow-hidden hover:border-gold-500/40 transition-all duration-500 shadow-2xl hover:shadow-[0_20px_60px_rgba(212,175,55,0.15)] hover:-translate-y-2"
                    >
                      <div className="w-2/5 shrink-0 overflow-hidden relative">
                        <SmoothImage 
                          src={style.image} 
                          alt={style.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gold-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-4">
                          <div className="bg-gold-500 text-egypt-black p-4 rounded-full shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500 delay-100">
                            <ArrowRight className="w-6 h-6 -rotate-45" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 md:p-6 flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl md:text-2xl font-black text-white">{style.name}</h3>
                          <span className="text-[10px] font-mono text-gold-500/30 font-black tracking-widest uppercase">KEMET 0{idx+1}</span>
                        </div>
                        <p className="text-white/60 font-medium text-xs md:text-sm leading-relaxed">
                          {style.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {currentPage === 'style_preview' && selectedStyle && (
            <div 
              key="style_preview"
              className="max-w-7xl mx-auto px-6 py-12 lg:py-24 animate-in fade-in zoom-in duration-500"
            >
              {(() => {
                const style = appStyles.find(s => s.id === selectedStyle);
                if (!style) return null;
                const images = [style.image, ...(style.galleryImages || [])].filter(Boolean);
                return (
                  <div className="space-y-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
                      <div className="text-right flex-1">
                        <button onClick={() => navigateTo('styles')} className="text-gold-500/60 hover:text-gold-500 flex items-center justify-start gap-2 mb-6 font-bold text-sm transition-colors w-fit">
                          العودة للأنماط
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-4">تصاميم <span className="gold-gradient text-gold-500">{style.name}</span></h2>
                        <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl ml-auto">{style.description}</p>
                      </div>
                      <button 
                        onClick={handleConfirmStyle}
                        className="bg-gold-500 text-egypt-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_20px_60px_rgba(212,175,55,0.2)] flex items-center justify-center gap-4 group shrink-0 w-full md:w-auto"
                      >
                        اختر تصميمك الآن
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {images.map((img: string, i: number) => (
                        <div key={i} className={`rounded-[2rem] overflow-hidden border border-gold-500/10 shadow-2xl relative group ${i === 0 ? 'md:col-span-2 lg:col-span-2 aspect-video' : 'aspect-square'}`}>
                           <SmoothImage src={img} alt={`${style.name} ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                           <div className="absolute inset-0 bg-egypt-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {currentPage === 'configurator' && (
            <div 
              key="configurator"
              className="flex flex-col lg:flex-row min-h-screen"
            >
              {/* Top Navigation for Mobile/Tablet */}
              <div className="lg:hidden bg-egypt-dark border-b border-gold-500/10 px-6 py-4 flex gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide shadow-lg z-10 sticky top-20 md:top-24">
                {appCategories.map((cat, idx) => (
                  <button
                    key={cat.id}
                    onClick={() => setCurrentCategoryIndex(idx)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                      currentCategoryIndex === idx 
                        ? 'bg-gold-500 text-egypt-black shadow-lg shadow-gold-500/20' 
                        : 'bg-egypt-black text-white hover:text-gold-500 border border-gold-500/10'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    saveSelection(selections, true);
                    navigateTo('summary');
                  }}
                  className="px-6 py-2 rounded-full text-xs font-black bg-gold-500 text-egypt-black shadow-lg shadow-gold-500/20 mr-2"
                >
                  لقد انتهيت
                </button>
              </div>

              {/* Desktop Category Sidebar */}
              <div className="hidden lg:flex w-80 shrink-0 bg-egypt-dark border-l border-gold-500/10 p-10 flex-col gap-8">
                <div className="mb-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gold-500 block mb-3">النمط المختار</span>
                  <h3 className="text-2xl font-black text-white">{appStyles.find(s => s.id === selectedStyle)?.name}</h3>
                </div>
                
                <nav className="space-y-4">
                  {appCategories.map((cat, idx) => (
                    <button
                      key={cat.id}
                      onClick={() => setCurrentCategoryIndex(idx)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                        currentCategoryIndex === idx 
                          ? 'bg-gold-500/10 border border-gold-500/20 text-gold-500 font-black shadow-inner shadow-gold-500/5' 
                          : 'text-white hover:text-gold-500 hover:bg-gold-500/5'
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
                      navigateTo('summary');
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

                <div className="mt-auto pt-8">
                  <div className="p-6 bg-gold-500/5 rounded-3xl border border-gold-500/10">
                    <p className="text-gold-500 text-[10px] font-black leading-relaxed uppercase tracking-widest">
                       نحن نوفر أفضل الخامات والضمانات الملكية لكل اختيار تقوم به.
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Configurator Area */}
              <div className="flex-1 p-6 md:p-12 lg:p-20 bg-egypt-black pharaonic-pattern">
                  <div
                    key={currentCategoryIndex}
                    className="max-w-5xl mx-auto text-right"
                  >
                    <header className="mb-12 lg:mb-16">
                      <div className="flex items-center justify-end gap-2 text-gold-500 mb-4">
                        <span className="text-xs font-black uppercase tracking-[0.3em]">
                          {appCategories[currentCategoryIndex]?.name}
                        </span>
                        {(() => {
                           const Icon = appCategories[currentCategoryIndex]?.icon || Palette;
                           return <Icon className="w-5 h-5" />;
                        })()}
                      </div>
                      <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-white">
                        اختر <span className="gold-gradient">{appCategories[currentCategoryIndex]?.name}</span>
                      </h2>
                      <p className="text-white/70 text-sm md:text-lg max-w-2xl ml-auto leading-relaxed font-medium">
                        اختر ما يناسب ذوقك وتطلعاتك الملكية، نحن نضمن لك الجودة والجمال في كل قطعة تحت اسم كيميت.
                      </p>
                    </header>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {appCategories[currentCategoryIndex]?.options?.map((option: any) => {
                          const isSelected = Array.isArray(selections[appCategories[currentCategoryIndex].id]) && (selections[appCategories[currentCategoryIndex].id] as string[]).includes(option.id);
                          return (
                          <button
                           key={option.id}
                           onClick={() => handleOptionSelect(appCategories[currentCategoryIndex].id, option.id)}
                           className={`group relative text-right flex flex-col items-stretch rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden transition-all duration-200 border-2 active:scale-95 will-change-transform ${
                             isSelected
                               ? 'border-gold-500 bg-gold-500/10 scale-[1.02]' 
                               : 'border-gold-500/5 bg-egypt-dark hover:border-gold-500/20'
                           }`}
                         >
                           <div className="aspect-square relative overflow-hidden bg-egypt-black">
                             <SmoothImage 
                               src={option.image} 
                               alt={option.name} 
                               className="w-full h-full"
                               referrerPolicy="no-referrer"
                             />
                             {isSelected && (
                               <div className="absolute inset-0 bg-gold-500/10 flex items-center justify-center z-20">
                                  <div className="bg-gold-500 text-egypt-black p-1.5 rounded-full shadow-lg scale-110">
                                   <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                                 </div>
                               </div>
                             )}
                           </div>
                          
                          <div className="p-3 md:p-5 flex flex-col justify-center flex-1">
                            <p className="text-[8px] md:text-[10px] font-black text-gold-500 uppercase tracking-widest mb-0.5 opacity-60">KEMET ROYAL</p>
                             <h4 className="text-sm md:text-lg font-black leading-tight text-white truncate">{option.name}</h4>
                           </div>
                         </button>
                       );
                     })}
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
                        {appCategories.map((cat, i) => (
                          <div 
                            key={i} 
                            className={`h-1 rounded-full transition-all duration-300 ${
                              i === currentCategoryIndex ? 'w-10 bg-gold-500' : 'w-2 bg-gold-500/20'
                            }`} 
                          />
                        ))}
                      </div>

                      <button 
                        onClick={() => {
                          if (currentCategoryIndex < appCategories.length - 1) {
                            setCurrentCategoryIndex(prev => prev + 1);
                          } else {
                            saveSelection(selections, true);
                            navigateTo('summary');
                          }
                        }}
                        className="group flex items-center gap-6 bg-gold-500 text-egypt-black px-10 py-5 rounded-2xl font-black transition-all shadow-xl hover:bg-white"
                      >
                        <span className="text-xs uppercase tracking-widest text-right">
                          {(!appCategories[currentCategoryIndex] || !Array.isArray(selections[appCategories[currentCategoryIndex].id]) || (selections[appCategories[currentCategoryIndex].id] as string[]).length === 0)
                            ? 'تخطي القسم' 
                            : (currentCategoryIndex < appCategories.length - 1 ? 'القسم التالي' : 'عرض الملخص')}
                        </span>
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                      </button>
                    </footer>
                  </div>
                </div>
            </div>
          )}

          {currentPage === 'mydesign' && (
            <div 
              key="mydesign"
              className="min-h-dvh py-24 px-8 lg:px-24 max-w-7xl mx-auto"
            >
              <div className="mb-16 md:mb-24">
                 <span className="text-gold-500 font-bold uppercase tracking-[0.4em] text-xs mb-4 block underline underline-offset-8 decoration-2">Personal Selection</span>
                 <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-[0.9] text-white">تصميمي <br/><span className="gold-gradient">الخاص</span></h2>
                 <p className="text-gray-400 text-sm md:text-xl font-medium max-w-2xl leading-relaxed italic">
                    هذا هو ذوقك الذي يعبر عنك بناءً على طراز {appStyles.find(s => s.id === selections.style)?.name || 'الذي لم يتم تحديده بعد'}. يمكنك استعراض اختياراتك أو البدء من جديد.
                 </p>
              </div>

              {Object.keys(selections).length === 0 ? (
                <div className="bg-egypt-dark rounded-[3rem] p-12 md:p-24 text-center border-2 border-dashed border-gold-500/10">
                   <Palette className="w-16 h-16 mx-auto mb-8 text-gold-500/20" />
                   <h3 className="text-3xl font-black mb-4 text-white">لا توجد اختيارات بعد</h3>
                   <p className="text-white/60 mb-8 max-w-sm mx-auto">ابدأ رحلة تصميم منزلك الآن واختر أفضل الخامات والموديلات.</p>
                   <button 
                    onClick={() => navigateTo('styles')}
                    className="bg-gold-500 text-egypt-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-gold-600 transition-all shadow-xl shadow-gold-500/20"
                   >
                     ابدأ التصميم الآن
                   </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {appCategories.map((cat, idx) => {
                      const selectionIds = selections[cat.id] as string[] || [];
                      const selectedOptions = (cat.options || []).filter((o: any) => selectionIds.includes(o.id));
                      
                      return (
                        <motion.div
                          key={cat.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ...SPRING_TRANSITION, delay: idx * 0.05 }}
                          className="group bg-egypt-dark rounded-[2.5rem] border border-gold-500/10 shadow-lg hover:shadow-2xl transition-all duration-500 relative overflow-hidden flex flex-col will-change-transform"
                        >
                          <div className="p-8 border-b border-gold-500/10 flex justify-between items-center bg-egypt-black/50">
                             <div className="flex items-center gap-2">
                                <cat.icon className="w-5 h-5 text-gold-500" />
                                <span className="text-sm text-gold-500 font-black uppercase tracking-widest">{cat.name}</span>
                             </div>
                             <button 
                                onClick={() => {
                                  setCurrentCategoryIndex(idx);
                                  navigateTo('configurator');
                                }}
                                className="w-10 h-10 rounded-full border border-gold-500/10 flex items-center justify-center text-gold-500 hover:bg-gold-500 hover:text-egypt-black transition-all"
                             >
                                <ChevronRight className="w-4 h-4" />
                             </button>
                          </div>

                          <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedOptions.length > 0 ? (
                              selectedOptions.map(option => (
                                <div key={option.id} className="relative group/opt aspect-square rounded-2xl overflow-hidden border border-gold-500/10 bg-egypt-black">
                                  <SmoothImage 
                                    src={option.image} 
                                    alt={option.name}
                                    className="w-full h-full"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-egypt-black/40 flex items-end p-3 opacity-0 group-hover/opt:opacity-100 transition-opacity z-20">
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
                              <div className="col-span-full py-8 text-center text-gold-500/20">
                                <p className="text-xs font-black uppercase tracking-widest">لم يتم اختيار أي عنصر</p>
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
                       <p className="text-white/70 max-w-md font-medium text-lg leading-relaxed">إذا كنت تريد أن ترى تصميمك في بيتك، يرجى أن ترسل لهذا الرقم على الواتساب 01554853093</p>
                    </div>

                     <div className="relative z-10 flex flex-col sm:flex-row gap-6 w-full md:w-auto">
                       <button 
                         onClick={() => window.open('https://wa.me/201554853093', '_blank')}
                         className="bg-gold-500 text-egypt-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                       >
                         WhatsApp
                       </button>
                       <button 
                          onClick={() => navigateTo('styles')}
                          className="bg-egypt-black text-gold-500 border border-gold-500/30 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gold-500/5 transition-all"
                       >
                         New Design
                       </button>
                     </div>
                   </div>
                 </>
               )}
             </div>
           )}

           {currentPage === 'summary' && (
            <div 
              key="summary"
              className="py-12 md:py-24 px-6 lg:px-20 bg-egypt-black pharaonic-pattern"
            >
              <div className="max-w-4xl mx-auto text-right">
                <div className="mb-20">
                  <span className="text-gold-500 font-bold uppercase tracking-[0.4em] text-xs mb-4 block underline underline-offset-8 decoration-2">KEMET Final Design</span>
                  <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white">ملخص <span className="gold-gradient">اختياراتك</span></h2>
                  <p className="text-white/70 text-xl font-medium">هذه هي العناصر التي وقع اختيارك عليها لتجعل منزلك لوحة فنية.</p>
                </div>

                <div className="space-y-16">
                  {/* Style Background */}
                  <div className="bg-egypt-dark rounded-[3rem] p-8 md:p-12 border border-gold-500/20 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 group-hover:opacity-20 transition-opacity">
                       <img src={appStyles.find(s => s.id === selectedStyle)?.image} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-gold-500 font-black text-xs uppercase tracking-widest mb-4">النمط المختار / Selected Style</p>
                      <h3 className="text-4xl md:text-6xl font-black text-white mb-2">{appStyles.find(s => s.id === selectedStyle)?.name}</h3>
                      <p className="text-white/70 max-w-2xl ml-auto">{appStyles.find(s => s.id === selectedStyle)?.description}</p>
                    </div>
                  </div>

                  {/* Categories */}
                  {appCategories.map((cat) => {
                    const selectionIds = selections[cat.id] as string[] || [];
                    const selectedOptions = cat.options.filter((o: any) => selectionIds.includes(o.id));
                    
                    if (selectedOptions.length === 0) return null;

                    return (
                      <motion.div 
                        key={cat.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                      >
                         <div className="flex items-center gap-6 border-b border-gold-500/10 pb-6">
                            <cat.icon className="w-10 h-10 text-gold-500" />
                            <h3 className="text-3xl md:text-4xl font-black text-white">{cat.name}</h3>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {selectedOptions.map(opt => (
                             <div key={opt.id} className="bg-egypt-dark/50 rounded-[2.5rem] p-6 border border-gold-500/10 hover:border-gold-500/30 transition-all flex flex-col gap-6">
                                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gold-500/10">
                                   <SmoothImage src={opt.image} alt={opt.name} className="w-full h-full" referrerPolicy="no-referrer" />
                                </div>
                                <div>
                                   <h4 className="text-2xl font-black text-gold-500 mb-2">{opt.name}</h4>
                                   <p className="text-xs text-white/40 uppercase tracking-widest font-black">Option Verified</p>
                                </div>
                             </div>
                           ))}
                         </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-32 bg-gold-500 rounded-[3rem] p-12 md:p-20 text-egypt-black text-center shadow-glow">
                   <h3 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">تواصل معنا حتى تنفذ ما اخترته في بيتك</h3>
                   <div className="flex flex-col sm:flex-row gap-6 justify-center">
                     <button 
                        onClick={() => window.open('https://wa.me/201554853093', '_blank')}
                        className="bg-egypt-black text-gold-500 px-16 py-6 rounded-2xl font-black text-xl uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4"
                     >
                        واتساب
                        <ArrowRight className="w-6 h-6" />
                     </button>
                     <button 
                        onClick={() => { setCurrentCategoryIndex(0); navigateTo('configurator'); }}
                        className="bg-white/20 backdrop-blur-md text-egypt-black border-2 border-egypt-black/20 px-16 py-6 rounded-2xl font-black text-xl hover:bg-white/30 transition-all"
                     >
                        تعديل الاختيارات
                     </button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 'visitors' && (
            <div key="visitors">
              <VisitorsDashboard />
            </div>
          )}
        </AnimatePresence>
      </main>
      </>
      ) : (
        <AdminPanel 
          onClose={() => setIsEditPanelOpen(false)} 
          appStyles={appStyles}
          appCategories={appCategories}
          appPortfolio={appPortfolio}
        />
      )}
    </div>
  );
}

