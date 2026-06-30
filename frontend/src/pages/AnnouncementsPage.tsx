import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import type { Announcement } from '../types';
import { Plus, Megaphone, Search, Bell, Calendar, Edit, Trash2, MoreVertical } from 'lucide-react';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER';
  const canManage = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api.deleteAnnouncement(id);
        setAnnouncements(announcements.filter((a) => a.id !== id));
      } catch (error) {
        console.error('Failed to delete announcement:', error);
      }
    }
    setShowMenu(null);
  };

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">School-wide announcements and notices</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        )}
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Announcements */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-64 text-gray-500">
          <Megaphone className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">No announcements</p>
          <p className="text-sm">Create your first announcement to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <div key={announcement.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                      <span className="badge badge-info">{announcement.type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <p className="text-gray-600 whitespace-pre-wrap">{announcement.message}</p>
                  </div>
                </div>
                {canManage && (
                <div className="relative ml-4">
                  <button
                    onClick={() => setShowMenu(showMenu === announcement.id ? null : announcement.id)}
                    className="btn btn-ghost btn-sm"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showMenu === announcement.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMenu(null)} />
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                        <button
                          onClick={() => {
                            setSelectedAnnouncement(announcement);
                            setShowAddModal(true);
                            setShowMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(announcement.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => {
            setShowAddModal(false);
            setSelectedAnnouncement(null);
            fetchAnnouncements();
          }}
        />
      )}
    </div>
  );
}

function AnnouncementModal({
  announcement,
  onClose,
}: {
  announcement: Announcement | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: announcement?.title || '',
    message: announcement?.message || '',
    type: announcement?.type || 'GENERAL',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (announcement) {
        await api.updateAnnouncement(announcement.id, form);
      } else {
        await api.createAnnouncement(form);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save announcement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {announcement ? 'Edit Announcement' : 'New Announcement'}
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
              placeholder="e.g., Upcoming Mid-Term Exams"
              required
            />
          </div>

          <div>
            <label className="label">Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="select"
              required
            >
              <option value="GENERAL">General</option>
              <option value="ACADEMIC">Academic</option>
              <option value="EVENT">Event</option>
              <option value="URGENT">Urgent</option>
              <option value="HOLIDAY">Holiday</option>
            </select>
          </div>

          <div>
            <label className="label">Message *</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="input"
              rows={6}
              placeholder="Write your announcement message..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Saving...' : announcement ? 'Update' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
