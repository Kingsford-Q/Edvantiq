import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { AssessmentResult, Assessment, Student, Class } from '../types';
import { Search, FileText, TrendingUp, Plus, Award, BarChart3 } from 'lucide-react';

export default function ResultsPage() {
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [showEnterModal, setShowEnterModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [resultsData, assessmentsData, studentsData, classesData] = await Promise.all([
        api.getResults(),
        api.getAssessments(),
        api.getStudents(),
        api.getClasses(),
      ]);
      setResults(resultsData);
      setAssessments(assessmentsData);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = results.filter((result) => {
    const student = result.student || students.find((s) => s.id === result.studentId);
    const matchesSearch = student?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = !selectedClass || student?.enrollments?.some((e) => e.classId === selectedClass);
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results</h1>
          <p className="text-gray-600 mt-1">View and enter assessment results</p>
        </div>
        <button onClick={() => setShowEnterModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Enter Results
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Results</p>
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">
                {results.length > 0
                  ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {results.length > 0
                  ? Math.round((results.filter((r) => r.score >= 50).length / results.length) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="select sm:w-48"
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

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-64 text-gray-500">
          <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">No results found</p>
          <p className="text-sm">Enter results for an assessment to see them here</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Assessment</th>
                  <th>Class</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result) => {
                  const student = result.student || students.find((s) => s.id === result.studentId);
                  const assessment = result.assessment || assessments.find((a) => a.id === result.assessmentId);
                  const percentage = assessment ? Math.round((result.score / assessment.totalMark) * 100) : result.score;
                  const grade = percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';

                  return (
                    <tr key={result.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">
                              {student?.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{student?.fullName || 'Unknown'}</span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900">{assessment?.title || '-'}</p>
                          <span className={`badge ${assessment?.type === 'EXAM' ? 'badge-warning' : assessment?.type === 'CA' ? 'badge-info' : 'badge-success'}`}>
                            {assessment?.type || '-'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">
                          {student?.enrollments?.[0]?.class?.name || '-'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{result.score}</span>
                          <span className="text-gray-500">/ {assessment?.totalMark || 100}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          grade === 'A' ? 'badge-success' :
                          grade === 'B' ? 'badge-info' :
                          grade === 'C' ? 'badge-warning' :
                          grade === 'D' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {grade} ({percentage}%)
                        </span>
                      </td>
                      <td className="text-gray-600">{result.remark || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enter Results Modal */}
      {showEnterModal && (
        <EnterResultsModal
          assessments={assessments}
          students={students}
          classes={classes}
          onClose={() => {
            setShowEnterModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function EnterResultsModal({
  assessments,
  students,
  classes,
  onClose,
}: {
  assessments: Assessment[];
  students: Student[];
  classes: Class[];
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    assessmentId: '',
    studentId: '',
    score: 0,
    remark: '',
    classId: '',
  });
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedAssessment = assessments.find((a) => a.id === form.assessmentId);

  useEffect(() => {
    if (form.classId) {
      const classStudents = students.filter((s) =>
        s.enrollments?.some((e) => e.classId === form.classId)
      );
      setFilteredStudents(classStudents);
    } else {
      setFilteredStudents(students);
    }
  }, [form.classId, students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.enterResult({
        assessmentId: form.assessmentId,
        studentId: form.studentId,
        score: form.score,
        remark: form.remark || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enter result');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Enter Result</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="label">Assessment *</label>
            <select
              value={form.assessmentId}
              onChange={(e) => setForm({ ...form, assessmentId: e.target.value })}
              className="select"
              required
            >
              <option value="">Select an assessment</option>
              {assessments.map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.title} ({assessment.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Filter by Class</label>
            <select
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value, studentId: '' })}
              className="select"
            >
              <option value="">All Students</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Student *</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="select"
              required
            >
              <option value="">Select a student</option>
              {filteredStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Score *</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.score}
                onChange={(e) => setForm({ ...form, score: parseFloat(e.target.value) })}
                className="input"
                min={0}
                max={selectedAssessment?.totalMark || 100}
                required
              />
              <span className="text-gray-500">/ {selectedAssessment?.totalMark || 100}</span>
            </div>
            {selectedAssessment && (
              <p className="text-sm text-gray-500 mt-1">
                Percentage: {Math.round((form.score / selectedAssessment.totalMark) * 100)}%
              </p>
            )}
          </div>

          <div>
            <label className="label">Remark</label>
            <textarea
              value={form.remark}
              onChange={(e) => setForm({ ...form, remark: e.target.value })}
              className="input"
              rows={2}
              placeholder="Optional comment..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Saving...' : 'Enter Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
