import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ClipboardCheck, DollarSign, CalendarDays, FileCheck, Globe, FileText, Users, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useSectionVisibility } from '@/hooks/useSectionVisibility';

interface AdmissionDates {
    applicationStart: string;
    applicationEnd: string;
    examDate: string;
    meritDate: string;
}

interface AdmissionHero {
    title?: string;
    subtitle?: string;
    images?: {
        hero_bg?: string;
    }
}

export default function AdmissionsPage() {
    const { isVisible } = useSectionVisibility();
    // Default Static Data (Fallback)
    const [loading, setLoading] = useState(true);
    const [steps, setSteps] = useState<any[]>(() => {
        const cached = localStorage.getItem('cache_admission_steps');
        return cached ? JSON.parse(cached) : [];
    });
    const [scholarships, setScholarships] = useState<any[]>(() => {
        const cached = localStorage.getItem('cache_admission_scholarships');
        return cached ? JSON.parse(cached) : [];
    });
    const [heroContent, setHeroContent] = useState<AdmissionHero>(() => {
        const cached = localStorage.getItem('cache_admission_hero');
        return cached ? JSON.parse(cached) : { title: "Admissions", subtitle: "Start Your Journey Towards A Bright Future - Admission Process Made Simple" };
    });

    const [dates, setDates] = useState<AdmissionDates>(() => {
        const cached = localStorage.getItem('cache_admission_dates');
        return cached ? JSON.parse(cached) : {
            applicationStart: '-',
            applicationEnd: '-',
            examDate: '-',
            meritDate: '-'
        };
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [datesSnap, stepsSnap, scholarSnap] = await Promise.all([
                    getDoc(doc(db, 'admissions_content', 'dates')),
                    getDoc(doc(db, 'admissions_content', 'steps')),
                    getDoc(doc(db, 'admissions_content', 'scholarships'))
                ]);

                if (datesSnap.exists()) {
                    const data = datesSnap.data() as AdmissionDates;
                    setDates(data);
                    localStorage.setItem('cache_admission_dates', JSON.stringify(data));
                }

                if (stepsSnap.exists()) {
                    const data = stepsSnap.data().items || [];
                    setSteps(data);
                    localStorage.setItem('cache_admission_steps', JSON.stringify(data));
                }

                if (scholarSnap.exists()) {
                    const data = scholarSnap.data().items || [];
                    setScholarships(data);
                    localStorage.setItem('cache_admission_scholarships', JSON.stringify(data));
                }
                setLoading(false);
            } catch (err) {
                console.error("Error loading admission content:", err);
                setLoading(false);
            }
        };
        loadData();

        // New Page Content Listener for Hero
        const unsub = onSnapshot(doc(db, 'page_content', 'page_admissions'), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setHeroContent(data);
                localStorage.setItem('cache_admission_hero', JSON.stringify(data));
            }
        });
        return () => unsub();
    }, []);

    const ensureAbsoluteUrl = (url: string) => {
        if (!url) return '#';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    return (
        <div className="min-h-screen bg-white font-poppins">
            <Header />

            {/* Hero Section */}
            {isVisible('admissionHero') && (
                <section className="relative w-full text-white py-20 overflow-hidden">
                    {heroContent?.images?.hero_bg ? (
                        <>
                            <div className="absolute inset-0 z-0">
                                <img
                                    src={heroContent.images.hero_bg}
                                    alt="Hero"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60"></div>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0B3B] to-[#1a1a5e] z-0">
                            <div className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                                    backgroundSize: '40px 40px'
                                }}
                            />
                        </div>
                    )}

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
                                {heroContent?.title || "Admissions"}
                            </h1>
                            <p className="text-lg md:text-xl text-blue-200 leading-relaxed">
                                {heroContent?.subtitle || "Start Your Journey Towards A Bright Future - Admission Process Made Simple"}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* How to Apply Section */}
            <section className="py-20 bg-[#0B4EA2] text-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">How to apply</h2>

                    {loading && steps.length === 0 ? (
                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-white/10 animate-pulse rounded-3xl"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            {steps.map((item, idx) => {
                                const IconComponent = {
                                    'ClipboardCheck': ClipboardCheck,
                                    'FileCheck': FileCheck,
                                    'Globe': Globe,
                                    'FileText': FileText,
                                    'Users': Users,
                                    'GraduationCap': GraduationCap
                                }[item.icon || 'ClipboardCheck'] || ClipboardCheck;

                                return (
                                    <div key={idx} className="p-6 border-l-2 border-white/30 h-full flex flex-col">
                                        <div className="flex items-start gap-4 mb-4">
                                            <span className="text-6xl font-light opacity-50">{item.step}</span>
                                            <IconComponent className="w-12 h-12 text-[#4ade80]" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                        <p className="text-blue-100 text-sm mb-6 flex-grow">{item.desc}</p>

                                        {item.buttonLabel && (
                                            <a
                                                href={item.buttonLink || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-[#5CB85C] hover:bg-[#4CAE4C] text-white font-bold py-2 px-6 rounded transition-colors text-center inline-block w-full"
                                            >
                                                {item.buttonLabel}
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Scholarship Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-[#333] mb-16">Scholarship</h2>

                    <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">

                        {/* MYSY */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-[#333] leading-tight">
                                MYSY (Mukhyamantri Yuva Swalamban Yojana)
                            </h3>
                            <div className="space-y-4 text-gray-600">
                                <div>
                                    <strong className="block text-[#0B0B3B] mb-1">Eligibility:</strong>
                                    <p className="leading-relaxed">Student must have secured 80 or more Percentile in 12th Science and family income must be less than Rs. 6 lakh/annum.</p>
                                </div>
                                <div>
                                    <strong className="block text-[#0B0B3B] mb-1">Amount of Scholarship:</strong>
                                    <p>Rs. 50,000/- or 50% of tuition fees, whichever is less.</p>
                                </div>
                            </div>
                        </div>

                        {/* Freeship Card */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-[#333] leading-tight">
                                Freeship Card for Scheduled Caste Candidates for Post Metric Scholarship
                            </h3>
                            <div className="space-y-4 text-gray-600">
                                <div>
                                    <strong className="block text-[#0B0B3B] mb-1">Eligibility:</strong>
                                    <p className="leading-relaxed">The student must belong to the SC or ST category, and family income must be less than Rs. 2,50,000 per annum.</p>
                                </div>
                                <div>
                                    <strong className="block text-[#0B0B3B] mb-1">Amount of Scholarship:</strong>
                                    <p>100% of tuition fees.</p>
                                </div>
                            </div>
                        </div>

                        {/* TFWS */}
                        <div className="md:col-span-2 space-y-4 pt-8 border-t border-gray-100">
                            <h3 className="text-2xl font-semibold text-[#333]">
                                Tuition Fee Waiver Scheme (TFWS)
                            </h3>
                            <div className="text-gray-600 space-y-4">
                                <ol className="list-decimal pl-5 space-y-2 leading-relaxed marker:font-bold marker:text-[#0B0B3B]">
                                    <li>Under the TFW scheme, students do not have to pay tuition fees (Rs. 60,000 to Rs. 1,00,000 approx) in SFI.</li>
                                    <li>5% of total seats shall be filled by TFW scheme, e.g. 60 seats then 3 seats shall be filled by TFWS.</li>
                                    <li>Students whose parent's income is less than Rs. 6 lakh per year are eligible for TFWS.</li>
                                    <li>Admission is strictly based on merit, as determined by the admissions committee.</li>
                                    <li>The TFW scheme shall be applicable for the complete duration of the course (4 Years).</li>
                                    <li>To get the benefits of the TFW Scheme, the candidate has to submit the income certificate issued after 31st March from either 'Mamlatdar' or "Taluka Development Officer (TDO)" or 'the Collector (Jan Seva Kendra)' at the time of application form filling registration for admission.</li>
                                    <li>No other document shall be considered valid (e.g. an Income tax return or a Certificate issued by the 'Sarpanch').</li>
                                </ol>
                            </div>
                        </div>

                        {/* SEBC/OBC */}
                        <div className="md:col-span-2 space-y-4 pt-8 border-t border-gray-100">
                            <h3 className="text-2xl font-semibold text-[#333]">
                                Scholarship for the SEBC/OBC Category
                            </h3>
                            <div className="grid md:grid-cols-2 gap-8 text-gray-600">
                                <div>
                                    <strong className="block text-[#0B0B3B] mb-2">Eligibility:</strong>
                                    <p className="leading-relaxed">The student must belong to the OBC category, and family income must be less than Rs. 2,50,000 per annum.</p>
                                </div>
                                <div>
                                    <strong className="block text-[#0B0B3B] mb-2">Amount of Scholarship:</strong>
                                    <p>Rs. 50,000</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            {/* CTA Banner */}
            <section className="relative h-[300px] md:h-[400px] bg-gradient-to-r from-[#0B4EA2] to-[#0B0B3B] flex items-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl text-white pl-8 md:pl-16 border-l-4 border-white">
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Discover endless <br /> opportunities
                        </h2>
                        <Link to="/contact" className="bg-white text-black text-lg font-bold py-3 px-8 rounded hover:bg-gray-100 transition-colors inline-block">
                            Apply Now
                        </Link>
                    </div>
                </div>
            </section>

            {/* Dynamic Scholarship Section (The one from Admin Panel) */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="bg-white rounded-3xl p-10 shadow-lg border border-gray-100">
                        <h2 className="text-3xl font-bold text-[#0B0B3B] mb-8 text-center">
                            Other Scholarship Opportunities
                        </h2>
                        {loading && scholarships.length === 0 ? (
                            <div className="grid md:grid-cols-2 gap-8">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-2xl"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                                {scholarships.map((scholarship, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row items-start gap-4 p-4 hover:bg-blue-50/50 rounded-xl transition-colors border border-transparent hover:border-blue-100">
                                        <div className="p-3 bg-blue-50 rounded-lg text-4xl flex-shrink-0">
                                            {scholarship.icon || '🎓'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{scholarship.name}</h3>
                                            <div className="space-y-2 text-gray-600 text-sm mb-4">
                                                <div>
                                                    <span className="font-semibold text-[#0B0B3B]">Eligibility: </span>
                                                    {scholarship.eligibility}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-[#0B0B3B]">Amount: </span>
                                                    {scholarship.amount}
                                                </div>
                                            </div>
                                            {scholarship.link ? (
                                                <a
                                                    href={ensureAbsoluteUrl(scholarship.link)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-blue-600 font-bold hover:underline"
                                                >
                                                    Apply Now <span className="ml-1">→</span>
                                                </a>
                                            ) : (
                                                <button
                                                    onClick={() => alert("Please contact college administration for details.")}
                                                    className="inline-flex items-center text-blue-600 font-bold hover:underline"
                                                >
                                                    Apply Now <span className="ml-1">→</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
