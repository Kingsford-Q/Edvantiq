import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import type { School } from '../types';
import { User, Lock, Bell, Shield, Building, Save } from 'lucide-react';

type Tab = 'profile' | 'security' | 'notifications' | 'school';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const canManageSchool = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(canManageSchool ? [{ id: 'school' as Tab, label: 'School', icon: Building }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="card">
            {activeTab === 'profile' && <ProfileTab user={user} updateUser={updateUser} />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'school' && canManageSchool && <SchoolTab user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({
  user,
  updateUser,
}: {
  user: ReturnType<typeof useAuth>['user'];
  updateUser: ReturnType<typeof useAuth>['updateUser'];
}) {
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      const updated = await api.updateMe(form);
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <span className="text-2xl font-semibold text-blue-600">
              {user ? getInitials(user.fullName) : ''}
            </span>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500">
            Profile photo uploads aren't supported yet — set a profileImageUrl via the API for now.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">Full Name</label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" value={user?.email || ''} className="input" disabled />
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
        <div>
          <label className="label">Role</label>
          <input type="text" value={user?.role || ''} className="input" disabled />
        </div>
        <div className="md:col-span-2">
          <label className="label">Address</label>
          <textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="input"
            rows={3}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
        <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && <span className="text-sm text-emerald-600">Changes saved!</span>}
      </div>
    </div>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    setIsSaving(true);
    try {
      await api.changePassword(form.currentPassword, form.newPassword);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 max-w-md">
              {error}
            </div>
          )}
          {saved && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-600 max-w-md">
              Password updated successfully
            </div>
          )}

          <div className="space-y-4 max-w-md">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="input"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={isSaving || !form.currentPassword || !form.newPassword}
              className="btn btn-primary"
            >
              {isSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between max-w-md">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">Not available yet</p>
            </div>
            <button className="btn btn-secondary" disabled>
              <Shield className="w-4 h-4" />
              Coming soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
        Notification preference controls aren't wired up to the backend yet — toggles here are
        cosmetic for now. In-app notifications themselves work and show up in the bell icon.
      </div>
    </div>
  );
}

function SchoolTab({ user }: { user: ReturnType<typeof useAuth>['user'] }) {
  const [school, setSchool] = useState<School | null>(null);
  const [form, setForm] = useState<{ name: string; type: School['type']; location: string }>({
    name: '',
    type: 'BASIC',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const schoolId = user?.role === 'SUPER_ADMIN' ? api.getActiveSchoolId() : user?.schoolId;

  useEffect(() => {
    if (!schoolId) {
      setIsLoading(false);
      return;
    }
    api
      .getSchoolById(schoolId)
      .then((s) => {
        setSchool(s);
        setForm({ name: s.name, type: s.type, location: s.location });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load school'))
      .finally(() => setIsLoading(false));
  }, [schoolId]);

  const handleSave = async () => {
    if (!schoolId) return;
    setError('');
    setIsSaving(true);
    try {
      const updated = await api.updateSchool(schoolId, form);
      setSchool(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update school');
    } finally {
      setIsSaving(false);
    }
  };

  if (!schoolId) {
    return (
      <div className="p-6 text-sm text-gray-500">
        No active school context. {user?.role === 'SUPER_ADMIN' ? 'Enter a school from the Platform page first.' : ''}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">School Information</h2>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center">
          <Building className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{school?.name}</h3>
          <p className="text-sm text-gray-600">School ID: {schoolId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label">School Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">School Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as School['type'] })}
            className="select"
          >
            <option value="BASIC">Basic School</option>
            <option value="SECONDARY">Secondary School</option>
            <option value="TERTIARY">Tertiary Institution</option>
          </select>
        </div>
        <div>
          <label className="label">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
        <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Update School Info'}
        </button>
        {saved && <span className="text-sm text-emerald-600">Changes saved!</span>}
      </div>
    </div>
  );
}
