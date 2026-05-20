import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';

export default function SchemaData() {
    const [seoData, setSeoData] = useState<any>(null);
    const location = useLocation();

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'settings', 'seo'), (docSnap) => {
            if (docSnap.exists()) {
                setSeoData(docSnap.data());
            } else {
                setSeoData(null);
            }
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!seoData) return;

        // Cleanup existing script if any
        const existingScript = document.getElementById('json-ld-schema');
        if (existingScript) existingScript.remove();

        // JSON-LD Schema (Only if enabled)
        if (seoData.structuredDataEnabled) {
            const schemas: any[] = [];
            const origin = "https://www.bcakeshod.com"; // Correct canonical origin
            const pathname = location.pathname;

            if (pathname === '/') {
                // 1. CollegeOrUniversity Schema
                schemas.push({
                    "@context": "https://schema.org",
                    "@type": "CollegeOrUniversity",
                    "name": seoData.collegeName || "PVM BCA College Keshod",
                    "alternateName": "PVM Computer Science College Keshod",
                    "url": origin,
                    "logo": `${origin}/favicon.png`,
                    "image": `${origin}/images/pvm-bca-college-keshod-og.jpg`,
                    "description": seoData.metaDescription || "PVM BCA College is a leading Bachelor of Computer Applications (BCA) college in Keshod, Gujarat. Offering quality computer science education with modern labs and experienced faculty.",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": seoData.address || "Veraval Road",
                        "addressLocality": "Keshod",
                        "addressRegion": "Gujarat",
                        "postalCode": "362220",
                        "addressCountry": "IN"
                    },
                    "geo": {
                        "@type": "GeoCoordinates",
                        "latitude": 21.3014,
                        "longitude": 70.2453
                    },
                    "telephone": seoData.phone || "+919687451774",
                    "email": seoData.email || "pvmbcacollege@gmail.com",
                    "openingHours": "Mo-Sa 09:00-17:00",
                    "sameAs": Object.values(seoData.socialLinks || {}).filter(Boolean)
                });

                // 2. LocalBusiness Schema
                schemas.push({
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    "name": seoData.collegeName || "PVM BCA College",
                    "image": `${origin}/images/pvm-bca-college-keshod-og.jpg`,
                    "@id": origin,
                    "url": origin,
                    "telephone": seoData.phone || "+919687451774",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": seoData.address || "Veraval Road",
                        "addressLocality": "Keshod",
                        "addressRegion": "GJ",
                        "postalCode": "362220",
                        "addressCountry": "IN"
                    },
                    "openingHoursSpecification": {
                        "@type": "OpeningHoursSpecification",
                        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                        "opens": "09:00",
                        "closes": "17:00"
                    },
                    "priceRange": "₹₹"
                });

                // 3. FAQPage Schema
                schemas.push({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "PVM BCA College Keshod mein admission kaise lein?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "PVM BCA College Keshod mein admission ke liye 12th pass hona zaroori hai. Aap college visit karein ya 96874 51774 par call karein. Admission process simple hai aur guidance milti hai."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "BCA course ki fees kitni hai PVM College Keshod mein?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "PVM BCA College mein fees Gujarat government ke norms ke anusaar hain. Exact fees ke liye college se directly sampark karein: pvmbcacollege@gmail.com ya 96874 51774."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "PVM BCA College kahan hai?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "PVM BCA College Veraval Road, Keshod, Gujarat mein sthit hai. Keshod, Junagadh district mein hai. College ka phone number hai: +91 96874 51774."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "BCA karne ke baad kya career options hain?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "BCA ke baad software developer, web developer, database administrator, IT support, MCA, MBA-IT, ya government IT jobs ki taraf ja sakte hain. PVM College placement support bhi deta hai."
                            }
                        }
                    ]
                });
            } else {
                // Inner pages: BreadcrumbList Schema
                const parts = pathname.split('/').filter(Boolean);
                const itemListElement = [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": origin + "/"
                    }
                ];

                let accumulatedPath = '';
                parts.forEach((part, index) => {
                    accumulatedPath += `/${part}`;
                    const formattedName = part
                        .split(/[-_]/)
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    itemListElement.push({
                        "@type": "ListItem",
                        "position": index + 2,
                        "name": formattedName,
                        "item": origin + accumulatedPath
                    });
                });

                schemas.push({
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": itemListElement
                });
            }

            const script = document.createElement('script');
            script.id = 'json-ld-schema';
            script.type = 'application/ld+json';
            script.innerHTML = JSON.stringify(schemas);
            document.head.appendChild(script);
        }

        // Add Verification Meta if exists
        if (seoData.googleVerification) {
            let meta = document.querySelector('meta[name="google-site-verification"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', 'google-site-verification');
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', seoData.googleVerification);
        }

        // Add Global Keywords
        if (seoData.keywords) {
            let keywordsMeta = document.querySelector('meta[name="keywords"]');
            if (!keywordsMeta) {
                keywordsMeta = document.createElement('meta');
                keywordsMeta.setAttribute('name', 'keywords');
                document.head.appendChild(keywordsMeta);
            }
            keywordsMeta.setAttribute('content', seoData.keywords);
        }

        return () => {
            const scriptToRemove = document.getElementById('json-ld-schema');
            if (scriptToRemove) scriptToRemove.remove();
        };
    }, [seoData, location.pathname]);

    return null;
}
