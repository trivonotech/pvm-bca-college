import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { updateSEOMeta } from '@/utils/seo';

export default function DynamicPage() {
    const { slug } = useParams<{ slug: string }>();
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!page) return;
        const plainTextContent = page.content?.replace(/[#*`\n]/g, ' ').slice(0, 155);
        updateSEOMeta({
            title: `${page.title} | Administration | PVM BCA College Keshod`,
            description: `${plainTextContent || `Learn about ${page.title} under administration department at PVM BCA College Keshod.`}`,
            image: page.image || '/favicon.png',
            url: window.location.href
        });
    }, [page]);

    useEffect(() => {
        const fetchPage = async () => {
            if (!slug) return;
            try {
                const q = query(collection(db, 'dynamic_pages'), where('slug', '==', slug));
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    setPage({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
                } else {
                    setPage(null);
                }
            } catch (error) {
                console.error("Error fetching page:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!page) {
        return <Navigate to="/404" replace />;
    }

    return (
        <div className="min-h-screen bg-white font-poppins">
            <Header />

            <div className="pt-12 min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="grid md:grid-cols-12 gap-0">

                            {/* Left Side: Profile Photo */}
                            <div className="md:col-span-4 bg-[#f8fafc] p-8 flex flex-col items-center justify-start border-r border-gray-100">
                                <div className="w-64 h-64 md:w-full md:h-auto md:aspect-square rounded-2xl overflow-hidden shadow-md mb-6 border-4 border-white">
                                    {page.image ? (
                                        <img
                                            src={page.image}
                                            alt={page.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <span className="text-gray-400">No Photo</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Side: Content */}
                            <div className="md:col-span-8 p-8 md:p-12">
                                <h1 className="text-3xl md:text-4xl font-bold text-[#0B0B3B] mb-6 pb-4 border-b-2 border-gray-100">
                                    {page.title}
                                </h1>

                                <div className="prose prose-lg prose-slate max-w-none text-gray-700 leading-relaxed text-justify whitespace-pre-wrap">
                                    {page.content}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
