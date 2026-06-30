import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Teacher } from '../types';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, Mail, Phone, BookOpen, Download } from 'lucide-react';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await api.deleteTeacher(id);
        setTeachers(teachers.filter((t) => t.id !== id));
      } catch (error) {
        console.error('Failed to delete teacher:', error);
      }
    }
    setShowMenu(null);
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teacher.email && teacher.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600 mt-1">Manage teaching staff and assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search teachers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-64 text-gray-500">
          <BookOpen className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">No teachers found</p>
          <p className="text-sm">Try adjusting your search or add a new teacher</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                    {teacher.profileImageUrl ? (
                      <img
                        src={teacher.profileImageUrl}
                        alt=""
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-blue-600">
                        {teacher.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{teacher.fullName}</h3>
                    {teacher.subject && (
                      <p className="text-sm text-blue-600">{teacher.subject}</p>
                    )}
                    {teacher.employmentType && (
                      <span className="badge badge-info mt-1">{teacher.employmentType}</span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(showMenu === teacher.id ? null : teacher.id)}
                    className="btn btn-ghost btn-sm"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showMenu === teacher.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(null)} />
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setShowViewModal(true);
                            setShowMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setShowAddModal(true);
                            setShowMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                {teacher.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                )}
                {teacher.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{teacher.phoneNumber}</span>
                  </div>
                )}
              </div>

              {teacher.assignments && teacher.assignments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Assigned Classes</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.assignments.slice(0, 3).map((assignment) => (
                      <span key={assignment.id} className="badge badge-neutral">
                        {assignment.class?.name || assignment.classId}
                      </span>
                    ))}
                    {teacher.assignments.length > 3 && (
                      <span className="badge badge-neutral">+{teacher.assignments.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <TeacherModal
          teacher={selectedTeacher}
          onClose={() => {
            setShowAddModal(false);
            setSelectedTeacher(null);
            fetchTeachers();
          }}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedTeacher && (
        <TeacherViewModal
          teacher={selectedTeacher}
          onClose={() => {
            setShowViewModal(false);
            setSelectedTeacher(null);
          }}
        />
      )}
    </div>
  );
}

function TeacherModal({
  teacher,
  onClose,
}: {
  teacher: Teacher | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    fullName: teacher?.fullName || '',
    email: teacher?.email || '',
    password: '',
    subject: teacher?.subject || '',
    phoneNumber: teacher?.phoneNumber || '',
    address: teacher?.address || '',
    qualification: teacher?.qualification || '',
    employmentType: teacher?.employmentType || '',
    hireDate: teacher?.hireDate || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (teacher) {
        await api.updateTeacher(teacher.id, {
          fullName: form.fullName,
          email: form.email,
          subject: form.subject,
          phoneNumber: form.phoneNumber,
          address: form.address,
          qualification: form.qualification,
          employmentType: form.employmentType,
          hireDate: form.hireDate,
        });
      } else {
        await api.onboardTeacher(form);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save teacher');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {teacher ? 'Edit Teacher' : 'Add New Teacher'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {teacher ? 'Update teacher information' : 'Fill in the details to onboard a new teacher'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="label">Full Name *</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className={teacher ? '' : 'grid grid-cols-2 gap-4'}>
            <div>
              <label className="label">Email {!teacher && '*'}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                required={!teacher}
              />
            </div>
            {!teacher && (
              <div>
                <label className="label">Password *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input"
                  required
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Qualification</label>
              <input
                type="text"
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Employment Type</label>
              <select
                value={form.employmentType}
                onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                className="select"
              >
                <option value="">Select</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Hire Date</label>
              <input
                type="date"
                value={form.hireDate ? form.hireDate.split('T')[0] : ''}
                onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="input"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Saving...' : teacher ? 'Update Teacher' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeacherViewModal({ teacher, onClose }: { teacher: Teacher; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              {teacher.profileImageUrl ? (
                <img
                  src={teacher.profileImageUrl}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-blue-600">
                  {teacher.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{teacher.fullName}</h2>
              {teacher.subject && (
                <p className="text-sm text-blue-600">{teacher.subject} Teacher</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Personal Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email</span>
                  <span className="text-sm font-medium text-gray-900">{teacher.email || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phone</span>
                  <span className="text-sm font-medium text-gray-900">{teacher.phoneNumber || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Qualification</span>
                  <span className="text-sm font-medium text-gray-900">{teacher.qualification || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Address</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-[200px]">
                    {teacher.address || '-'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Employment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="text-sm font-medium text-gray-900">
                    {teacher.employmentType || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hire Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {teacher.hireDate ? new Date(teacher.hireDate).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Assignments</span>
                  <span className="text-sm font-medium text-gray-900">
                    {teacher.assignments?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {teacher.assignments && teacher.assignments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Class Assignments</h3>
              <div className="flex flex-wrap gap-2">
                {teacher.assignments.map((assignment) => (
                  <span key={assignment.id} className="badge badge-info">
                    {assignment.class?.name || assignment.classId} - {assignment.subject?.name || assignment.subjectId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
