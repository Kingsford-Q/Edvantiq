import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { School, AccessRequest } from '../types';
import { Plus, Building, Clock, CheckCircle, XCircle, LogIn, Search } from 'lucide-react';

export default function PlatformPage() {
  const navigate = useNavigate();
  const [schools, setSchools] = useState<School[]>([]);
  const [myRequests, setMyRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [schoolsData, requestsData] = await Promise.all([
        api.getSchools(),
        api.getMyAccessRequests(),
      ]);
      setSchools(schoolsData);
      setMyRequests(requestsData);
    } catch (err) {
      console.error('Failed to fetch platform data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const requestForSchool = (schoolId: string) =>
    myRequests
      .filter((r) => r.schoolId === schoolId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const isApprovedAndActive = (request?: AccessRequest) =>
    !!request &&
    request.status === 'APPROVED' &&
    (!request.expiresAt || new Date(request.expiresAt).getTime() > Date.now());

  const handleRequestAccess = async (schoolId: string) => {
    setError('');
    try {
      await api.requestAccess(schoolId);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request access');
    }
  };

  const handleEnterSchool = (school: School) => {
    api.setActiveSchool({ id: school.id, name: school.name });
    navigate('/dashboard');
  };

  const filteredSchools = schools.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform</h1>
          <p className="text-gray-600 mt-1">
            Schools on EdvantiQ. Request temporary access to manage a school's data.
          </p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          New School
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search schools..."
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
      ) : filteredSchools.length === 0 ? (
        <div className="card flex flex-col items-center justify-center h-64 text-gray-500">
          <Building className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">No schools yet</p>
          <p className="text-sm">Create the first school to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => {
            const request = requestForSchool(school.id);
            const approved = isApprovedAndActive(request);

            return (
              <div key={school.id} className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{school.name}</h3>
                    <p className="text-sm text-gray-500">{school.location}</p>
                  </div>
                </div>

                <span className="badge badge-neutral mb-4">{school.type}</span>

                {request && (
                  <div className="flex items-center gap-2 text-sm mb-4">
                    {request.status === 'PENDING' && (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Clock className="w-4 h-4" /> Access request pending
                      </span>
                    )}
                    {request.status === 'APPROVED' && approved && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle className="w-4 h-4" /> Access approved
                        {request.expiresAt && ` until ${new Date(request.expiresAt).toLocaleTimeString()}`}
                      </span>
                    )}
                    {request.status === 'APPROVED' && !approved && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" /> Access expired
                      </span>
                    )}
                    {request.status === 'REJECTED' && (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle className="w-4 h-4" /> Access rejected
                      </span>
                    )}
                  </div>
                )}

                {approved ? (
                  <button onClick={() => handleEnterSchool(school)} className="btn btn-primary w-full">
                    <LogIn className="w-4 h-4" />
                    Enter School
                  </button>
                ) : (
                  <button
                    onClick={() => handleRequestAccess(school.id)}
                    disabled={request?.status === 'PENDING'}
                    className="btn btn-secondary w-full"
                  >
                    {request?.status === 'PENDING' ? 'Request Pending' : 'Request Access'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateSchoolModal
          onClose={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function CreateSchoolModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: '',
    type: 'BASIC' as School['type'],
    location: '',
    adminEmail: '',
    adminPassword: '',
    adminName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.createSchool(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create school');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New School</h2>
          <p className="text-sm text-gray-600 mt-1">
            Creates the school and its first Admin account in one step.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="label">School Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as School['type'] })}
                className="select"
                required
              >
                <option value="BASIC">Basic School</option>
                <option value="SECONDARY">Secondary School</option>
                <option value="TERTIARY">Tertiary Institution</option>
              </select>
            </div>
            <div>
              <label className="label">Location *</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900 mb-3 mt-4">First Admin Account</p>
          </div>

          <div>
            <label className="label">Admin Name *</label>
            <input
              type="text"
              value={form.adminName}
              onChange={(e) => setForm({ ...form, adminName: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Admin Email *</label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Admin Password *</label>
              <input
                type="password"
                value={form.adminPassword}
                onChange={(e) => setForm({ ...form, adminPassword: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Creating...' : 'Create School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
