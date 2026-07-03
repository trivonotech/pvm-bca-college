import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Search, Edit, Trash2, X, Upload, FileText, ExternalLink } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from "@/components/ui/use-toast";
import { compressImage } from '@/utils/imageUtils';

interface DynamicPage {
    id: string;
    title: string;
    slug: string;
    content: string;
    image: string;
    order: number;
}

export default function DynamicPageManager() {
    const { toast } = useToast();
    const [pages, setPages] = useState<DynamicPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<DynamicPage | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<Partial<DynamicPage>>({
        title: '',
        slug: '',
        content: '',
        image: '',
        order: 0
    });

    // Fetch Pages
    useEffect(() => {
        const q = query(collection(db, 'dynamic_pages'), orderBy('order'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as DynamicPage[];
            setPages(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        const slug = editingPage ? formData.slug : generateSlug(title);

        setFormData(prev => ({
            ...prev,
            title,
            slug: slug // Auto-generate slug only for new pages or if manually cleared
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressedBase64 = await compressImage(file);
            setImagePreview(compressedBase64);
            setFormData(prev => ({ ...prev, image: compressedBase64 }));
        } catch (err) {
            console.error("Compression error:", err);
            toast({
                title: "Error",
                description: "Failed to process image.",
                variant: "destructive",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                updatedAt: serverTimestamp(),
                // Ensure slug is valid
                slug: formData.slug || generateSlug(formData.title || 'untitled')
            };

            if (editingPage) {
                await updateDoc(doc(db, 'dynamic_pages', editingPage.id), payload);
                toast({ title: "Success", description: "Page updated successfully!", className: "bg-green-500 text-white" });
            } else {
                await addDoc(collection(db, 'dynamic_pages'), {
                    ...payload,
                    createdAt: serverTimestamp(),
                    order: pages.length + 1 // Auto-increment order
                });
                toast({ title: "Success", description: "Page created successfully!", className: "bg-green-500 text-white" });
            }
            closeModal();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save page.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, 'dynamic_pages', deleteId));
            toast({ title: "Success", description: "Page deleted.", className: "bg-green-500 text-white" });
            setDeleteId(null);
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
        }
    };

    const openModal = (page?: DynamicPage) => {
        if (page) {
            setEditingPage(page);
            setFormData(page);
            setImagePreview(page.image);
        } else {
            setEditingPage(null);
            setFormData({
                title: '',
                slug: '',
                content: '',
                image: '',
                order: pages.length + 1
            });
            setImagePreview('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPage(null);
        setImagePreview('');
        setFormData({
            title: '',
            slug: '',
            content: '',
            image: '',
            order: 0
        });
    };

    const filteredPages = pages.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Administration Pages</h1>
                    <p className="text-gray-500">Manage dynamic pages for the Administration menu.</p>
                </div>
                <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Add Page
                </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search pages..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPages.map(page => (
                    <div key={page.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                        <div className="h-40 bg-gray-50 relative overflow-hidden rounded-t-2xl">
                            {page.image ? (
                                <img src={page.image} alt={page.title} className="w-full h-full object-cover object-[center_-15px] bg-white rounded-t-2xl" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <FileText className="w-12 h-12" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                /{page.slug}
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">{page.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{page.content}</p>

                            <div className="flex items-center justify-between gap-2">
                                <div className="flex gap-2">
                                    <button onClick={() => openModal(page)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setDeleteId(page.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-xs text-gray-400 font-mono">Order: {page.order}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPage ? "Edit Page" : "Add Page"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={handleTitleChange}
                            className="w-full p-2 border rounded-lg"
                            placeholder="e.g. Principal's Message"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">/administration/</span>
                            <input
                                required
                                type="text"
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                className="flex-1 p-2 border rounded-lg font-mono text-sm"
                                placeholder="principals-message"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo (Portrait Mode Recommended)</label>
                        {imagePreview ? (
                            <div className="relative inline-block border-2 border-dashed border-gray-300 rounded-xl p-2 bg-white">
                                <img src={imagePreview} alt="Preview" className="h-32 object-cover object-[center_-15px] bg-white rounded-lg" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview('');
                                        setFormData({ ...formData, image: '' });
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
                                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                <label
                                    htmlFor="page-image"
                                    className="block text-blue-600 text-sm font-bold cursor-pointer hover:underline"
                                >
                                    Upload Profile Photo
                                </label>
                                <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="page-image"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content Details</label>
                        <textarea
                            required
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            className="w-full p-2 border rounded-lg h-40 focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                            placeholder="Enter the page content details here..."
                        />
                        <p className="text-xs text-gray-400 mt-1">This text will be displayed below the title on the page.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Menu Order</label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {isSubmitting ? 'Saving...' : 'Save Page'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Page"
                message="Are you sure you want to delete this page? This action cannot be undone."
            />
        </AdminLayout>
    );
}
