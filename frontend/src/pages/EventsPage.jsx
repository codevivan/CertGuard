import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Calendar, Plus, Search, Edit2, Trash2, Tag, FileText, CheckCircle } from 'lucide-react';

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'WORKSHOP',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events', { params: { search: search || undefined } });
      setEvents(res.data.events);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search]);

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: 'WORKSHOP',
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (evt) => {
    setEditingEvent(evt);
    setFormData({
      name: evt.name,
      description: evt.description || '',
      date: new Date(evt.date).toISOString().split('T')[0],
      category: evt.category,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, formData);
      } else {
        await api.post('/events', formData);
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete event "${name}"? Certificates linked to this event will also be deleted.`)) return;
    try {
      await api.delete(`/events/${id}`);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete event');
    }
  };

  const getCategoryBadge = (cat) => {
    const map = {
      WORKSHOP: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      COMPETITION: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      TRAINING: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      OTHER: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return map[cat] || map.WORKSHOP;
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white">Event Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize workshops, competitions, and training programs to issue certificates for.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition"
        >
          <Plus className="w-4 h-4" /> Create New Event
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search events by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">{events.length} events registered</span>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-12 flex justify-center text-blue-400">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
          <Calendar className="w-12 h-12 mx-auto text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-400">No events found.</p>
          <p className="text-xs text-slate-500 mt-1">Click "Create New Event" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="glass-card p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between hover:border-blue-500/40 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadge(evt.category)}`}>
                    {evt.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition font-heading">
                  {evt.name}
                </h3>

                {evt.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  <strong>{evt._count?.certificates ?? 0}</strong> certificates issued
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(evt)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(evt.id, evt.name)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Event Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-100 font-heading">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Cybersecurity & Web Hacking Bootcamp"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="WORKSHOP">WORKSHOP</option>
                    <option value="COMPETITION">COMPETITION</option>
                    <option value="TRAINING">TRAINING</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief outline of event topics and objectives..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
