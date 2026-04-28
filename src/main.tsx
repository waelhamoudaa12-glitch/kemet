import {StrictMode, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';

const Analytics = () => {
  useEffect(() => {
    // Google Analytics
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId) {
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script1);

      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}');
      `;
      document.head.appendChild(script2);
    }
    
    // Internal Tracker (Firebase)
    const trackVisit = async () => {
      try {
        let country = 'Unknown';
        let city = 'Unknown';
        try {
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            const data = await res.json();
            country = data.country_name || 'Unknown';
            city = data.city || 'Unknown';
          }
        } catch (e) {
          console.error("IP API error", e);
        }

        const sessionId = sessionStorage.getItem('sid') || Math.random().toString(36).substring(2, 15);
        if (!sessionStorage.getItem('sid')) {
           sessionStorage.setItem('sid', sessionId);
        }
        
        await addDoc(collection(db, 'visits'), {
           sessionId,
           country,
           city,
           userAgent: navigator.userAgent,
           path: window.location.pathname,
           createdAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Visit tracking error", e);
      }
    };
    
    // Only track once per session
    if (!sessionStorage.getItem('tracked')) {
      trackVisit();
      sessionStorage.setItem('tracked', 'true');
    }
  }, []);

  return null;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Analytics />
    <App />
  </StrictMode>,
);
