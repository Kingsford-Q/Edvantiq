import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Assessment, Class, Subject, AssessmentType } from '../types';
import { Plus, Search, FileText, MoreVertical, Edit, Trash2, Users, Percent } from 'lucide-react';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAssessments();
      setAssessments(data);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await api.deleteAssessment(id);
        setAssessments(assessments.filter((a) => a.id !== id));
      } catch (error) {
        console.error('Failed to delete assessment:', error);
      }
    }
    setShowMenu(null);
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = assessment.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || assessment.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: AssessmentType) => {
    switch (type) {
      case 'CA':
        return 'badge-info';
      case 'EXAM':
        return 'badge-warning';
      case 'QUIZ':
        return 'badge-success';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600 mt-1">Create and manage assessments and exams</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          New Assessment
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="select sm:w-40"
          >
            <option value="">All Types</option>
            <option value="CA">CA</option>
            <option value="EXAM">Exam</option>
            <option value="QUIZ">Quiz</option>
          </select>
        </div>
      </div>

      {/* Assessments Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-64 text-gray-500">
          <FileText className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">No assessments found</p>
          <p className="text-sm">Create your first assessment to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((assessment) => (
            <div key={assessment.id} className="card overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{assessment.title}</h3>
                      <span className={`badge ${getTypeColor(assessment.type)} mt-1`}>
                        {assessment.type}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === assessment.id ? null : assessment.id)}
                      className="btn btn-ghost btn-sm"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {showMenu === assessment.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(null)} />
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                          <button
                            onClick={() => {
                              setSelectedAssessment(assessment);
                              setShowAddModal(true);
                              setShowMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(assessment.id)}
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

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{assessment.class?.name || 'No class'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>{assessment.subject?.name || 'No subject'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-gray-400" />
                    <span>{assessment.totalMark} marks</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Results entered</span>
                    <span className="font-medium text-gray-900">
                      {assessment.results?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AssessmentModal
          assessment={selectedAssessment}
          onClose={() => {
            setShowAddModal(false);
            setSelectedAssessment(null);
            fetchAssessments();
          }}
        />
      )}
    </div>
  );
}

function AssessmentModal({
  assessment,
  onClose,
}: {
  assessment: Assessment | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: assessment?.title || '',
    type: assessment?.type || 'CA' as AssessmentType,
    totalMark: assessment?.totalMark || 100,
    classId: assessment?.classId || '',
    subjectId: assessment?.subjectId || '',
  });
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.getClasses(), api.getSubjects()])
      .then(([classesData, subjectsData]) => {
        setClasses(classesData);
        setSubjects(subjectsData);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (assessment) {
        await api.updateAssessment(assessment.id, form);
      } else {
        await api.createAssessment(form);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save assessment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {assessment ? 'Edit Assessment' : 'New Assessment'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              placeholder="e.g., Mid-Term Examination"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as AssessmentType })}
                className="select"
                required
              >
                <option value="CA">CA</option>
                <option value="EXAM">Exam</option>
                <option value="QUIZ">Quiz</option>
              </select>
            </div>
            <div>
              <label className="label">Total Marks *</label>
              <input
                type="number"
                value={form.totalMark}
                onChange={(e) => setForm({ ...form, totalMark: parseInt(e.target.value) })}
                className="input"
                min={1}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Class *</label>
            <select
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              className="select"
              required
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
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
              {isLoading ? 'Saving...' : assessment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
