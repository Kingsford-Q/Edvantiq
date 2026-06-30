import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { AttendanceSession, Class, Subject, Student, AttendanceStatus } from '../types';
import { Plus, Search, Calendar, Users, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';

export default function AttendancePage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [showMarkModal, setShowMarkModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sessionsData, classesData] = await Promise.all([
        api.getAttendanceSessions(),
        api.getClasses(),
      ]);
      setSessions(sessionsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const className = session.class?.name || '';
    return className.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const todaySessions = filteredSessions.filter(
    (s) => new Date(s.date).toDateString() === new Date().toDateString()
  );
  const pastSessions = filteredSessions.filter(
    (s) => new Date(s.date) < new Date(new Date().toDateString())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">Mark and track student attendance</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          New Session
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by class name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Today's Sessions */}
          {todaySessions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Today's Sessions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todaySessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onMark={() => {
                      setSelectedSession(session);
                      setShowMarkModal(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Sessions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Sessions</h2>
            {pastSessions.length === 0 ? (
              <div className="card flex flex-col items-center justify-center h-40 text-gray-500">
                <Calendar className="w-10 h-10 mb-3 opacity-50" />
                <p>No past attendance sessions</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Class</th>
                        <th>Subject</th>
                        <th>Records</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pastSessions.slice(0, 10).map((session) => (
                        <tr key={session.id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(session.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="font-medium text-gray-900">
                            {session.class?.name || '-'}
                          </td>
                          <td>{session.subject?.name || '-'}</td>
                          <td>
                            <span className="badge badge-neutral">
                              {session.records?.length || 0} records
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              onClick={() => {
                                setSelectedSession(session);
                                setShowMarkModal(true);
                              }}
                              className="btn btn-ghost btn-sm"
                            >
                              View
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateSessionModal
          classes={classes}
          onClose={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}

      {/* Mark Attendance Modal */}
      {showMarkModal && selectedSession && (
        <MarkAttendanceModal
          session={selectedSession}
          onClose={() => {
            setShowMarkModal(false);
            setSelectedSession(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function SessionCard({
  session,
  onMark,
}: {
  session: AttendanceSession;
  onMark: () => void;
}) {
  const presentCount = session.records?.filter((r) => r.status === 'PRESENT').length || 0;
  const absentCount = session.records?.filter((r) => r.status === 'ABSENT').length || 0;
  const lateCount = session.records?.filter((r) => r.status === 'LATE').length || 0;
  const totalRecords = session.records?.length || 0;

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{session.class?.name || 'Class'}</h3>
            {session.subject && (
              <p className="text-sm text-gray-500">{session.subject.name}</p>
            )}
          </div>
        </div>
        <button onClick={onMark} className="btn btn-primary btn-sm">
          Mark
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>{presentCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="w-4 h-4 text-red-500" />
          <span>{absentCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>{lateCount}</span>
        </div>
        <span className="text-gray-400 ml-auto">
          {totalRecords} total
        </span>
      </div>
    </div>
  );
}

function CreateSessionModal({
  classes,
  onClose,
}: {
  classes: Class[];
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    classId: '',
    subjectId: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSubjects().then(setSubjects).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.createAttendanceSession({
        classId: form.classId,
        subjectId: form.subjectId || undefined,
        date: form.date,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Attendance Session</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

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
            <label className="label">Subject (Optional)</label>
            <select
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className="select"
            >
              <option value="">None</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MarkAttendanceModal({
  session,
  onClose,
}: {
  session: AttendanceSession;
  onClose: () => void;
}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students for the class and any already-marked records in parallel
        const [classData, existingRecordsList] = await Promise.all([
          api.getClass(session.classId),
          api.getAttendanceRecords(session.id),
        ]);
        const enrolledStudents = classData.enrollments?.map((e) => e.student).filter((s): s is Student => Boolean(s)) || [];
        setStudents(enrolledStudents);

        // Initialize records from existing data
        const existingRecords: Record<string, AttendanceStatus> = {};
        existingRecordsList.forEach((r) => {
          existingRecords[r.studentId] = r.status;
        });
        setRecords(existingRecords);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mark attendance for each student with a changed status
      for (const [studentId, status] of Object.entries(records)) {
        await api.markAttendance({
          sessionId: session.id,
          studentId,
          status,
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save attendance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = Object.values(records).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(records).filter((s) => s === 'ABSENT').length;
  const lateCount = Object.values(records).filter((s) => s === 'LATE').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {session.class?.name || 'Class'} Attendance
            </h2>
            <p className="text-sm text-gray-600">
              {new Date(session.date).toLocaleDateString()}
              {session.subject && ` - ${session.subject.name}`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            &times;
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="font-medium">{presentCount}</span>
            <span className="text-gray-500">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium">{absentCount}</span>
            <span className="text-gray-500">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="font-medium">{lateCount}</span>
            <span className="text-gray-500">Late</span>
          </div>
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : students.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No students enrolled in this class</p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {student.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{student.fullName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(student.id, 'PRESENT')}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        records[student.id] === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500'
                          : 'bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'ABSENT')}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        records[student.id] === 'ABSENT'
                          ? 'bg-red-100 text-red-600 ring-2 ring-red-500'
                          : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
                      }`}
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'LATE')}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        records[student.id] === 'LATE'
                          ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-500'
                          : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-500'
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
            {isSaving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
}
