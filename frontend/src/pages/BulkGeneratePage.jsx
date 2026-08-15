import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, Calendar, Layers, Download, Check } from 'lucide-react';

export const BulkGeneratePage = () => {
  const [events, setEvents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [eventId, setEventId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [authorityTitle, setAuthorityTitle] = useState('Issuing Board & Organizing Committee');
  const [csvFile, setCsvFile] = useState(null);

  // Preview & Processing state
  const [previewData, setPreviewData] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [generating, setGenerating] = useState(false);
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

  const handlePreviewCSV = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setError('Please select a CSV file to upload.');
      return;
    }
    if (!eventId) {
      setError('Please select a target event.');
      return;
    }

    setError('');
    setPreviewing(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', csvFile);
      formData.append('eventId', eventId);
      formData.append('previewOnly', 'true');

      const res = await api.post('/certificates/bulk-generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPreviewData(res.data.participants);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse CSV file.');
    } finally {
      setPreviewing(false);
    }
  };

  const handleConfirmBulkGeneration = async () => {
    if (!csvFile || !eventId) return;

    setError('');
    setGenerating(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', csvFile);
      formData.append('eventId', eventId);
      formData.append('templateId', templateId);
      formData.append('authorityTitle', authorityTitle);
      formData.append('previewOnly', 'false');

      const res = await api.post('/certificates/bulk-generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process bulk generation.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadSampleCSV = () => {
    const sample = 'name,email\nAlex Morgan,alex@example.com\nSophia Taylor,sophia@example.com\nMarcus Vance,marcus@example.com\n';
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_participants.csv';
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" /> Bulk CSV Certificate Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload participant spreadsheets to generate hundreds of verified PDF certificates in seconds.
          </p>
        </div>

        <button
          onClick={handleDownloadSampleCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
        >
          <Download className="w-3.5 h-3.5" /> Download Sample CSV
        </button>
      </div>

      {result ? (
        /* Batch Complete Success Banner */
        <div className="glass-panel p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-6 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-heading text-white">
              Bulk Generation Complete!
            </h2>
            <p className="text-sm text-slate-300">
              Successfully rendered and stored <strong className="text-emerald-400 font-bold">{result.count}</strong> certificates with embedded QR codes & emails dispatched.
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4 border-t border-slate-800">
            <Link
              to="/dashboard"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition"
            >
              View All Certificates in Dashboard
            </Link>

            <button
              onClick={() => {
                setResult(null);
                setPreviewData(null);
                setCsvFile(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-300 transition"
            >
              Start Another Batch
            </button>
          </div>
        </div>
      ) : (
        /* Upload & Preview Step */
        <div className="space-y-6">
          
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <form onSubmit={handlePreviewCSV} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" /> Target Event *
                  </label>
                  <select
                    required
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {events.map((evt) => (
                      <option key={evt.id} value={evt.id}>
                        {evt.name} ({evt.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" /> Template
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
              </div>

              {/* Upload Input Box */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Upload CSV File (columns: "name", "email") *
                </label>
                <div className="relative border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-900/50 transition group cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    required
                    onChange={(e) => {
                      setCsvFile(e.target.files[0]);
                      setPreviewData(null);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 mx-auto text-blue-400 group-hover:scale-110 transition" />
                  <p className="text-sm font-semibold text-slate-200 mt-2">
                    {csvFile ? csvFile.name : 'Drag and drop CSV file here, or click to browse'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Accepts standard .csv files up to 10MB</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={previewing || !csvFile}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition disabled:opacity-50 flex items-center gap-2"
                >
                  {previewing ? 'Parsing CSV...' : 'Parse & Preview Spreadsheet'}
                </button>
              </div>

            </form>
          </div>

          {/* Pre-commit Preview Table */}
          {previewData && (
            <div className="glass-panel p-6 rounded-2xl border border-blue-500/30 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-heading flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> CSV Validation Preview ({previewData.length} Recipients)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review parsed names and emails before initiating batch certificate generation.
                  </p>
                </div>

                <button
                  onClick={handleConfirmBulkGeneration}
                  disabled={generating}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Batch Generation...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" /> Confirm & Issue All {previewData.length} Certificates
                    </>
                  )}
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">Recipient Name</th>
                      <th className="py-2.5 px-4">Email Address</th>
                      <th className="py-2.5 px-4">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="py-2 px-4 text-slate-500">{idx + 1}</td>
                        <td className="py-2 px-4 font-semibold text-slate-200">{row.recipientName}</td>
                        <td className="py-2 px-4 text-slate-400">{row.recipientEmail}</td>
                        <td className="py-2 px-4">
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            Valid Format
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
