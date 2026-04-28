import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Users, MapPin, Monitor, Clock } from 'lucide-react';

export function VisitorsDashboard() {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const q = query(collection(db, 'visits'), orderBy('createdAt', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVisits(data);
      } catch (e) {
        console.error("Error fetching visits", e);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-white">جاري تحميل الإحصائيات...</div>;
  }

  // Aggregate Data
  const totalVisits = visits.length;
  const uniqueVisitors = new Set(visits.map(v => v.sessionId)).size;

  const countryCount = visits.reduce((acc, v) => {
    const country = v.country || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryData = Object.entries(countryCount).map(([name, value]) => ({ name, value }));

  const COLORS = ['#D4AF37', '#9CA3AF', '#4B5563', '#1F2937', '#111827'];

  return (
    <div className="min-h-dvh py-24 px-8 lg:px-24 max-w-7xl mx-auto text-white">
      <div className="mb-12">
        <h2 className="text-3xl md:text-5xl font-black mb-4">إحصائيات الزوار</h2>
        <p className="text-gray-400">تابع نشاط موقعك وأعداد الزائرين</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
         <div className="bg-egypt-dark p-6 rounded-2xl border border-gold-500/20">
            <div className="flex items-center gap-4 mb-4 text-gold-500">
               <Users className="w-8 h-8" />
               <h3 className="text-xl font-bold text-white">إجمالي الزيارات</h3>
            </div>
            <p className="text-4xl font-black">{totalVisits}</p>
         </div>
         <div className="bg-egypt-dark p-6 rounded-2xl border border-gold-500/20">
            <div className="flex items-center gap-4 mb-4 text-gold-500">
               <Monitor className="w-8 h-8" />
               <h3 className="text-xl font-bold text-white">الزوار الفريدين</h3>
            </div>
            <p className="text-4xl font-black">{uniqueVisitors}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         <div className="bg-egypt-dark p-8 rounded-3xl border border-gold-500/10">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
               <MapPin className="text-gold-500" />
               الزيارات حسب الدولة
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={countryData}
                       cx="50%"
                       cy="50%"
                       outerRadius={80}
                       fill="#D4AF37"
                       dataKey="value"
                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                       {countryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-egypt-dark p-8 rounded-3xl border border-gold-500/10 overflow-hidden">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
               <Clock className="text-gold-500" />
               أحدث الزيارات
            </h3>
            <div className="space-y-4 h-80 overflow-y-auto pr-2 custom-scrollbar">
               {visits.slice(0, 10).map((v, i) => (
                  <div key={v.id || i} className="bg-egypt-black p-4 rounded-xl text-sm border border-gold-500/5 hover:border-gold-500/20 transition-colors">
                     <div className="flex justify-between text-gray-400 mb-2">
                        <span>{v.createdAt?.toDate ? v.createdAt.toDate().toLocaleString('ar-EG') : 'الآن'}</span>
                        <span className="text-gold-500 font-medium">{v.country} - {v.city}</span>
                     </div>
                     <p className="truncate text-xs opacity-60" dir="ltr">{v.userAgent}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
