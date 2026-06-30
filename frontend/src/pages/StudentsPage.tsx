import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Student, Class } from '../types';
import { Plus, Search, MoreVertical, Eye, Edit, Trash2, UserX, Download } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await api.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await api.getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.deleteStudent(id);
        setStudents(students.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Failed to delete student:', error);
      }
    }
    setShowMenu(null);
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.indexNo && student.indexNo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesClass = !selectedClass || student.enrollments?.some((e) => e.classId === selectedClass);
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student records and enrollments</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn btn-secondary">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name or index number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="select"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <UserX className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium">No students found</p>
            <p className="text-sm">Try adjusting your search or add a new student</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Index No</th>
                  <th>Class</th>
                  <th>Gender</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {student.profileImageUrl ? (
                            <img
                              src={student.profileImageUrl}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-blue-600">
                              {student.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.fullName}</p>
                          {student.phoneNumber && (
                            <p className="text-sm text-gray-500">{student.phoneNumber}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-gray-600">{student.indexNo || '-'}</td>
                    <td>
                      {student.enrollments && student.enrollments.length > 0 ? (
                        <span className="badge badge-info">
                          {student.enrollments[0].class?.name || 'Enrolled'}
                        </span>
                      ) : (
                        <span className="badge badge-neutral">Not enrolled</span>
                      )}
                    </td>
                    <td className="text-gray-600">{student.gender || '-'}</td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                    <td className="text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setShowMenu(showMenu === student.id ? null : student.id)}
                          className="btn btn-ghost btn-sm"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showMenu === student.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(null)} />
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
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
                                  setSelectedStudent(student);
                                  setShowAddModal(true);
                                  setShowMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4 text-gray-500" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(student.id)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <StudentModal
          student={selectedStudent}
          classes={classes}
          onClose={() => {
            setShowAddModal(false);
            setSelectedStudent(null);
            fetchStudents();
          }}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedStudent && (
        <StudentViewModal
          student={selectedStudent}
          onClose={() => {
            setShowViewModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}

function StudentModal({
  student,
  classes,
  onClose,
}: {
  student: Student | null;
  classes: Class[];
  onClose: () => void;
}) {
  const [form, setForm] = useState<{
    fullName: string;
    indexNo: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | '';
    address: string;
    phoneNumber: string;
    classId: string;
  }>({
    fullName: student?.fullName || '',
    indexNo: student?.indexNo || '',
    dateOfBirth: student?.dateOfBirth || '',
    gender: student?.gender || '',
    address: student?.address || '',
    phoneNumber: student?.phoneNumber || '',
    classId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { classId, ...studentFields } = form;
      const submitData = {
        ...studentFields,
        gender: form.gender || undefined,
      };
      if (student) {
        await api.updateStudent(student.id, submitData);
      } else {
        await api.onboardStudent({ ...submitData, classId });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save student');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {student ? 'Update student information' : 'Fill in the details to onboard a new student'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Index Number</label>
              <input
                type="text"
                value={form.indexNo}
                onChange={(e) => setForm({ ...form, indexNo: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as 'MALE' | 'FEMALE' | '' })}
                className="select"
              >
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth ? form.dateOfBirth.split('T')[0] : ''}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
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

          {!student && (
            <div>
              <label className="label">Assign to Class</label>
              <select
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                className="select"
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {isLoading ? 'Saving...' : student ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StudentViewModal({ student, onClose }: { student: Student; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              {student.profileImageUrl ? (
                <img
                  src={student.profileImageUrl}
                  alt=""
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-blue-600">
                  {student.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{student.fullName}</h2>
              <p className="text-sm text-gray-600">
                {student.enrollments && student.enrollments.length > 0
                  ? student.enrollments[0].class?.name
                  : 'Not enrolled'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Personal Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Index No</span>
                  <span className="text-sm font-medium text-gray-900">{student.indexNo || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gender</span>
                  <span className="text-sm font-medium text-gray-900">{student.gender || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date of Birth</span>
                  <span className="text-sm font-medium text-gray-900">
                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phone</span>
                  <span className="text-sm font-medium text-gray-900">{student.phoneNumber || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Address</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-[200px]">
                    {student.address || '-'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Academic Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Enrollments</span>
                  <span className="text-sm font-medium text-gray-900">
                    {student.enrollments?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Attendance Records</span>
                  <span className="text-sm font-medium text-gray-900">
                    {student.attendanceRecords?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Results</span>
                  <span className="text-sm font-medium text-gray-900">
                    {student.results?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
