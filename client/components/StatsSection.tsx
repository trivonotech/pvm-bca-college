import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function StatsSection() {
  const [content, setContent] = useState<any>(() => {
    const cached = localStorage.getItem('cache_home_page_content');
    return cached ? JSON.parse(cached) : null;
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'page_content', 'page_home'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setContent(data);
        localStorage.setItem('cache_home_page_content', JSON.stringify(data));
      }
    });
    return () => unsub();
  }, []);

  const stats = [
    {
      number: content?.stat1_number || '10000+',
      label: content?.stat1_label || 'Students shown faith in us',
    },
    {
      number: content?.stat2_number || '50',
      label: content?.stat2_label || 'Events',
    },
    {
      number: content?.stat3_number || '15+',
      label: content?.stat3_label || 'Experience',
    },
    {
      number: content?.stat4_number || '10+',
      label: content?.stat4_label || 'Courses Offered',
    },
  ];

  return (
    <section className="py-12 md:py-20 bg-gradient-to-r from-red-900 via-red-800 to-red-900 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-8 right-16 w-32 h-32 border border-red-400 rounded-2xl opacity-50" />
        <div className="absolute bottom-8 left-20 w-24 h-24 border-2 border-red-400 rounded-full opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-pink-200 mb-2">
                {stat.number}
              </div>
              <p className="text-sm md:text-base text-pink-100 leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
