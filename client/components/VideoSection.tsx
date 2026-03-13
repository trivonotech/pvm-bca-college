import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function VideoSection() {
    const [content, setContent] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'page_content', 'page_home'), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Look for video_showcase sub-object or top-level video fields
                if (data.video_showcase) {
                    setContent(data.video_showcase);
                } else if (data.video_url) {
                    setContent(data);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!content) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
                if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
                    if (content.video_autoplay === 'Yes') {
                        handlePlay();
                    }
                } else {
                    handlePause();
                }
            },
            { threshold: [0, 0.3, 1] }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [content]);

    const handlePlay = () => {
        if (content?.video_url?.includes('youtube.com') || content?.video_url?.includes('youtu.be')) {
            iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        } else {
            videoRef.current?.play().catch(() => { });
        }
    };

    const handlePause = () => {
        if (content?.video_url?.includes('youtube.com') || content?.video_url?.includes('youtu.be')) {
            iframeRef.current?.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        } else {
            videoRef.current?.pause();
        }
    };

    if (!content || !content.video_url) return null;

    const isYouTube = content.video_url.includes('youtube.com') || content.video_url.includes('youtu.be');

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const ytId = isYouTube ? getYouTubeId(content.video_url) : null;
    const embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}?enablejsapi=1&autoplay=${content.video_autoplay === 'Yes' ? 1 : 0}&loop=${content.video_loop === 'Yes' ? 1 : 0}&playlist=${ytId}&mute=1&controls=${content.video_controls === 'Yes' ? 1 : 0}` : '';

    return (
        <section ref={containerRef} className="py-20 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-[2.5rem] overflow-hidden border-[12px] border-slate-600/5 bg-slate-900 shadow-2xl aspect-video"
                >
                    {isYouTube ? (
                        <iframe
                            ref={iframeRef}
                            src={embedUrl}
                            className="w-full h-full pointer-events-auto"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            src={content.video_url}
                            loop={content.video_loop === 'Yes'}
                            muted
                            playsInline
                            className="w-full h-full object-contain"
                            controls={content.video_controls === 'Yes'}
                        />
                    )}

                    {/* Text Overlay */}
                    {content.video_show_text === 'Yes' && (
                        <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end pointer-events-none">
                            <div className="max-w-3xl pointer-events-auto">
                                {content.video_badge && (
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider mb-4 shadow-lg shadow-blue-600/30">
                                        {content.video_badge}
                                    </span>
                                )}
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                                    {content.video_title}
                                </h2>
                                <p className="text-gray-200 text-lg md:text-xl mb-8 line-clamp-2">
                                    {content.video_desc}
                                </p>
                                {content.video_cta_text && (
                                    <a
                                        href={content.video_cta_link || '#'}
                                        className="inline-flex items-center px-8 py-4 bg-white text-blue-900 rounded-2xl font-bold hover:bg-blue-50 transition-all hover:scale-105 shadow-xl"
                                    >
                                        {content.video_cta_text}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
