import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
        
        // Save to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          phoneNumber: phoneNumber,
          displayName: displayName,
          isAdmin: phoneNumber === '0101234567123', // Updated admin number
          createdAt: serverTimestamp()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, INTERNAL_PASSWORD);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        if (mode === 'login') {
          setError('هذا الرقم غير مسجل، يرجى إنشاء حساب أولاً');
        } else {
          setError('حدث خطأ في التسجيل');
        }
      } else if (err.code === 'auth/email-already-in-use') {
        setError('هذا الرقم مسجل بالفعل، جرب تسجيل الدخول');
      } else {
        setError(err.message || 'حدث خطأ ما');
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
        className="bg-white w-full max-w-md p-8 lg:p-12 relative border-t-8 border-blue-600 shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black">
          <X className="w-6 h-6" />
        </button>

        <div className="mb-10 text-center">
            <h2 className="text-3xl font-black mb-2">مرحباً بك في <span className="text-blue-600">KEMET</span></h2>
            <p className="text-gray-400 text-sm">
                {mode === 'login' ? 'سجل دخولك برقم هاتفك' : 'أنشئ حساباً جديداً للبدء'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">الاسم الكامل</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="محمد أحمد"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full border-b-2 border-gray-100 py-4 pl-12 focus:border-blue-600 outline-none transition-all text-lg font-bold"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input 
                type="tel" 
                placeholder="01xxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full border-b-2 border-gray-100 py-4 pl-12 focus:border-blue-600 outline-none transition-all text-lg font-bold tracking-widest"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center mt-4">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white py-5 font-bold uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-gray-800 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                    {mode === 'login' ? 'دخول سريع' : 'إنشاء الحساب'}
                    <ArrowRight className="w-5 h-5" />
                </>
            )}
          </button>


          <div className="text-center mt-6">
              <button 
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors"
              >
                  {mode === 'login' ? 'ليس لديك حساب؟ أنشئ واحداً الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
              </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
