import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Search, Edit, Trash2, X, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from "@/components/ui/use-toast";

interface CalendarEvent {
    id: string;
    semester: string; // "First Semester", "Second Semester"
    title: string;    // "Classes Begin"
    dateRange: string; // "1st July - 30th Nov"
    order: number;
}

export default function CalendarManager() {
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

    const { toast } = useToast();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<CalendarEvent>>({
        semester: 'First Semester',
        title: '',
        dateRange: '',
        order: 0
    });

    const SEMESTERS = ['First Semester', 'Second Semester', 'Third Semester', 'Fourth Semester', 'Fifth Semester', 'Sixth Semester'];

    // Fetch Events
    useEffect(() => {
        const q = query(collection(db, 'academic_calendar'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as CalendarEvent[];
            // Client-side sort fallback
            data.sort((a, b) => (a.order || 0) - (b.order || 0));
            setEvents(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, updatedAt: serverTimestamp() };

            if (editingEvent) {
                await updateDoc(doc(db, 'academic_calendar', editingEvent.id), payload);
                toast({ title: "Success", description: "Event updated successfully!", className: "bg-green-500 text-white" });
            } else {
                await addDoc(collection(db, 'academic_calendar'), { ...payload, createdAt: serverTimestamp() });
                toast({ title: "Success", description: "Event added successfully!", className: "bg-green-500 text-white" });
            }
            closeModal();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to save event.", variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, 'academic_calendar', deleteId));
            toast({ title: "Success", description: "Event deleted.", className: "bg-green-500 text-white" });
            setDeleteId(null);
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
        }
    };

    const openModal = (event?: CalendarEvent) => {
        if (event) {
            setEditingEvent(event);
            setFormData(event);
        } else {
            setEditingEvent(null);
            // Auto-fill semester if selected
            const targetSemester = selectedSemester || 'First Semester';
            const count = events.filter(e => e.semester === targetSemester).length;

            setFormData({
                semester: targetSemester,
                title: '',
                dateRange: '',
                order: count + 1
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingEvent(null);
    };

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Academic Calendar</h1>
                    <p className="text-gray-500">Manage semesters and key dates.</p>
                </div>
                {selectedSemester && (
                    <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 flex items-center gap-2">
                        <Plus className="w-5 h-5" /> Add Event
                    </button>
                )}
            </div>

            {/* Back Button (only when semester selected) */}
            {selectedSemester && (
                <button
                    onClick={() => setSelectedSemester(null)}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <div className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-semibold">Back to Semesters</span>
                </button>
            )}

            {!selectedSemester ? (
                /* View 1: Semester Grid */
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SEMESTERS.map(sem => {
                        const count = events.filter(e => e.semester === sem).length;
                        return (
                            <div
                                key={sem}
                                onClick={() => setSelectedSemester(sem)}
                                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <CalendarIcon className="w-8 h-8" />
                                    </div>
                                    <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">
                                        {count} Events
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{sem}</h3>
                                <p className="text-gray-500 mt-2">Manage events for {sem.toLowerCase()}</p>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* View 2: Selected Semester Details */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-xl text-gray-800">{selectedSemester}</h2>
                        <div className="text-sm text-gray-500">
                            {filteredEvents.filter(e => e.semester === selectedSemester).length} Events
                        </div>
                    </div>

                    <div className="p-4">
                        {/* Search within semester */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={`Search in ${selectedSemester}...`}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-3">
                            {filteredEvents.filter(e => e.semester === selectedSemester).length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No events found for this semester.</p>
                                    <button onClick={() => openModal()} className="mt-4 text-blue-600 font-bold hover:underline">
                                        Add First Event
                                    </button>
                                </div>
                            ) : (
                                filteredEvents
                                    .filter(e => e.semester === selectedSemester)
                                    .map(event => (
                                        <div key={event.id} className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-blue-100 text-blue-600 font-bold w-8 h-8 flex items-center justify-center rounded-lg">
                                                    {event.order}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{event.title}</h4>
                                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                                        <CalendarIcon className="w-4 h-4" />
                                                        {event.dateRange}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openModal(event)} className="p-2 text-blue-600 hover:bg-white rounded-lg shadow-sm">
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => setDeleteId(event.id)} className="p-2 text-red-600 hover:bg-white rounded-lg shadow-sm">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingEvent ? "Edit Event" : `Add Event to ${selectedSemester || 'Semester'}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select
                            value={formData.semester}
                            onChange={e => setFormData({ ...formData, semester: e.target.value })}
                            className="w-full p-2 border rounded-lg bg-gray-100"
                            disabled={!!selectedSemester && !editingEvent} // Lock if adding from a specific view
                        >
                            {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    {/* ... (rest of the form remains same) ... */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            placeholder="e.g. Classes Begin"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range / Date</label>
                        <input
                            required
                            type="text"
                            value={formData.dateRange}
                            onChange={e => setFormData({ ...formData, dateRange: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                            placeholder="e.g. 1st July - 30th Nov"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                            className="w-full p-2 border rounded-lg"
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
                title="Delete Event"
                message="Are you sure you want to delete this event?"
            />
        </AdminLayout>
    );
}
