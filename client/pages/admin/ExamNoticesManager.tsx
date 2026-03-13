import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Search, Edit, Trash2, Bell, Calendar } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from "@/components/ui/use-toast";

interface ExamNotice {
    id: string;
    title: string;
    date: string;
    type: 'Important' | 'Notice' | 'Update';
    desc: string;
    createdAt?: any;
}

export default function ExamNoticesManager() {
    const { toast } = useToast();
    const [notices, setNotices] = useState<ExamNotice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<ExamNotice | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<ExamNotice>>({
        title: '',
        date: '',
        type: 'Notice',
        desc: ''
    });

    // Fetch Notices
    useEffect(() => {
        const q = query(collection(db, 'exam_notices'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ExamNotice[];
            setNotices(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, updatedAt: serverTimestamp() };

            if (editingNotice) {
                await updateDoc(doc(db, 'exam_notices', editingNotice.id), payload);
                toast({ title: "Success", description: "Notice updated successfully!", className: "bg-green-500 text-white" });
            } else {
                await addDoc(collection(db, 'exam_notices'), { ...payload, createdAt: serverTimestamp() });
                toast({ title: "Success", description: "Notice added successfully!", className: "bg-green-500 text-white" });
            }
            closeModal();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save notice.", variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, 'exam_notices', deleteId));
            toast({ title: "Success", description: "Notice deleted.", className: "bg-green-500 text-white" });
            setDeleteId(null);
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
        }
    };

    const openModal = (notice?: ExamNotice) => {
        if (notice) {
            setEditingNotice(notice);
            setFormData(notice);
        } else {
            setEditingNotice(null);
            setFormData({ title: '', date: '', type: 'Notice', desc: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingNotice(null);
    };

    const filteredNotices = notices.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exam Notices</h1>
                    <p className="text-gray-500">Post important updates and schedules.</p>
                </div>
                <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2">
                    <Plus className="w-5 h-5" /> Post Notice
                </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search notices..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="grid gap-4">
                {filteredNotices.map(notice => (
                    <div key={notice.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between group hover:shadow-md transition">
                        <div className="flex gap-4">
                            <div className={`p-3 rounded-xl h-fit ${notice.type === 'Important' ? 'bg-red-50 text-red-600' :
                                    notice.type === 'Update' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                <Bell className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-lg text-gray-900">{notice.title}</h3>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${notice.type === 'Important' ? 'bg-red-100 text-red-700' :
                                            notice.type === 'Update' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {notice.type}
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-2">{notice.desc}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                                    <Calendar className="w-4 h-4" />
                                    {notice.date}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => openModal(notice)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={() => setDeleteId(notice.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingNotice ? "Edit Notice" : "Post Notice"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notice Title</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            placeholder="e.g. Schedule Released"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            className="w-full p-2 border rounded-lg"
                        >
                            <option value="Notice">Notice</option>
                            <option value="Important">Important</option>
                            <option value="Update">Update</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            required
                            type="text"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            placeholder="e.g. 10th Dec 2024"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.desc}
                            onChange={e => setFormData({ ...formData, desc: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            placeholder="Details about the notice..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Notice"
                message="Are you sure you want to delete this notice?"
            />
        </AdminLayout>
    );
}
