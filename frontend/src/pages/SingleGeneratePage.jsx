import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import { Award, CheckCircle, ExternalLink, Download, User, Mail, Calendar, Layers, ShieldCheck } from 'lucide-react';

export const SingleGeneratePage = () => {
  const [events, setEvents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form inputs
  const [eventId, setEventId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [authorityTitle, setAuthorityTitle] = useState('Issuing Director & Board');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [evtsRes, tplsRes] = await Promise.all([
          api.get('/events'),
          api.get('/templates'),
        ]);
        setEvents(evtsRes.data.events);
        setTemplates(tplsRes.data.templates);
        if (evtsRes.data.events.length > 0) setEventId(evtsRes.data.events[0].id);
        if (tplsRes.data.templates.length > 0) setTemplateId(tplsRes.data.templates[0].id);
      } catch (err) {
        console.error('Failed to load events/templates:', err);
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eventId || !recipientName || !recipientEmail) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await api.post('/certificates/generate', {
        eventId,
        recipientName,
        recipientEmail,
        templateId,
        authorityTitle,
      });

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate certificate.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-blue-400" /> Issue Single Certificate
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Generate an authentic, QR-embedded PDF certificate for an individual recipient.
        </p>
      </div>

      {result ? (
        /* Success Card */
        <div className="glass-panel p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-6 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-heading text-white">Certificate Generated Successfully!</h2>
            <p className="text-sm text-slate-300">
              Certificate code <strong className="text-blue-400 font-mono">{result.certificate?.certCode}</strong> has been stored and emailed to {result.certificate?.recipientEmail}.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-800">
            <a
              href={result.certificate?.pdfPath}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition"
            >
              <Download className="w-4 h-4" /> Download PDF
            </a>

            <Link
              to={`/verify/${result.certificate?.certCode}`}
              target="_blank"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sm font-semibold text-slate-200 transition"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" /> Test Verification Link
            </Link>

            <button
              onClick={() => {
                setResult(null);
                setRecipientName('');
                setRecipientEmail('');
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-300 transition"
            >
              Issue Another Certificate
            </button>
          </div>
        </div>
      ) : (
        /* Form Card */
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {loadingData ? (
            <div className="py-12 flex justify-center text-blue-400">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Event Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Select Target Event *
                </label>
                <select
                  required
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.name} ({evt.category}) - {new Date(evt.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" /> Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. David Miller"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" /> Recipient Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="david@example.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Template & Authority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" /> Design Template
                  </label>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name} {tpl.isDefault ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Authority Subtitle
                  </label>
                  <input
                    type="text"
                    value={authorityTitle}
                    onChange={(e) => setAuthorityTitle(e.target.value)}
                    placeholder="Issuing Authority Title"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Rendering PDF & Dispatching...
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" /> Generate Certificate
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>
      )}

    </div>
  );
};
