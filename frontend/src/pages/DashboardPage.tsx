import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import type { Student, Teacher, Class, Assessment, Announcement, AttendanceSession, Invoice } from '../types';
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Bell,
  ClipboardCheck,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; label: string };
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.value >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  label: string;
  description: string;
  icon: React.ElementType;
  onClick?: () => void;
}

function QuickAction({ label, description, icon: Icon, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [myProfile, setMyProfile] = useState<Student | null>(null);
  const [myChildren, setMyChildren] = useState<Student[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isSuperAdminOutsideSchool = user?.role === 'SUPER_ADMIN' && !api.getActiveSchoolId();

  useEffect(() => {
    if (isSuperAdminOutsideSchool) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
          const [studentsData, teachersData, classesData, assessmentsData, sessionsData, announcementsData] =
            await Promise.all([
              api.getStudents(),
              api.getTeachers(),
              api.getClasses(),
              api.getAssessments(),
              api.getAttendanceSessions(),
              api.getAnnouncements(),
            ]);
          setStudents(studentsData);
          setTeachers(teachersData);
          setClasses(classesData);
          setAssessments(assessmentsData);
          setSessions(sessionsData);
          setAnnouncements(announcementsData);
        } else if (user?.role === 'TEACHER') {
          const [classesData, assessmentsData, sessionsData] = await Promise.all([
            api.getClasses(),
            api.getAssessments(),
            api.getAttendanceSessions(),
          ]);
          setClasses(classesData);
          setAssessments(assessmentsData);
          setSessions(sessionsData);
        } else if (user?.role === 'STUDENT') {
          const profile = await api.getMyStudentProfile().catch(() => null);
          setMyProfile(profile);
        } else if (user?.role === 'PARENT') {
          const children = await api.getMyChildren().catch(() => []);
          setMyChildren(children);
        } else if (user?.role === 'STAFF') {
          const [studentsData, invoicesData] = await Promise.all([
            api.getStudents(),
            api.getInvoices(),
          ]);
          setStudents(studentsData);
          setInvoices(invoicesData);
        } else {
          const [assessmentsData, sessionsData] = await Promise.all([
            api.getAssessments(),
            api.getAttendanceSessions(),
          ]);
          setAssessments(assessmentsData);
          setSessions(sessionsData);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isSuperAdminOutsideSchool]);

  if (isSuperAdminOutsideSchool) {
    return <Navigate to="/platform" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderAdminDashboard = () => (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.fullName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={students.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Teachers"
          value={teachers.length}
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          title="Active Classes"
          value={classes.length}
          icon={BookOpen}
          color="amber"
        />
        <StatCard
          title="Assessments"
          value={assessments.length}
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            label="Add Student"
            description="Onboard a new student"
            icon={Users}
            onClick={() => navigate('/students')}
          />
          <QuickAction
            label="Add Teacher"
            description="Onboard a new teacher"
            icon={GraduationCap}
            onClick={() => navigate('/teachers')}
          />
          <QuickAction
            label="Create Class"
            description="Add a new class"
            icon={BookOpen}
            onClick={() => navigate('/classes')}
          />
          <QuickAction
            label="New Assessment"
            description="Create an assessment"
            icon={FileText}
            onClick={() => navigate('/assessments')}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance Sessions */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Attendance</h3>
            <a href="/attendance" className="text-sm text-blue-600 hover:text-blue-700">View all</a>
          </div>
          <div className="divide-y divide-gray-100">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {session.class?.name || 'Class'}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="badge badge-success">Completed</span>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No attendance sessions yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Announcements</h3>
            <a href="/announcements" className="text-sm text-blue-600 hover:text-blue-700">View all</a>
          </div>
          <div className="divide-y divide-gray-100">
            {announcements.slice(0, 5).map((announcement) => (
              <div key={announcement.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{announcement.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{announcement.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No announcements yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderTeacherDashboard = () => (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.fullName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="My Classes"
          value={classes.length}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Assessments"
          value={assessments.length}
          icon={FileText}
          color="emerald"
        />
        <StatCard
          title="Attendance Sessions"
          value={sessions.length}
          icon={ClipboardCheck}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">Today's Tasks</h3>
          </div>
          <div className="p-6 space-y-4">
            <QuickAction
              label="Mark Attendance"
              description="Record today's attendance"
              icon={ClipboardCheck}
              onClick={() => navigate('/attendance')}
            />
            <QuickAction
              label="Enter Results"
              description="Input assessment scores"
              icon={TrendingUp}
              onClick={() => navigate('/results')}
            />
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">Recent Sessions</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{session.class?.name || 'Class'}</p>
                  <p className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                </div>
                <span className="badge badge-success">Completed</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderStudentDashboard = () => {
    const results = myProfile?.results || [];
    const attendanceRecords = myProfile?.attendanceRecords || [];
    const avgScore = results.length
      ? Math.round(
          results.reduce((sum, r) => sum + (r.assessment ? (r.score / r.assessment.totalMark) * 100 : r.score), 0) /
            results.length
        )
      : null;
    const attendanceRate = attendanceRecords.length
      ? Math.round(
          (attendanceRecords.filter((r) => r.status === 'PRESENT').length / attendanceRecords.length) * 100
        )
      : null;

    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.fullName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="My Results" value={results.length} icon={FileText} color="blue" />
          <StatCard
            title="Attendance Rate"
            value={attendanceRate !== null ? `${attendanceRate}%` : 'N/A'}
            icon={ClipboardCheck}
            color="emerald"
          />
          <StatCard
            title="Average Score"
            value={avgScore !== null ? `${avgScore}%` : 'N/A'}
            icon={TrendingUp}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Results */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">Recent Results</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {results.slice(0, 5).map((result) => (
                <div key={result.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{result.assessment?.title || 'Assessment'}</p>
                    <p className="text-xs text-gray-500">{result.assessment?.type}</p>
                  </div>
                  <span className="badge badge-info">
                    {result.score}/{result.assessment?.totalMark ?? '-'}
                  </span>
                </div>
              ))}
              {results.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">No results yet</div>
              )}
            </div>
          </div>

          {/* Upcoming Assessments */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">Upcoming</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {assessments.slice(0, 5).map((assessment) => (
                <div key={assessment.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{assessment.title}</p>
                      <p className="text-xs text-gray-500">{assessment.totalMark} marks</p>
                    </div>
                  </div>
                  <span className="badge badge-warning">Upcoming</span>
                </div>
              ))}
              {assessments.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-sm">No assessments yet</div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderParentDashboard = () => {
    const childStats = myChildren.map((child) => {
      const results = child.results || [];
      const attendanceRecords = child.attendanceRecords || [];
      const avgScore = results.length
        ? Math.round(
            results.reduce((sum, r) => sum + (r.assessment ? (r.score / r.assessment.totalMark) * 100 : r.score), 0) /
              results.length
          )
        : null;
      const attendanceRate = attendanceRecords.length
        ? Math.round(
            (attendanceRecords.filter((r) => r.status === 'PRESENT').length / attendanceRecords.length) * 100
          )
        : null;
      return { child, avgScore, attendanceRate };
    });

    return (
      <>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.fullName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Children" value={myChildren.length} icon={Users} color="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {childStats.length === 0 ? (
            <div className="card flex flex-col items-center justify-center h-40 text-gray-500 lg:col-span-2">
              <Users className="w-10 h-10 mb-3 opacity-50" />
              <p>No children linked to your account yet</p>
            </div>
          ) : (
            childStats.map(({ child, avgScore, attendanceRate }) => (
              <div key={child.id} className="card">
                <div className="card-header">
                  <h3 className="font-semibold text-gray-900">{child.fullName}</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{child.fullName}</p>
                      <p className="text-sm text-gray-500">
                        {child.enrollments?.[0]?.class?.name || 'Not enrolled'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className="text-xl font-bold text-gray-900">
                        {avgScore !== null ? `${avgScore}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600">Attendance</p>
                      <p className="text-xl font-bold text-gray-900">
                        {attendanceRate !== null ? `${attendanceRate}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </>
    );
  };

  const renderStaffDashboard = () => (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.fullName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Students"
          value={students.length}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending Fees"
          value={invoices.filter((i) => i.status !== 'PAID').length}
          icon={DollarSign}
          color="amber"
        />
        <StatCard
          title="Invoices"
          value={invoices.length}
          icon={FileText}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-4">
            <QuickAction
              label="Record Payment"
              description="Log a new fee payment"
              icon={DollarSign}
              onClick={() => navigate('/fees')}
            />
            <QuickAction
              label="View Invoices"
              description="Check invoice status"
              icon={FileText}
              onClick={() => navigate('/fees')}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-gray-900">Recent Invoices</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {invoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{invoice.student?.fullName || 'Student'}</p>
                  <p className="text-xs text-gray-500">${invoice.totalAmount.toLocaleString()}</p>
                </div>
                <span className={`badge ${
                  invoice.status === 'PAID' ? 'badge-success' :
                  invoice.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'
                }`}>
                  {invoice.status}
                </span>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No invoices yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  switch (user?.role) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return renderAdminDashboard();
    case 'TEACHER':
      return renderTeacherDashboard();
    case 'STUDENT':
      return renderStudentDashboard();
    case 'PARENT':
      return renderParentDashboard();
    case 'STAFF':
      return renderStaffDashboard();
    default:
      return renderAdminDashboard();
  }
}
