import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useSectionVisibility } from '@/hooks/useSectionVisibility';

export default function TopStudents() {
    const { isVisible } = useSectionVisibility();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<any[]>(() => {
        const cached = localStorage.getItem('cache_top_students');
        return cached ? JSON.parse(cached) : [];
    });

    // Fetch Top Students Dynamically
    useEffect(() => {
        const q = query(collection(db, 'top_students'), orderBy('rank'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStudents(data);
            localStorage.setItem('cache_top_students', JSON.stringify(data));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (!isVisible('topStudents')) return null;

    // Skeleton Loader
    if (loading && students.length === 0) {
        return (
            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="h-12 w-48 bg-gray-200 animate-pulse rounded-lg mb-12"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-3xl"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="pt-0 md:pt-0 pb-16 md:pb-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-12 md:mb-16 font-grotesk">
                    Top Student
                </h2>

                {/* Students Grid - Desktop */}
                <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {students.map((student, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center p-4 transition-all duration-300 hover:-translate-y-2 group"
                        >
                            <div className="relative w-36 h-36 md:w-44 md:h-44 mb-6">
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-200 to-blue-300 overflow-hidden shadow-lg border-4 border-blue-100 group-hover:border-blue-400 transition-colors duration-300">
                                    {student.image ? (
                                        <img src={student.image} alt={student.name} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-blue-600">
                                            {student.name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-md transition-transform duration-300 group-hover:scale-110">
                                    {student.rank}
                                </div>
                            </div>

                            <div className="text-center w-full">
                                <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                                    {student.name}
                                </h4>
                                <p className="text-sm font-semibold text-blue-600 mb-1">
                                    {student.course}
                                </p>
                                <p className="text-xs md:text-sm text-gray-500 font-medium max-w-[220px] mx-auto">
                                    {student.achievement}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Students Grid - Mobile */}
                <div className="md:hidden">
                    {/* First Row */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        {students.slice(0, 3).map((student, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className="relative w-24 h-24 mb-3">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-200 to-blue-300 overflow-hidden shadow-md">
                                        {student.image ? (
                                            <img src={student.image} alt={student.name} className="w-full h-full object-cover object-top" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-blue-600">
                                                {student.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs shadow-md">
                                        {student.rank}
                                    </div>
                                </div>
                                <div className="text-center w-full">
                                    <h4 className="text-sm font-bold text-gray-900 mb-1 truncate px-1">{student.name}</h4>
                                    <p className="text-xs text-gray-600 truncate px-1">{student.course}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        {students.slice(3, 6).map((student, index) => (
                            <div key={index + 3} className="flex flex-col items-center">
                                <div className="relative w-24 h-24 mb-3">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-200 to-blue-300 overflow-hidden shadow-md">
                                        {student.image ? (
                                            <img src={student.image} alt={student.name} className="w-full h-full object-cover object-top" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-blue-600">
                                                {student.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs shadow-md">
                                        {student.rank}
                                    </div>
                                </div>
                                <div className="text-center w-full">
                                    <h4 className="text-sm font-bold text-gray-900 mb-1 truncate px-1">{student.name}</h4>
                                    <p className="text-xs text-gray-600 truncate px-1">{student.course}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Third Row */}
                    <div className="grid grid-cols-6 gap-3">
                        {students.slice(6, 8).map((student, index) => (
                            <div
                                key={index + 6}
                                className="flex flex-col items-center col-span-2"
                                style={{ gridColumnStart: index === 0 ? 2 : 4 }}
                            >
                                <div className="relative w-24 h-24 mb-3">
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-200 to-blue-300 overflow-hidden shadow-md">
                                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-blue-600">
                                            {student.name[0]}
                                        </div>
                                    </div>
                                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs shadow-md">
                                        {student.rank}
                                    </div>
                                </div>
                                <div className="text-center w-full">
                                    <h4 className="text-sm font-bold text-gray-900 mb-1 truncate px-1">{student.name}</h4>
                                    <p className="text-xs text-gray-600 truncate px-1">{student.course}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
