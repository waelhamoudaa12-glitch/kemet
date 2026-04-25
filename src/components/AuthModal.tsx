import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, Lock, X, ArrowRight, Loader2, User as UserIcon } from 'lucide-react';

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const formatEmail = (phone: string) => {
    // If it's the admin ID, use it directly as the email local part
    if (phone === 'WaelWeza123123') return 'WaelWeza123123@kemet.app';
    // For normal phone numbers, strip non-digits
    const cleaned = phone.replace(/\D/g, '');
    return `${cleaned}@kemet.app`;
  };

  const INTERNAL_PASSWORD = 'kemet_default_password_123'; // Internal password for Firebase compliance

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const email = formatEmail(phoneNumber);

    try {
      if (mode === 'signup') {
        if (!displayName) throw new Error('يرجى إدخال الاسم');
        const userCredential = await createUserWithEmailAndPassword(auth, email, INTERNAL_PASSWORD);
        await updateProfile(userCredential.user, { displayName });
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          phoneNumber: phoneNumber,
          displayName: displayName,
          isAdmin: phoneNumber === 'WaelWeza123123', // Admin check
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, INTERNAL_PASSWORD);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('يجب تفعيل (Email/Password) من إعدادات Firebase Console أولاً.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        if (mode === 'login') {
          setMode('signup');
          setError('هذا الرقم غير مسجل، يرجى كتابة اسمك للتسجيل');
        } else {
          setError('فشل في عملية التسجيل، تأكد من البيانات');
        }
      } else if (err.code === 'auth/email-already-in-use') {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, INTERNAL_PASSWORD);
          
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', userCredential.user.uid), {
              uid: userCredential.user.uid,
              phoneNumber: phoneNumber,
              displayName: displayName || 'مستخدم جديد',
              isAdmin: phoneNumber === 'WaelWeza123123',
              createdAt: serverTimestamp(),
              lastUpdated: serverTimestamp()
            });
          }
          onClose();
        } catch (loginErr: any) {
          if (loginErr.code === 'auth/invalid-credential' || loginErr.code === 'auth/wrong-password') {
            setError('هذا الحساب مسجل بكلمة مرور قديمة. يرجى التواصل مع الدعم أو المحاولة لاحقاً.');
          } else {
            setError('هذا الرقم مسجل بالفعل، يرجى تسجيل الدخول بدلاً من التسجيل');
          }
        }
      } else {
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
           setError('بيانات الدخول غير صحيحة');
        } else {
           setError(err.message || 'حدث خطأ غير متوقع');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-egypt-dark w-full max-w-md p-8 lg:p-12 relative border-t-8 border-gold-500 shadow-3xl rounded-b-[2rem]"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gold-500/40 hover:text-gold-500 transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="mb-10 text-center">
            <h2 className="text-3xl font-black mb-2 tracking-[0.3em] text-gold-500">KEMET</h2>
            <p className="text-gold-200/30 text-sm font-medium">
                {mode === 'login' ? 'سجل دخولك برقم الهاتف' : 'أنشئ حساباً جديداً'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <label className="block text-xs font-black text-gold-500/60 uppercase tracking-widest mb-2">الاسم</label>
              <div className="relative">
                <UserIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500/30" />
                <input 
                  type="text" 
                  placeholder="اكتب اسمك هنا"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full border-b-2 border-gold-500/10 bg-transparent py-4 pl-10 focus:border-gold-500 outline-none transition-all text-lg font-black text-white"
                  required
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-black text-gold-500/60 uppercase tracking-widest mb-2">رقم التليفون</label>
            <div className="relative">
              <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gold-500/30" />
              <input 
                type="text" 
                placeholder="01xxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border-b-2 border-gold-500/10 bg-transparent py-4 pl-10 focus:border-gold-500 outline-none transition-all text-lg font-black text-white tracking-widest"
                required
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-xs font-bold text-center mt-4 p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gold-500 text-egypt-black py-5 rounded-xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-gold-600 transition-all disabled:opacity-50 mt-4 shadow-lg shadow-gold-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                    {mode === 'login' ? 'تـسـجـيـل الـدخـول' : 'إنـشـاء الـحـسـاب'}
                    <ArrowRight className="w-5 h-5" />
                </>
            )}
          </button>

          <div className="text-center mt-6">
              <button 
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                }}
                className="text-xs font-black text-gold-500/40 hover:text-gold-500 transition-colors uppercase tracking-widest"
                id="switch-mode-btn"
              >
                  {mode === 'login' ? 'ليس لديك حساب؟ اضغط هنا للتسجيل' : 'لديك حساب بالفعل؟ اضغط هنا للدخول'}
              </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
