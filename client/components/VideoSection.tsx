import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function VideoSection() {
    const [content, setContent] = useState<any>(null);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'page_content', 'page_home'), (docSnap) => {
            if (docSnap.exists()) {
                setContent(docSnap.data());
            }
        });
        return () => unsub();
    }, []);

    const videoTitle = content?.video_section_title || "Campus Tour";
    const sourceType = content?.video_source_type || "youtube";
    const youtubeUrl = content?.video_youtube_url || "https://www.youtube.com/embed/dQw4w9WgXcQ";
    const uploadedVideoUrl = content?.video_upload || "";

    // Helper to extract embed URL if a normal watch URL is pasted
    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        let embedUrl = url;
        if (url.includes('watch?v=')) {
            embedUrl = url.replace('watch?v=', 'embed/');
            // Handle additional parameters after the video ID
            if (embedUrl.includes('&')) {
                embedUrl = embedUrl.substring(0, embedUrl.indexOf('&'));
            }
        } else if (url.includes('youtu.be/')) {
            embedUrl = url.replace('youtu.be/', 'youtube.com/embed/');
            if (embedUrl.includes('?')) {
                embedUrl = embedUrl.substring(0, embedUrl.indexOf('?'));
            }
        }

        // Add autoplay and mute parameters (browsers require mute for auto-play)
        const hasParams = embedUrl.includes('?');
        return embedUrl + (hasParams ? '&' : '?') + 'autoplay=1&mute=1';
    };

    return (
        <section className="w-full py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0B0B3B] mb-4">
                        {videoTitle}
                    </h2>
                    <div className="w-24 h-1 bg-[#FF4040] mx-auto rounded-full"></div>
                </div>

                <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video ring-4 ring-gray-100">
                    {sourceType === 'youtube' ? (
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src={getEmbedUrl(youtubeUrl)}
                            title={videoTitle}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    ) : uploadedVideoUrl ? (
                        <video
                            className="absolute inset-0 w-full h-full object-cover"
                            src={uploadedVideoUrl}
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                            controlsList="nodownload"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-100 font-medium">
                            Video not available
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
