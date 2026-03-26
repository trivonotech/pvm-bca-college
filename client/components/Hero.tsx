import React, { useEffect, useState } from "react";
import heroIllustration from "../assets/hero-illustration.png";
import decoBulb from "../assets/deco-bulb.png";
import decoBook from "../assets/deco-book.png";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";

export function Hero() {
    const [content, setContent] = useState<any>(() => {
        const cached = localStorage.getItem('cache_page_home');
        return cached ? JSON.parse(cached) : null;
    });

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'page_content', 'page_home'), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setContent(data);
                localStorage.setItem('cache_page_home', JSON.stringify(data));
            }
        });
        return () => unsub();
    }, []);

    return (
        <section className="relative w-full min-h-[90vh] bg-[#FDFDFF] overflow-hidden flex flex-col items-center font-sans pt-10 lg:pt-16 mb-[46px]">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.2
                }}
            />

            {/* Heading Section - Centered at top */}
            <div className="relative z-20 text-center mb-0 lg:mb-10 w-full max-w-5xl px-4">
                <div className="relative inline-block">
                    <img src={decoBulb} className="absolute -left-12 -top-6 w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 animate-pulse-slow" alt="Innovation and Creativity at PVM BCA College" />
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-[#0B0B3B] leading-tight tracking-tight">
                        {content?.title ? (
                            <div dangerouslySetInnerHTML={{ __html: content.title.replace(/\n/g, '<br/>') }} />
                        ) : (
                            <>
                                Education That <span className="whitespace-nowrap">Builds <img src={decoBook} className="inline-block w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 ml-2 -mt-2 lg:-mt-4 align-middle animate-bounce-slow" alt="Comprehensive Learning Materials" /></span> <br />
                                <span className="text-[#0B0B3B]">Capable Professionals</span>
                            </>
                        )}
                    </h1>
                </div>
                <p className="text-gray-600 text-sm md:text-base lg:text-lg max-w-3xl mx-auto mt-6 font-medium leading-relaxed">
                    {content?.description || "Undergraduate Programs In Business Administration And Science Designed To Develop Practical Skills, Analytical Thinking, And Career Readiness."}
                </p>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-4 relative z-10 flex-grow flex flex-col lg:flex-row items-end lg:items-center justify-between pointer-events-none">

                {/* Left: Illustration (Boy) */}
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-start pointer-events-auto mt-8 lg:mt-0">
                    <img
                        src={content?.images?.hero || heroIllustration}
                        alt="A student successfully graduating from PVM BCA College - Best BCA Education"
                        className="w-full max-w-xs lg:max-w-xl object-contain transform lg:translate-x-12"
                    />
                </div>

                {/* 'Start Your Journey' Button - Relative on mobile, Absolute on Desktop */}
                <div className="relative w-full flex justify-center mt-6 lg:mt-0 lg:absolute lg:top-[35%] lg:right-24 z-30 pointer-events-auto lg:transform lg:-translate-y-1/2 lg:justify-end lg:w-auto lg:pr-0">
                    <Link
                        to={content?.hero_cta_link || "/admissions"}
                        className="group relative inline-flex items-center justify-center px-8 py-3 text-sm font-bold text-white transition-all duration-200 bg-[#0B0B3B] rounded-full hover:bg-[#1a1a5e] shadow-xl hover:shadow-2xl hover:-translate-y-1"
                    >
                        {content?.hero_cta_text || "Start Your Journey"}
                        <span className="ml-2 tracking-widest text-[#FACC15] group-hover:translate-x-1 transition-transform">
                            {">>>>"}
                        </span>
                    </Link>
                </div>

            </div>
        </section>
    );
}
