import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import {
  School,
  Building,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileText,
  DollarSign,
  Megaphone,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Menu,
  X,
  User,
} from 'lucide-react';
import type { Role, Notification } from '../../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: Role[];
  // Requires an active school context (only relevant for SUPER_ADMIN, who has none by default)
  schoolScoped?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Platform', path: '/platform', icon: Building, roles: ['SUPER_ADMIN'] },
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF'] },
  { label: 'Students', path: '/students', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF'], schoolScoped: true },
  { label: 'Teachers', path: '/teachers', icon: GraduationCap, roles: ['SUPER_ADMIN', 'ADMIN'], schoolScoped: true },
  { label: 'Classes', path: '/classes', icon: BookOpen, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'], schoolScoped: true },
  { label: 'Subjects', path: '/subjects', icon: BookOpen, roles: ['SUPER_ADMIN', 'ADMIN'], schoolScoped: true },
  { label: 'Attendance', path: '/attendance', icon: ClipboardList, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], schoolScoped: true },
  { label: 'Assessments', path: '/assessments', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER'], schoolScoped: true },
  { label: 'Results', path: '/results', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'], schoolScoped: true },
  { label: 'Fees', path: '/fees', icon: DollarSign, roles: ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'STUDENT', 'PARENT'], schoolScoped: true },
  { label: 'Announcements', path: '/announcements', icon: Megaphone, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF'], schoolScoped: true },
  { label: 'Messages', path: '/messages', icon: Megaphone, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF'], schoolScoped: true },
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'STAFF'] },
];

function SidebarLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'} ${
          collapsed ? 'justify-center' : ''
        }`
      }
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const activeSchoolId = api.getActiveSchoolId();
  const activeSchoolName = api.getActiveSchoolName();
  const isSuperAdminOutsideSchool = user?.role === 'SUPER_ADMIN' && !activeSchoolId;

  const filteredNavItems = navItems.filter(
    (item) =>
      user &&
      item.roles.includes(user.role) &&
      !(isSuperAdminOutsideSchool && item.schoolScoped)
  );

  useEffect(() => {
    if (!user || isSuperAdminOutsideSchool) return;
    api.getNotifications().then(setNotifications).catch(() => {});
  }, [user, isSuperAdminOutsideSchool]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExitSchool = () => {
    api.setActiveSchool(null);
    navigate('/platform');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-gray-200 ${sidebarCollapsed ? 'justify-center' : 'px-6'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <School className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-gray-900">EdvantiQ</h1>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              <SidebarLink key={item.path} item={item} collapsed={sidebarCollapsed} />
            ))}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 p-3">
          {!sidebarCollapsed && user && (
            <div className="mb-3 px-3">
              <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`sidebar-link sidebar-link-inactive w-full ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-20 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          style={{ zIndex: 20 }}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <School className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-gray-900">EdvantiQ</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="border-t border-gray-200 p-3">
          <button onClick={handleLogout} className="sidebar-link sidebar-link-inactive w-full">
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 gap-4">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          {user?.role === 'SUPER_ADMIN' && activeSchoolId && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">Inside: </span>
              <span className="font-medium">{activeSchoolName || activeSchoolId}</span>
              <button onClick={handleExitSchool} className="ml-1 text-blue-600 hover:text-blue-800 underline">
                Exit
              </button>
            </div>
          )}
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="px-4 py-3 border-b border-gray-100 font-medium text-gray-900 text-sm">
                    Notifications
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-500">No notifications</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((n) => (
                        <div key={n.id} className={`px-4 py-3 ${n.isRead ? '' : 'bg-blue-50/50'}`}>
                          <p className="text-sm font-medium text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-blue-600">
                  {user ? getInitials(user.fullName) : <User className="w-4 h-4" />}
                </span>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
