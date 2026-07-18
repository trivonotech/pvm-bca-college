import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Faculty } from '@/../../shared/types';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Mail, Phone, Award, Shield, User, GraduationCap, Clock, Layers } from 'lucide-react';

export default function StaffPage() {
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');

    useEffect(() => {
        const q = query(collection(db, 'faculty'), orderBy('order', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const facultyData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Faculty[];
            setFaculty(facultyData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching faculty members:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Get list of departments for filter buttons
    const departments = useMemo(() => {
        const list = new Set(faculty.map(f => f.department));
        return ['All', ...Array.from(list)];
    }, [faculty]);

    // Filtered staff members
    const filteredFaculty = useMemo(() => {
        if (selectedDepartment === 'All') return faculty;
        return faculty.filter(member => member.department === selectedDepartment);
    }, [faculty, selectedDepartment]);

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-poppins">
            <Header />

            {/* Premium Page Hero */}
            <section className="relative w-full text-white py-20 overflow-hidden bg-gradient-to-br from-[#0B0B3B] to-[#1a1a5e]">
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                            Our Dedicated Staff
                        </h1>
                        <p className="text-lg md:text-xl text-blue-200 leading-relaxed max-w-2xl mx-auto">
                            Meet the experienced educators, administrators, and support staff members driving academic excellence at PVM BCA College.
                        </p>
                    </div>
                </div>
            </section>

            {/* Public Staff List / Content */}
            <section className="py-16">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Department Filtering Buttons */}
                    {departments.length > 1 && (
                        <div className="flex flex-wrap justify-center gap-3 mb-12">
                            {departments.map((dept) => (
                                <button
                                    key={dept}
                                    onClick={() => setSelectedDepartment(dept)}
                                    className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${
                                        selectedDepartment === dept
                                            ? 'bg-[#FF4040] text-white shadow-lg'
                                            : 'bg-white text-[#0B0B3B] border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 border-4 border-[#0B0B3B] border-t-[#FF4040] rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-semibold mt-4">Loading Staff Directory...</p>
                        </div>
                    ) : filteredFaculty.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-md mx-auto">
                            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800">No staff members found</h3>
                            <p className="text-gray-500 mt-2">Check back soon for updates!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredFaculty.map((member) => (
                                <div
                                    key={member.id}
                                    className="bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col p-6 items-center text-center group hover:-translate-y-1 relative"
                                >
                                    {/* Circular Profile Image */}
                                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-gray-100 shadow-md mb-4 shrink-0 bg-gradient-to-br from-[#BFD8FF]/30 to-gray-100 flex items-center justify-center">
                                        {member.image ? (
                                            <img
                                                src={member.image}
                                                alt={member.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <span className="text-[#0B0B3B] font-bold text-4xl">
                                                {member.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Department label */}
                                    <span className="px-3 py-1 text-[9px] uppercase tracking-wider font-extrabold bg-[#0B0B3B]/5 text-[#0B0B3B] rounded-full mb-2">
                                        {member.department}
                                    </span>

                                    {/* Name */}
                                    <h3 className="text-xl font-bold text-[#0F4C47] tracking-tight line-clamp-2">
                                        {member.name}
                                    </h3>

                                    {/* Designation */}
                                    <p className="text-[11px] font-extrabold text-[#9B775C] uppercase tracking-widest mt-1.5 leading-relaxed">
                                        {member.designation}
                                    </p>

                                    {/* Small Separator Line */}
                                    <div className="w-12 h-1 bg-gray-200/80 rounded-full mt-3.5 mb-2.5"></div>

                                    {/* Other Details (Qualification, Exp) */}
                                    <div className="mt-1 space-y-0.5 text-xs text-gray-500 w-full">
                                        {member.qualification && (
                                            <div className="font-semibold text-gray-700">
                                                {member.qualification}
                                            </div>
                                        )}
                                        {member.specialization && (
                                            <div className="text-[11px] text-gray-400 italic line-clamp-1">
                                                {member.specialization}
                                            </div>
                                        )}
                                        {member.experience && (
                                            <div className="text-[10px] uppercase font-bold text-gray-400">
                                                {member.experience} Exp
                                            </div>
                                        )}
                                    </div>

                                    {/* Contact info action links */}
                                    {(member.email || member.phone) && (
                                        <div className="mt-4 w-full flex gap-2">
                                            {member.email && (
                                                <a
                                                    href={`mailto:${member.email}`}
                                                    className="flex-1 py-2 bg-gray-50 hover:bg-red-50 hover:text-[#FF4040] text-gray-600 rounded-xl transition-all flex items-center justify-center gap-1.5 text-[11px] font-bold border border-gray-100"
                                                    title={member.email}
                                                >
                                                    <Mail className="w-3 h-3" /> Email
                                                </a>
                                            )}
                                            {member.phone && (
                                                <a
                                                    href={`tel:${member.phone}`}
                                                    className="flex-1 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-xl transition-all flex items-center justify-center gap-1.5 text-[11px] font-bold border border-gray-100"
                                                    title={member.phone}
                                                    >
                                                        <Phone className="w-3 h-3" /> Call
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
