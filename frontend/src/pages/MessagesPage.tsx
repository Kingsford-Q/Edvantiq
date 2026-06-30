import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Message, UserSummary } from '../types';
import { Plus, Search, Send, Inbox, Mail, User as UserIcon, ChevronRight } from 'lucide-react';

type Tab = 'inbox' | 'sent';

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      if (activeTab === 'inbox') {
        const data = await api.getInbox();
        setMessages(data);
      } else {
        const data = await api.getSentMessages();
        setSentMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMessages = activeTab === 'inbox' ? messages : sentMessages;

  const filteredMessages = currentMessages.filter((msg) =>
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">View and send messages</p>
        </div>
        <button onClick={() => setShowComposeModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Compose
        </button>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'inbox'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Inbox
            {messages.length > 0 && (
              <span className="ml-1 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                {messages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'sent'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send className="w-4 h-4" />
            Sent
          </button>
          <div className="flex-1" />
          <div className="flex items-center px-4 py-3 w-64">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm border-0 focus:ring-0 p-0 flex-1"
            />
          </div>
        </div>

        {/* Messages List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Mail className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium">No messages</p>
            <p className="text-sm">
              {activeTab === 'inbox' ? 'Your inbox is empty' : "You haven't sent any messages"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 truncate">
                        {activeTab === 'inbox'
                          ? message.sender?.fullName || 'Unknown'
                          : message.receiver?.fullName || 'Broadcast'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <ComposeModal
          onClose={() => {
            setShowComposeModal(false);
            fetchMessages();
          }}
        />
      )}

      {/* View Message Modal */}
      {selectedMessage && (
        <MessageViewModal
          message={selectedMessage}
          isSent={activeTab === 'sent'}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
}

function ComposeModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    receiverId: '',
    content: '',
  });
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getUsers().then(setUsers).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.sendMessage({
        receiverId: form.receiverId || undefined,
        content: form.content,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Message</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="label">Recipient (leave blank to broadcast to the school)</label>
            <select
              value={form.receiverId}
              onChange={(e) => setForm({ ...form, receiverId: e.target.value })}
              className="select"
            >
              <option value="">Broadcast (whole school)</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} {u.role ? `(${u.role.name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Message *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="input"
              rows={6}
              placeholder="Type your message..."
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              <Send className="w-4 h-4" />
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MessageViewModal({
  message,
  isSent,
  onClose,
}: {
  message: Message;
  isSent: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Message</h2>
            <p className="text-sm text-gray-600">
              {new Date(message.createdAt).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            &times;
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {isSent ? 'To' : 'From'}
              </p>
              <p className="font-medium text-gray-900">
                {isSent
                  ? message.receiver?.fullName || 'Broadcast'
                  : message.sender?.fullName || 'Unknown'}
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
