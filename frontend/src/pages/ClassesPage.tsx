import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Class, Teacher, Subject } from '../types';
import { Plus, Search, MoreVertical, Edit, Trash2, Users, BookOpen, GraduationCap, DollarSign } from 'lucide-react';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const data = await api.getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await api.deleteClass(id);
        setClasses(classes.filter((c) => c.id !== id));
      } catch (error) {
        console.error('Failed to delete class:', error);
      }
    }
    setShowMenu(null);
  };

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cls.level && cls.level.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600 mt-1">Manage classes and teacher assignments</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Class
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-64 text-gray-500">
          <BookOpen className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">No classes found</p>
          <p className="text-sm">Add your first class to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="card overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                      {cls.level && (
                        <p className="text-sm text-gray-500">{cls.level}</p>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === cls.id ? null : cls.id)}
                      className="btn btn-ghost btn-sm"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {showMenu === cls.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(null)} />
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                          <button
                            onClick={() => {
                              setSelectedClass(cls);
                              setShowAddModal(true);
                              setShowMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedClass(cls);
                              setShowAssignModal(true);
                              setShowMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <GraduationCap className="w-4 h-4 text-gray-500" />
                            Assign Teacher
                          </button>
                          <button
                            onClick={() => handleDelete(cls.id)}
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

                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {cls.enrollments?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {cls.teacherAssignments?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">Teachers</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {cls.feeStructures?.length || 0}
                    </p>
                    <p className="text-xs text-gray-500">Fees</p>
                  </div>
                </div>
              </div>

              {cls.teacherAssignments && cls.teacherAssignments.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">Teachers</p>
                  <div className="flex flex-wrap gap-2">
                    {cls.teacherAssignments.slice(0, 3).map((assignment) => (
                      <span key={assignment.id} className="badge badge-neutral">
                        {assignment.teacher?.fullName || assignment.subject?.name || 'Assigned'}
                      </span>
                    ))}
                    {cls.teacherAssignments.length > 3 && (
                      <span className="badge badge-neutral">+{cls.teacherAssignments.length - 3}</span>
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
        <ClassModal
          classItem={selectedClass}
          onClose={() => {
            setShowAddModal(false);
            setSelectedClass(null);
            fetchClasses();
          }}
        />
      )}

      {/* Assign Teacher Modal */}
      {showAssignModal && selectedClass && (
        <AssignTeacherModal
          classItem={selectedClass}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedClass(null);
            fetchClasses();
          }}
        />
      )}
    </div>
  );
}

function ClassModal({
  classItem,
  onClose,
}: {
  classItem: Class | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: classItem?.name || '',
    level: classItem?.level || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (classItem) {
        await api.updateClass(classItem.id, form);
      } else {
        await api.createClass(form);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save class');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {classItem ? 'Edit Class' : 'Add New Class'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="label">Class Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              placeholder="e.g., Grade 10A"
              required
            />
          </div>

          <div>
            <label className="label">Level/Grade</label>
            <input
              type="text"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="input"
              placeholder="e.g., Grade 10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Saving...' : classItem ? 'Update' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssignTeacherModal({
  classItem,
  onClose,
}: {
  classItem: Class;
  onClose: () => void;
}) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState({
    teacherId: '',
    subjectId: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersData, subjectsData] = await Promise.all([
          api.getTeachers(),
          api.getSubjects(),
        ]);
        setTeachers(teachersData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.createAssignment({
        teacherId: form.teacherId,
        classId: classItem.id,
        subjectId: form.subjectId,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign teacher');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Assign Teacher to {classItem.name}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="label">Teacher *</label>
            <select
              value={form.teacherId}
              onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className="select"
              required
            >
              <option value="">Select a teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName} {teacher.subject && `(${teacher.subject})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Subject *</label>
            <select
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className="select"
              required
            >
              <option value="">Select a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Assigning...' : 'Assign Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
