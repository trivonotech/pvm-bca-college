import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Plus, Search, Edit, Trash2, X, Upload, Mail, Phone, BookOpen, Layers } from 'lucide-react';
import type { Faculty } from '@/../../shared/types';
import { compressImage } from '@/utils/imageUtils';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';

import { useToast } from "@/components/ui/use-toast";
import { logAdminActivity } from '@/lib/ActivityLogger';

export default function FacultyManager() {
    const { toast } = useToast();
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);

    // Real-time sync
    useEffect(() => {
        const q = query(collection(db, 'faculty'), orderBy('order', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const facultyData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Faculty[];
            setFaculty(facultyData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching faculty:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isCustomDept, setIsCustomDept] = useState(false);
    const [customDeptVal, setCustomDeptVal] = useState('');

    const existingDepartments = useMemo(() => {
        const depts = new Set(['BCA Department', 'Administration', 'Management', 'Support Staff']);
        faculty.forEach(member => {
            if (member.department) {
                depts.add(member.department);
            }
        });
        return Array.from(depts);
    }, [faculty]);

    // Confirmation Modal State
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        facultyId: string | null;
    }>({
        isOpen: false,
        facultyId: null,
    });

    const [formData, setFormData] = useState({
        name: '',
        designation: '',
        department: 'BCA Department',
        qualification: '',
        specialization: '',
        experience: '',
        email: '',
        phone: '',
        image: '',
        order: '10',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'department') {
            if (value === 'custom') {
                setIsCustomDept(true);
                setFormData(prev => ({ ...prev, [name]: 'custom' }));
            } else {
                setIsCustomDept(false);
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddNew = () => {
        setEditingFaculty(null);
        setFormData({
            name: '',
            designation: '',
            department: 'BCA Department',
            qualification: '',
            specialization: '',
            experience: '',
            email: '',
            phone: '',
            image: '',
            order: (faculty.length * 10 + 10).toString(),
        });
        setImagePreview('');
        setIsCustomDept(false);
        setCustomDeptVal('');
        setShowModal(true);
    };

    const handleEdit = (member: Faculty) => {
        setEditingFaculty(member);
        const standardList = ['BCA Department', 'Administration', 'Management', 'Support Staff'];
        const isCustom = member.department ? !standardList.includes(member.department) : false;

        setFormData({
            name: member.name,
            designation: member.designation,
            department: isCustom ? 'custom' : (member.department || 'BCA Department'),
            qualification: member.qualification,
            specialization: member.specialization || '',
            experience: member.experience || '',
            email: member.email || '',
            phone: member.phone || '',
            image: member.image || '',
            order: (member.order ?? 10).toString(),
        });
        setImagePreview(member.image || '');
        setIsCustomDept(isCustom);
        setCustomDeptVal(isCustom ? (member.department || '') : '');
        setShowModal(true);
    };

    const confirmDelete = (id: string) => {
        setConfirmState({ isOpen: true, facultyId: id });
    };

    const executeDelete = async () => {
        if (confirmState.facultyId) {
            try {
                await deleteDoc(doc(db, 'faculty', confirmState.facultyId));
                logAdminActivity({
                    action: 'DELETE_DATA',
                    target: 'Faculty/Staff',
                    details: `Deleted staff record ID: ${confirmState.facultyId}`
                });
                setConfirmState({ isOpen: false, facultyId: null });
                toast({
                    title: "Success",
                    description: "Staff member deleted successfully",
                    className: "bg-green-500 text-white border-none",
                    duration: 3000,
                });
            } catch (error) {
                console.error("Error deleting staff member:", error);
                toast({
                    title: "Error",
                    description: "Failed to delete staff member",
                    variant: "destructive",
                    duration: 3000,
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const finalDepartment = isCustomDept ? customDeptVal.trim() : formData.department;
            if (!finalDepartment) {
                toast({
                    title: "Error",
                    description: "Department name is required",
                    variant: "destructive",
                    duration: 3000,
                });
                return;
            }

            const dataToSave = {
                ...formData,
                department: finalDepartment,
                order: parseInt(formData.order) || 10,
            };

            if (editingFaculty) {
                // Update
                const facultyRef = doc(db, 'faculty', editingFaculty.id);
                await updateDoc(facultyRef, {
                    ...dataToSave,
                    updatedAt: serverTimestamp()
                });
                logAdminActivity({
                    action: 'UPDATE_DATA',
                    target: 'Faculty/Staff',
                    details: `Updated staff member: ${formData.name}`
                });
            } else {
                // Create
                await addDoc(collection(db, 'faculty'), {
                    ...dataToSave,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                logAdminActivity({
                    action: 'CREATE_DATA',
                    target: 'Faculty/Staff',
                    details: `Added new staff member: ${formData.name}`
                });
            }
            setShowModal(false);
            toast({
                title: "Success",
                description: "Staff details saved successfully!",
                className: "bg-green-500 text-white border-none",
                duration: 3000,
            });
        } catch (error) {
            console.error("Error saving staff:", error);
            toast({
                title: "Error",
                description: "Failed to save staff details",
                variant: "destructive",
                duration: 3000,
            });
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const compressedBase64 = await compressImage(file);
                setImagePreview(compressedBase64);
                setFormData({ ...formData, image: compressedBase64 });
            } catch (error) {
                console.error("Image compression failed:", error);
                toast({
                    title: "Error",
                    description: "Failed to process image",
                    variant: "destructive",
                    duration: 3000,
                });
            }
        }
    };

    const filteredFaculty = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return faculty.filter((member) =>
            member.name.toLowerCase().includes(term) ||
            member.designation.toLowerCase().includes(term) ||
            member.department.toLowerCase().includes(term)
        );
    }, [faculty, searchTerm]);

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Faculty & Staff Management</h1>
                        <p className="text-gray-600 mt-1">Manage PVM BCA College staff directory</p>
                    </div>
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
                    >
                        <Plus className="w-5 h-5" /> Add Staff Member
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search staff by name, designation, department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                        />
                    </div>
                    <div className="text-sm font-semibold text-gray-500">
                        Total Members: <span className="text-blue-600 font-bold">{filteredFaculty.length}</span>
                    </div>
                </div>

                {/* Table list */}
                <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Loading staff data...</div>
                    ) : filteredFaculty.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No staff members found. Add your first member!</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-bold border-b border-gray-150">
                                        <th className="py-4 px-6">Order</th>
                                        <th className="py-4 px-6">Member</th>
                                        <th className="py-4 px-6">Department</th>
                                        <th className="py-4 px-6">Qualification / Spec.</th>
                                        <th className="py-4 px-6">Contact Info</th>
                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredFaculty.map((member) => (
                                        <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6 font-semibold text-gray-500 text-sm">
                                                {member.order ?? 10}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                                        {member.image ? (
                                                            <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-lg">
                                                                {member.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 leading-tight">{member.name}</h3>
                                                        <p className="text-xs text-blue-600 font-medium mt-0.5">{member.designation}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                                                    {member.department}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-700">
                                                <div className="font-medium text-gray-900">{member.qualification}</div>
                                                {member.specialization && (
                                                    <div className="text-xs text-gray-500 mt-0.5">{member.specialization}</div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-xs text-gray-600 space-y-1">
                                                {member.email && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>{member.email}</span>
                                                    </div>
                                                )}
                                                {member.phone && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                                                        <span>{member.phone}</span>
                                                    </div>
                                                )}
                                                {!member.email && !member.phone && <span className="text-gray-400 italic">No contact info</span>}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(member)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Edit details"
                                                    >
                                                        <Edit className="w-4.5 h-4.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(member.id)}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete member"
                                                    >
                                                        <Trash2 className="w-4.5 h-4.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Form Modal */}
                <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingFaculty ? "Edit Staff Details" : "Add Staff Member"}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Dr. Rajesh Patel"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Designation *</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Assistant Professor"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Department *</label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                >
                                    <option value="BCA Department">BCA Department</option>
                                    <option value="Administration">Administration</option>
                                    <option value="Management">Management</option>
                                    <option value="Support Staff">Support Staff</option>
                                    {/* Dynamically list custom departments added previously */}
                                    {existingDepartments.filter(d => !['BCA Department', 'Administration', 'Management', 'Support Staff'].includes(d)).map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                    <option value="custom">+ Add Custom Department...</option>
                                </select>

                                {isCustomDept && (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            value={customDeptVal}
                                            onChange={(e) => setCustomDeptVal(e.target.value)}
                                            required
                                            placeholder="Enter Custom Department Name"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm animate-in fade-in slide-in-from-top-1"
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Display Order *</label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g. 10, 20, 30"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Qualification *</label>
                                <input
                                    type="text"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Ph.D, MCA, M.Sc (IT)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Experience</label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g. 8 Years"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Specialization</label>
                            <input
                                type="text"
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Web Development, Cyber Security, AI & ML"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="staffname@pvmbcacollege.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g. +91 98765 43210"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Photo</label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-55 border border-gray-200 flex items-center justify-center shrink-0">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        id="staff-photo-upload"
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="staff-photo-upload"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-105 hover:bg-gray-200 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer transition-colors"
                                    >
                                        <Upload className="w-3.5 h-3.5" /> Choose Photo
                                    </label>
                                    <p className="text-[10px] text-gray-400 mt-1">Accepts PNG, JPG, WebP. Compressed automatically.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md"
                            >
                                {editingFaculty ? "Save Changes" : "Add Member"}
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Confirm Delete Modal */}
                <ConfirmModal
                    isOpen={confirmState.isOpen}
                    onClose={() => setConfirmState({ isOpen: false, facultyId: null })}
                    onConfirm={executeDelete}
                    title="Delete Staff Member"
                    message="Are you sure you want to delete this staff member? This action cannot be undone."
                />
            </div>
        </AdminLayout>
    );
}
