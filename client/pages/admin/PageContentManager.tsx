
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Edit, Eye, Save, X, Upload, Layout, RotateCcw } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { compressImage } from '@/utils/imageUtils';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import heroIllustration from '@/assets/hero-illustration.png';

// --- Types ---
interface PageField {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'image' | 'faq_list' | 'contact_info_list';
    default?: any;
}

interface PageSection {
    id: string;
    title: string;
    fields: PageField[];
}

interface PageConfig {
    sections: PageSection[];
}

// Configuration for each page's editable fields
const PAGE_CONFIG: Record<string, PageConfig> = {
    'page_home': {
        sections: [
            {
                id: 'hero',
                title: 'Hero Section (Top)',
                fields: [
                    { key: 'title', label: 'Main Headline', type: 'text', default: 'Education That Builds Capable Professionals' },
                    { key: 'description', label: 'Description', type: 'textarea', default: 'Undergraduate Programs In Business Administration And Science Designed To Develop Practical Skills, Analytical Thinking, And Career Readiness.' },
                    { key: 'hero', label: 'Hero Image (Boy)', type: 'image', default: heroIllustration },
                    { key: 'hero_cta_text', label: 'CTA Button Text', type: 'text', default: 'Start Your Journey' },
                    { key: 'hero_cta_link', label: 'CTA Button Link', type: 'text', default: '/admissions' },
                ]
            },
            {
                id: 'feature_cards',
                title: 'Feature Cards Section',
                fields: [
                    { key: 'feature1_title', label: 'Card 1 Title', type: 'text', default: 'Courses' },
                    { key: 'feature1_desc', label: 'Card 1 Description', type: 'textarea', default: 'Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry.' },
                    { key: 'feature1_link', label: 'Card 1 Link', type: 'text', default: '/academics' },

                    { key: 'feature2_title', label: 'Card 2 Title', type: 'text', default: 'Study Materials' },
                    { key: 'feature2_desc', label: 'Card 2 Description', type: 'textarea', default: 'Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry.' },
                    { key: 'feature2_link', label: 'Card 2 Link', type: 'text', default: '/student-corner' },

                    { key: 'feature3_title', label: 'Card 3 Title', type: 'text', default: 'Exam Notices' },
                    { key: 'feature3_desc', label: 'Card 3 Description', type: 'textarea', default: 'Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry.' },
                    { key: 'feature3_link', label: 'Card 3 Link', type: 'text', default: '/examinations' },

                    { key: 'feature4_title', label: 'Card 4 Title', type: 'text', default: 'Placements' },
                    { key: 'feature4_desc', label: 'Card 4 Description', type: 'textarea', default: 'Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry.' },
                    { key: 'feature4_link', label: 'Card 4 Link', type: 'text', default: '/placements' },
                ]
            },
            {
                id: 'about_home',
                title: 'About Institute Section',
                fields: [
                    { key: 'about_title', label: 'Section Title', type: 'text', default: 'About Institute' },
                    { key: 'about_desc', label: 'Description', type: 'textarea', default: 'Our Institute Is Dedicated To Delivering Quality Education Through Well-Structured Academic Programs, Experienced Faculty, And A Student-Focused Learning Environment.' }
                ]
            },
            {
                id: 'about_home',
                title: 'About Institute Section',
                fields: [
                    { key: 'about_title', label: 'About Title', type: 'text', default: 'About Institute' },
                    { key: 'about_desc', label: 'About Description', type: 'textarea', default: "Our Institute Is Dedicated To Delivering Quality Education Through Well-Structured Academic Programs, Experienced Faculty, And A Student-Focused Learning Environment. We Aim To Build Strong Academic Foundations While Enhancing Practical Skills That Prepare Students For Real-World Challenges." },
                    { key: 'about_button_link', label: 'About Button Link', type: 'text', default: '/about' }
                ]
            },
            {
                id: 'highlights',
                title: 'Event Highlights',
                fields: [
                    { key: 'highlights_button_link', label: 'View More Link', type: 'text', default: '/student-life' }
                ]
            },
            {
                id: 'video_showcase',
                title: 'Showcase Video Section',
                fields: [
                    { key: 'video_url', label: 'Video URL (YouTube or Direct Link)', type: 'text', default: '' },
                    { key: 'video_badge', label: 'Video Badge', type: 'text', default: 'Virtual Tour' },
                    { key: 'video_title', label: 'Video Title', type: 'text', default: 'Experience Our Campus' },
                    { key: 'video_desc', label: 'Video Description', type: 'textarea', default: 'Watch our video to learn more about our college facilities and student life.' },
                    { key: 'video_cta_text', label: 'CTA Button Text', type: 'text', default: 'Learn More' },
                    { key: 'video_cta_link', label: 'CTA Button Link', type: 'text', default: '/about' },
                    { key: 'video_show_text', label: 'Show Text Overlay (Yes/No)', type: 'text', default: 'Yes' },
                    { key: 'video_autoplay', label: 'Autoplay (Yes/No)', type: 'text', default: 'No' },
                    { key: 'video_loop', label: 'Loop (Yes/No)', type: 'text', default: 'Yes' },
                    { key: 'video_controls', label: 'Show Controls (Yes/No)', type: 'text', default: 'Yes' },
                ]
            },
            {
                id: 'stats',
                title: 'Stats Counter Section',
                fields: [
                    { key: 'stat1_number', label: 'Stat 1 Number', type: 'text', default: '10000+' },
                    { key: 'stat1_label', label: 'Stat 1 Label', type: 'text', default: 'Students shown faith in us' },
                    { key: 'stat2_number', label: 'Stat 2 Number', type: 'text', default: '50' },
                    { key: 'stat2_label', label: 'Stat 2 Label', type: 'text', default: 'Events' },
                    { key: 'stat3_number', label: 'Stat 3 Number', type: 'text', default: '15+' },
                    { key: 'stat3_label', label: 'Stat 3 Label', type: 'text', default: 'Experience' },
                    { key: 'stat4_number', label: 'Stat 4 Number', type: 'text', default: '10+' },
                    { key: 'stat4_label', label: 'Stat 4 Label', type: 'text', default: 'Courses Offered' },
                ]
            }
        ]
    },
    'page_about': {
        sections: [
            {
                id: 'hero',
                title: 'Hero Section',
                fields: [
                    { key: 'title', label: 'Page Title', type: 'text', default: 'About Us' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', default: 'Building Tomorrow\'s Leaders Through Quality Education And Holistic Development' },
                    { key: 'hero_bg', label: 'Hero Background Image', type: 'image', default: '' }
                ]
            },
            {
                id: 'overview',
                title: 'Institute Overview',
                fields: [
                    { key: 'overview_title', label: 'Overview Title', type: 'text', default: 'Institute Overview' },
                    { key: 'overview_text1', label: 'Text Paragraph 1', type: 'textarea', default: 'Established with a vision to provide world-class education, our institute has been at the forefront of academic excellence for over a decade. We are committed to nurturing young minds and transforming them into capable professionals ready to face global challenges.' },
                    { key: 'overview_text2', label: 'Text Paragraph 2', type: 'textarea', default: 'Our state-of-the-art infrastructure, experienced faculty, and industry-aligned curriculum ensure that students receive comprehensive education that balances theoretical knowledge with practical skills.' },
                    { key: 'campus_image', label: 'Campus Image', type: 'image', default: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop' }
                ]
            },
            {
                id: 'vision_mission',
                title: 'Vision & Mission',
                fields: [
                    { key: 'vision_title', label: 'Vision Section Title', type: 'text', default: 'Our Vision' },
                    { key: 'vision', label: 'Vision Statement', type: 'textarea', default: 'To be a globally recognized institution that shapes future leaders through innovative education, research excellence, and character development, while fostering creativity, critical thinking, and social responsibility.' },
                    { key: 'mission_title', label: 'Mission Section Title', type: 'text', default: 'Our Mission' },
                    { key: 'mission_intro', label: 'Mission Intro Text', type: 'text', default: 'The mission of the institution is to:' },
                    { key: 'mission_list', label: 'Mission Points (One per line)', type: 'textarea', default: "Provide quality education with modern teaching methodologies\nDevelop industry-ready professionals with practical skills\nFoster innovation, research, and creative thinking\nBuild strong industry partnerships for placements" }
                ]
            },
            {
                id: 'achievements',
                title: 'Achievements & Accreditations',
                fields: [
                    { key: 'achievements_title', label: 'Section Title', type: 'text', default: 'Achievements & Accreditations' },
                    { key: 'achievements_subtitle', label: 'Section Subtitle', type: 'text', default: 'Recognized for excellence and committed to maintaining the highest standards of education' },
                    { key: 'achievement1_title', label: 'Achievement 1 Title', type: 'text', default: 'Best Institute Award' },
                    { key: 'achievement1_text', label: 'Achievement 1 Description', type: 'textarea', default: 'Recognized as the Best Educational Institute for Academic Excellence in 2023' },
                    { key: 'achievement2_title', label: 'Achievement 2 Title', type: 'text', default: 'NAAC Accredited' },
                    { key: 'achievement2_text', label: 'Achievement 2 Description', type: 'textarea', default: 'Accredited by National Assessment and Accreditation Council with A+ Grade' },
                    { key: 'achievement3_title', label: 'Achievement 3 Title', type: 'text', default: '100% Placement' },
                    { key: 'achievement3_text', label: 'Achievement 3 Description', type: 'textarea', default: 'Achieved 100% placement record for the batch 2022-23 with top companies' }
                ]
            },
            {
                id: 'about_stats',
                title: 'Achievement Stats Section',
                fields: [
                    { key: 'about_stat1_number', label: 'Stat 1 Number', type: 'text', default: '10+' },
                    { key: 'about_stat1_label', label: 'Stat 1 Label', type: 'text', default: 'Years of Excellence' },
                    { key: 'about_stat2_number', label: 'Stat 2 Number', type: 'text', default: '5000+' },
                    { key: 'about_stat2_label', label: 'Stat 2 Label', type: 'text', default: 'Alumni Network' },
                ]
            }
        ]
    },
    'page_contact': {
        sections: [
            {
                id: 'hero',
                title: 'Hero Section',
                fields: [
                    { key: 'title', label: 'Page Title', type: 'text', default: 'Contact Us' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', default: "Get In Touch With Us - We're Here To Help With Your Queries And Admissions" },
                    { key: 'hero_bg', label: 'Hero Background Image', type: 'image', default: '' }
                ]
            },
            {
                id: 'contact_cards',
                title: 'Contact Information Cards',
                fields: [
                    { key: 'contact_cards', label: 'Main Contact Cards', type: 'contact_info_list', default: [] }
                ]
            },
            {
                id: 'quick_contacts',
                title: 'Quick Contact Sidebar',
                fields: [
                    { key: 'quick_contacts', label: 'Manage Quick Contacts', type: 'contact_info_list', default: [] }
                ]
            },
            {
                id: 'visit_campus',
                title: 'Visit Our Campus (Bottom Section)',
                fields: [
                    { key: 'visit_title', label: 'Section Title', type: 'text', default: 'Visit Our Campus' },
                    { key: 'visit_subtitle', label: 'Subtitle', type: 'textarea', default: 'We welcome you to visit our campus and experience the vibrant learning environment. Our admission counselors are available to guide you through our programs and facilities.' },
                    { key: 'visit_cta1_text', label: 'Button 1 Text', type: 'text', default: 'Schedule A Campus Tour' },
                    { key: 'visit_cta1_link', label: 'Button 1 Link', type: 'text', default: '#' },
                    { key: 'visit_cta2_text', label: 'Button 2 Text', type: 'text', default: 'Download Brochure' },
                    { key: 'visit_cta2_link', label: 'Button 2 Link', type: 'text', default: '#' }
                ]
            }
        ]
    },
    'page_admissions': {
        sections: [
            {
                id: 'hero',
                title: 'Hero Section',
                fields: [
                    { key: 'title', label: 'Page Title', type: 'text', default: 'Admissions' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', default: 'Start Your Journey Towards A Bright Future - Admission Process Made Simple' },
                    { key: 'hero_bg', label: 'Hero Background Image', type: 'image', default: '' }
                ]
            }
        ]
    },
    'page_academics': {
        sections: [
            {
                id: 'hero',
                title: 'Hero Section',
                fields: [
                    { key: 'title', label: 'Page Title', type: 'text', default: 'Academics' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', default: 'Comprehensive Programs Designed For Industry Readiness And Career Success' },
                    { key: 'hero_bg', label: 'Hero Background Image', type: 'image', default: '' }
                ]
            }
        ]
    },
    'page_examination': {
        sections: [
            {
                id: 'hero',
                title: 'Hero Section',
                fields: [
                    { key: 'title', label: 'Page Title', type: 'text', default: 'Examination & Results' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', default: 'Stay Updated With Examination Schedules, Notices, And Result Announcements' },
                    { key: 'hero_bg', label: 'Hero Background Image', type: 'image', default: '' }
                ]
            }
        ]
    },
    'page_student_life': {
        sections: [
            {
                id: 'hero',
                title: 'Hero Section',
                fields: [
                    { key: 'title', label: 'Page Title', type: 'text', default: 'Student Life' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', default: 'Experience A Vibrant Campus Life Filled With Learning, Creativity, And Fun' },
                    { key: 'hero_bg', label: 'Hero Background Image', type: 'image', default: '' }
                ]
            }
        ]
    },
    'page_placements': {
        sections: [
            {
                id: 'hero',
                title: 'Hero Section',
                fields: [
                    { key: 'title', label: 'Page Title', type: 'text', default: 'Training & Placements' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', default: 'Bridging The Gap Between Academia And Industry With Dedicated Career Support' },
                    { key: 'hero_bg', label: 'Hero Background Image', type: 'image', default: '' }
                ]
            }
        ]
    },
    'page_news': {
        sections: [
            {
                id: 'hero',
                title: 'Hero Section',
                fields: [
                    { key: 'title', label: 'Page Title', type: 'text', default: 'News & Updates' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', default: 'Stay Connected With The Latest Happenings, Events, And Announcements' },
                    { key: 'hero_bg', label: 'Hero Background Image', type: 'image', default: '' }
                ]
            }
        ]
    },
    'page_student_corner': {
        sections: [
            {
                id: 'hero',
                title: 'Hero Section',
                fields: [
                    { key: 'title', label: 'Page Title', type: 'text', default: 'Student Corner' },
                    { key: 'subtitle', label: 'Subtitle', type: 'textarea', default: 'Access Important Resources, Forms, And Information For Your Academic Journey' },
                    { key: 'hero_bg', label: 'Hero Background Image', type: 'image', default: '' }
                ]
            },
            {
                id: 'faqs',
                title: 'Frequently Asked Questions',
                fields: [
                    { key: 'faqs', label: 'Manage FAQs', type: 'faq_list', default: [] }
                ]
            }
        ]
    }
};

const AVAILABLE_PAGES = [
    { id: 'page_home', name: 'Home Page', description: 'Hero, stats, and promotional sections', path: '/' },
    { id: 'page_about', name: 'About Us', description: 'Overview, Vision, and Mission statements', path: '/about' },
    { id: 'page_academics', name: 'Academics', description: 'Program overviews and descriptions', path: '/academics' },
    { id: 'page_examination', name: 'Examination', description: 'Exam notices and results', path: '/examination' },
    { id: 'page_admissions', name: 'Admissions', description: 'Process details and hero section', path: '/admissions' },
    { id: 'page_student_life', name: 'Student Life', description: 'Campus activities and events', path: '/student-life' },
    { id: 'page_placements', name: 'Placements', description: 'Placement records and recruiters', path: '/placements' },
    { id: 'page_news', name: 'News & Updates', description: 'College news and announcements', path: '/news' },
    { id: 'page_student_corner', name: 'Student Corner', description: 'Resources and downloads', path: '/student-corner' },
    { id: 'page_contact', name: 'Contact Page', description: 'Headlines and contact information', path: '/contact' }
];

// FAQ List Editor Component
const FAQListEditor = ({ label, items, onChange }: { label: string, items: any[], onChange: (items: any[]) => void }) => {
    const [newQ, setNewQ] = useState('');
    const [newA, setNewA] = useState('');

    const addItem = () => {
        if (newQ.trim() && newA.trim()) {
            onChange([...items, { question: newQ.trim(), answer: newA.trim() }]);
            setNewQ('');
            setNewA('');
        }
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">{label}</label>
            <div className="bg-blue-50/50 p-4 rounded-xl border-2 border-blue-100 space-y-3">
                <input
                    type="text"
                    value={newQ}
                    onChange={(e) => setNewQ(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm"
                    placeholder="Enter Question..."
                />
                <textarea
                    value={newA}
                    onChange={(e) => setNewA(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm"
                    placeholder="Enter Answer..."
                    rows={2}
                />
                <button
                    type="button"
                    onClick={addItem}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-bold transition-colors"
                >
                    Add FAQ
                </button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-start gap-4 bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm transition-all hover:border-blue-200">
                        <div className="flex-1">
                            <div className="font-bold text-sm text-blue-900 mb-1">Q: {item.question}</div>
                            <div className="text-xs text-gray-600">A: {item.answer}</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                {(!items || items.length === 0) && (
                    <div className="text-center py-8 text-gray-400 text-sm italic">
                        No FAQs added yet. Use the fields above to add one.
                    </div>
                )}
            </div>
        </div>
    );
};

// Contact Info List Editor Component
const ContactInfoListEditor = ({ label, items, onChange }: { label: string, items: any[], onChange: (items: any[]) => void }) => {
    const [newTitle, setNewTitle] = useState('');
    const [newDetails, setNewDetails] = useState('');
    const [newIcon, setNewIcon] = useState('MapPin'); // Default

    const addItem = () => {
        if (newTitle.trim() && newDetails.trim()) {
            onChange([...items, { title: newTitle.trim(), details: newDetails.trim(), icon: newIcon }]);
            setNewTitle('');
            setNewDetails('');
            setNewIcon('MapPin');
        }
    };

    const removeItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">{label}</label>
            <div className="bg-blue-50/50 p-4 rounded-xl border-2 border-blue-100 space-y-3">
                <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm"
                    placeholder="Card Title (e.g. Address)"
                />
                <textarea
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm"
                    placeholder="Small Details (use \n for line breaks)..."
                    rows={2}
                />
                <select 
                    value={newIcon} 
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg text-sm"
                >
                    <option value="MapPin">Location Icon</option>
                    <option value="Phone">Phone Icon</option>
                    <option value="Mail">Email Icon</option>
                    <option value="Clock">Clock Icon</option>
                </select>
                <button
                    type="button"
                    onClick={addItem}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-bold transition-colors"
                >
                    Add Contact Card
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                {items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-start gap-4 bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm transition-all hover:border-blue-200">
                        <div className="flex-1">
                            <div className="font-bold text-sm text-blue-900 mb-1">{item.title}</div>
                            <div className="text-xs text-gray-600 whitespace-pre-line">{item.details}</div>
                            <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Icon: {item.icon}</div>
                        </div>
                        <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function PageContentManager() {
    const { toast } = useToast();
    const [selectedPage, setSelectedPage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    // Helper to get default content for a page
    const getDefaults = (pageId: string) => {
        const config = PAGE_CONFIG[pageId];
        if (!config) return {};

        const defaults: Record<string, any> = {};
        config.sections.forEach((section) => {
            section.fields.forEach((field) => {
                if (field.type === 'image') {
                    defaults.images = { ...defaults.images, [field.key]: field.default || '' };
                } else {
                    defaults[field.key] = field.default || '';
                }
            });
        });
        return defaults;
    };

    // Load content when a page is selected
    useEffect(() => {
        if (!selectedPage) return;

        const loadContent = async () => {
            setLoading(true);
            try {
                const docRef = doc(db, 'page_content', selectedPage);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const fetchedData = docSnap.data();
                    const defaults = getDefaults(selectedPage);
                    const mergedData = { ...defaults, ...fetchedData };

                    // Restore defaults if fetched data is empty string
                    // This fixes the issue where empty "" saved to DB causes blank fields
                    Object.keys(mergedData).forEach(key => {
                        if (mergedData[key] === '' && defaults[key]) {
                            mergedData[key] = defaults[key];
                        }
                    });
                    // Handle images merging specifically
                    if (fetchedData.images) {
                        mergedData.images = { ...defaults.images, ...fetchedData.images };
                    }

                    setContent(mergedData);
                }
                // If not exists, defaults were already set on click
            } catch (error) {
                console.error("Error loading page content:", error);
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [selectedPage]);

    const handlePageClick = (pageId: string) => {
        setSelectedPage(pageId);
        // Optimistically set defaults so UI updates instantly
        setContent(getDefaults(pageId));
    };

    const handleSave = async () => {
        if (!selectedPage) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'page_content', selectedPage), content, { merge: true });
            toast({
                title: "Success",
                description: "Page content saved successfully!",
                className: "bg-green-500 text-white border-none",
                duration: 3000,
            });
        } catch (error) {
            console.error("Error saving:", error);
            toast({
                title: "Error",
                description: "Failed to save content.",
                variant: "destructive",
                duration: 3000,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (key: string, file: File) => {
        try {
            const base64 = await compressImage(file);
            setContent((prev) => ({
                ...prev,
                images: {
                    ...prev.images,
                    [key]: base64
                }
            }));
        } catch (error) {
            console.error("Image upload failed:", error);
            toast({
                title: "Error",
                description: "Failed to process image.",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    const currentConfig = selectedPage ? PAGE_CONFIG[selectedPage] : null;

    return (
        <AdminLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Layout className="w-8 h-8 text-blue-600" />
                    Page Content Manager
                </h1>
                <p className="text-gray-600 mt-2">Edit visibility, text, and images for site pages.</p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Page List */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 h-fit">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Select Page</h3>
                    <div className="space-y-3">
                        {AVAILABLE_PAGES.map(page => (
                            <button
                                key={page.id}
                                onClick={() => handlePageClick(page.id)}
                                className={`w-full text-left p-4 rounded-xl transition-all border-2 ${selectedPage === page.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                    } `}
                            >
                                <div className="font-bold text-gray-900">{page.name}</div>
                                <div className="text-xs text-gray-500">{page.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Editor */}
                <div className="lg:col-span-2">
                    {selectedPage && currentConfig ? (
                        <div className={`bg-white rounded-2xl shadow-lg p-8 animate-in fade-in slide-in-from-bottom-4 transition-opacity duration-200 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    Editing: {AVAILABLE_PAGES.find(p => p.id === selectedPage)?.name}
                                    {loading && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.open(AVAILABLE_PAGES.find(p => p.id === selectedPage)?.path, '_blank')}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        title="View Live Page"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {currentConfig.sections.map((section) => (
                                    <div key={section.id} className="border-b last:border-0 pb-8 last:pb-0">
                                        <h3 className="text-lg font-extrabold text-blue-900 mb-4 bg-blue-50 p-2 rounded-lg inline-block">
                                            {section.title}
                                        </h3>

                                        <div className="space-y-6">
                                            {section.fields.map((field) => (
                                                <div key={field.key}>
                                                    {field.type === 'text' && (
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">{field.label}</label>
                                                            <input
                                                                type="text"
                                                                value={content[field.key] || ''}
                                                                onChange={e => setContent({ ...content, [field.key]: e.target.value })}
                                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                                                            />
                                                        </div>
                                                    )}
                                                    {field.type === 'textarea' && (
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-700 mb-2">{field.label}</label>
                                                            <textarea
                                                                value={content[field.key] || ''}
                                                                onChange={e => setContent({ ...content, [field.key]: e.target.value })}
                                                                rows={4}
                                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none resize-none"
                                                            />
                                                        </div>
                                                    )}
                                                    {field.type === 'image' && (
                                                        <div>
                                                            <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">{field.label}</label>
                                                            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden group w-full max-w-sm">
                                                                {content.images?.[field.key] || field.default ? (
                                                                    <img src={content.images?.[field.key] || field.default} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full text-gray-400 font-medium">No Image Uploaded</div>
                                                                )}
                                                                <input
                                                                    type="file"
                                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                                                                    onChange={(e) => e.target.files?.[0] && handleImageUpload(field.key, e.target.files[0])}
                                                                    accept="image/*"
                                                                />
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-sm pointer-events-none">
                                                                    Click to Upload
                                                                </div>
                                                            </div>
                                                            {/* Reset Button */}
                                                            {(content.images?.[field.key] && content.images?.[field.key] !== field.default) && (
                                                                <button
                                                                    onClick={() => setContent(prev => ({
                                                                        ...prev,
                                                                        images: {
                                                                            ...prev.images,
                                                                            [field.key]: field.default || ''
                                                                        }
                                                                    }))}
                                                                    className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                                                >
                                                                    <RotateCcw className="w-3 h-3" />
                                                                    Reset to Default
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {field.type === 'faq_list' && (
                                                        <FAQListEditor
                                                            label={field.label}
                                                            items={content[field.key] || []}
                                                            onChange={(items) => setContent({ ...content, [field.key]: items })}
                                                        />
                                                    )}
                                                    {field.type === 'contact_info_list' && (
                                                        <ContactInfoListEditor
                                                            label={field.label}
                                                            items={content[field.key] || []}
                                                            onChange={(items) => setContent({ ...content, [field.key]: items })}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Save Button */}
                                <div className="pt-6 border-t border-gray-100 flex justify-end sticky bottom-0 bg-white pb-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <>Saving...</>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Save All Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                            <Layout className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg font-medium">Select a page to start configuring content</p>
                            <p className="text-sm">Currently available: Home Page</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

