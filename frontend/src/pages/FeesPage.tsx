import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { FeeStructure, FeePayment, Invoice, Student, Class } from '../types';
import { Plus, Search, DollarSign, Receipt, MoreVertical, Edit, Trash2, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';

type Tab = 'structures' | 'payments' | 'invoices';

export default function FeesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('structures');
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddStructureModal, setShowAddStructureModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<FeeStructure | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [classesData, studentsData, structuresData, paymentsData, invoicesData] = await Promise.all([
        api.getClasses(),
        api.getStudents(),
        api.getFeeStructures(),
        api.getFeePayments(),
        api.getInvoices(),
      ]);
      setClasses(classesData);
      setStudents(studentsData);
      setFeeStructures(structuresData);
      setPayments(paymentsData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStructure = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await api.deleteFeeStructure(id);
        setFeeStructures(feeStructures.filter((s) => s.id !== id));
      } catch (error) {
        console.error('Failed to delete fee structure:', error);
      }
    }
    setShowMenu(null);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'structures', label: 'Fee Structures', icon: DollarSign },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fees Management</h1>
          <p className="text-gray-600 mt-1">Manage fee structures, payments, and invoices</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'structures' && (
            <button onClick={() => setShowAddStructureModal(true)} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Add Structure
            </button>
          )}
          {activeTab === 'payments' && (
            <button onClick={() => setShowRecordPaymentModal(true)} className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fee Structures</p>
              <p className="text-2xl font-bold text-gray-900">{feeStructures.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Collected</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${payments.reduce((sum, p) => sum + p.amountPaid, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">
                ${invoices.reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'structures' && (
            <FeeStructuresTab
              structures={feeStructures}
              classes={classes}
              searchQuery={searchQuery}
              onEdit={(s) => {
                setSelectedStructure(s);
                setShowAddStructureModal(true);
              }}
              onDelete={handleDeleteStructure}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
            />
          )}
          {activeTab === 'payments' && (
            <PaymentsTab
              payments={payments}
              students={students}
              feeStructures={feeStructures}
              searchQuery={searchQuery}
            />
          )}
          {activeTab === 'invoices' && (
            <InvoicesTab
              invoices={invoices}
              students={students}
              searchQuery={searchQuery}
            />
          )}
        </>
      )}

      {/* Add Structure Modal */}
      {showAddStructureModal && (
        <FeeStructureModal
          structure={selectedStructure}
          classes={classes}
          onClose={() => {
            setShowAddStructureModal(false);
            setSelectedStructure(null);
            fetchData();
          }}
        />
      )}

      {/* Record Payment Modal */}
      {showRecordPaymentModal && (
        <RecordPaymentModal
          students={students}
          feeStructures={feeStructures}
          onClose={() => {
            setShowRecordPaymentModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function FeeStructuresTab({
  structures,
  classes,
  searchQuery,
  onEdit,
  onDelete,
  showMenu,
  setShowMenu,
}: {
  structures: FeeStructure[];
  classes: Class[];
  searchQuery: string;
  onEdit: (s: FeeStructure) => void;
  onDelete: (id: string) => void;
  showMenu: string | null;
  setShowMenu: (id: string | null) => void;
}) {
  const filtered = structures.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="card overflow-hidden">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <DollarSign className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">No fee structures</p>
          <p className="text-sm">Add a fee structure to get started</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Class</th>
                <th>Term</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((structure) => {
                const cls = classes.find((c) => c.id === structure.classId);
                return (
                  <tr key={structure.id}>
                    <td className="font-medium text-gray-900">{structure.title}</td>
                    <td>
                      <span className="text-lg font-semibold text-gray-900">
                        ${structure.amount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{cls?.name || 'All Classes'}</span>
                    </td>
                    <td className="text-gray-600">{structure.term || '-'}</td>
                    <td className="text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setShowMenu(showMenu === structure.id ? null : structure.id)}
                          className="btn btn-ghost btn-sm"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showMenu === structure.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(null)} />
                            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                              <button
                                onClick={() => {
                                  onEdit(structure);
                                  setShowMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4 text-gray-500" />
                                Edit
                              </button>
                              <button
                                onClick={() => onDelete(structure.id)}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PaymentsTab({
  payments,
  students,
  feeStructures,
  searchQuery,
}: {
  payments: FeePayment[];
  students: Student[];
  feeStructures: FeeStructure[];
  searchQuery: string;
}) {
  const filtered = payments.filter((payment) => {
    const student = payment.student || students.find((s) => s.id === payment.studentId);
    return student?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="card overflow-hidden">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <CreditCard className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">No payments recorded</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Fee</th>
                <th>Amount Paid</th>
                <th>Method</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((payment) => {
                const student = payment.student || students.find((s) => s.id === payment.studentId);
                const fee = payment.fee || feeStructures.find((f) => f.id === payment.feeId);
                return (
                  <tr key={payment.id}>
                    <td className="font-medium text-gray-900">{student?.fullName || 'Unknown'}</td>
                    <td className="text-gray-600">{fee?.title || '-'}</td>
                    <td className="text-emerald-600 font-medium">${payment.amountPaid.toLocaleString()}</td>
                    <td>
                      <span className="badge badge-neutral">{payment.method}</span>
                    </td>
                    <td className="text-gray-600">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InvoicesTab({
  invoices,
  students,
  searchQuery,
}: {
  invoices: Invoice[];
  students: Student[];
  searchQuery: string;
}) {
  const filtered = invoices.filter((invoice) => {
    const student = students.find((s) => s.id === invoice.studentId);
    return student?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.length === 0 ? (
        <div className="col-span-full card flex flex-col items-center justify-center h-64 text-gray-500">
          <Receipt className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">No invoices</p>
        </div>
      ) : (
        filtered.map((invoice) => {
          const student = students.find((s) => s.id === invoice.studentId);
          const percentage = invoice.totalAmount > 0
            ? Math.round((invoice.paidAmount / invoice.totalAmount) * 100)
            : 0;

          return (
            <div key={invoice.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{student?.fullName || 'Unknown'}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge ${
                  invoice.status === 'PAID' ? 'badge-success' :
                  invoice.status === 'PARTIAL' ? 'badge-warning' : 'badge-danger'
                }`}>
                  {invoice.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="font-medium">${invoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Paid</span>
                  <span className="font-medium text-emerald-600">${invoice.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Balance</span>
                  <span className="font-medium text-red-600">
                    ${(invoice.totalAmount - invoice.paidAmount).toLocaleString()}
                  </span>
                </div>

                <div className="pt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Payment Progress</span>
                    <span className="text-gray-900">{percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function FeeStructureModal({
  structure,
  classes,
  onClose,
}: {
  structure: FeeStructure | null;
  classes: Class[];
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: structure?.title || '',
    amount: structure?.amount || 0,
    term: structure?.term || '',
    classId: structure?.classId || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (structure) {
        await api.updateFeeStructure(structure.id, form);
      } else {
        await api.createFeeStructure(form);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fee structure');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {structure ? 'Edit Fee Structure' : 'Add Fee Structure'}
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
              placeholder="e.g., Tuition Fee"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
                className="input"
                min={0}
                required
              />
            </div>
            <div>
              <label className="label">Term</label>
              <input
                type="text"
                value={form.term}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
                className="input"
                placeholder="e.g., Term 1"
              />
            </div>
          </div>

          <div>
            <label className="label">Class</label>
            <select
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
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

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Saving...' : structure ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecordPaymentModal({
  students,
  feeStructures,
  onClose,
}: {
  students: Student[];
  feeStructures: FeeStructure[];
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    studentId: '',
    feeId: '',
    amountPaid: 0,
    method: 'CASH',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.recordPayment(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="label">Student *</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="select"
              required
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Fee *</label>
            <select
              value={form.feeId}
              onChange={(e) => setForm({ ...form, feeId: e.target.value })}
              className="select"
              required
            >
              <option value="">Select a fee</option>
              {feeStructures.map((fee) => (
                <option key={fee.id} value={fee.id}>
                  {fee.title} - ${fee.amount}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount *</label>
              <input
                type="number"
                value={form.amountPaid}
                onChange={(e) => setForm({ ...form, amountPaid: parseFloat(e.target.value) })}
                className="input"
                min={0}
                required
              />
            </div>
            <div>
              <label className="label">Method *</label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="select"
                required
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHECK">Check</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
