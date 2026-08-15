import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { StatCard } from '../components/StatCard';
import {
  Award,
  CheckCircle,
  XCircle,
  Activity,
  Plus,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Eye,
  RotateCcw,
  Ban,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Table Filter states
  const [search, setSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, eventsRes, certsRes] = await Promise.all([
        api.get('/logs/analytics'),
        api.get('/events'),
        api.get('/certificates', {
          params: {
            search: search || undefined,
            eventId: selectedEventId || undefined,
            status: selectedStatus || undefined,
          },
        }),
      ]);

      setAnalytics(analyticsRes.data.analytics);
      setEvents(eventsRes.data.events);
      setCertificates(certsRes.data.certificates);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [search, selectedEventId, selectedStatus]);

  const handleRevoke = async (id, name) => {
    if (!window.confirm(`Are you sure you want to REVOKE the certificate for ${name}?`)) return;
    try {
      await api.patch(`/certificates/${id}/revoke`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to revoke certificate');
    }
  };

  const handleReissue = async (id, name) => {
    if (!window.confirm(`Reissue certificate for ${name}? A new PDF/QR will be generated and emailed.`)) return;
    try {
      await api.post(`/certificates/${id}/reissue`);
      alert(`Certificate for ${name} reissued successfully!`);
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reissue certificate');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/certificates/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CertGuard_Certificates_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV file.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Certificate Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Issue, track, verify, and manage cryptographic event certificates in bulk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/generate/single"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white hover:border-blue-500 transition"
          >
            <Plus className="w-4 h-4 text-blue-400" /> Single Cert
          </Link>
          <Link
            to="/generate/bulk"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Bulk CSV Upload
          </Link>
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Issued"
          value={analytics?.totalCertificates ?? 0}
          icon={Award}
          color="blue"
          subtext={`${analytics?.totalEvents ?? 0} active events`}
        />
        <StatCard
          title="Valid Certificates"
          value={analytics?.validCertificates ?? 0}
          icon={CheckCircle}
          color="emerald"
          subtext="Cryptographically verified"
        />
        <StatCard
          title="Revoked"
          value={analytics?.revokedCertificates ?? 0}
          icon={XCircle}
          color="rose"
          subtext="Deauthorized credentials"
        />
        <StatCard
          title="Public Verifications"
          value={analytics?.totalVerifications ?? 0}
          icon={Activity}
          color="purple"
          subtext="QR scans & code lookups"
        />
      </div>

      {/* Certificate Table Section */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        
        {/* Table Filters Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-heading">
              Issued Certificates Registry
            </h2>
            <p className="text-xs text-slate-400">
              Filter by name, email, cert code, event, or validity status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search recipient or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-64"
              />
            </div>

            {/* Event Filter */}
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Events</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="VALID">Valid</option>
              <option value="REVOKED">Revoked</option>
            </select>

            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="py-12 flex justify-center text-blue-400">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            <Award className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-400">No certificates found matching criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting filters or generating your first certificate.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Certificate ID</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Verifications</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-900/40 transition">
                    
                    {/* Cert Code */}
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">
                      <Link to={`/certificates/${cert.id}`} className="hover:underline flex items-center gap-1.5">
                        {cert.certCode}
                      </Link>
                    </td>

                    {/* Recipient */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{cert.recipientName}</div>
                      <div className="text-slate-400 text-[11px]">{cert.recipientEmail}</div>
                    </td>

                    {/* Event */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-300">{cert.event?.name}</span>
                    </td>

                    {/* Issue Date */}
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(cert.issueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Verification Count */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-semibold">
                        {cert._count?.verificationLogs ?? 0} scans
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {cert.status === 'VALID' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> VALID
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> REVOKED
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Certificate */}
                        <Link
                          to={`/certificates/${cert.id}`}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Public Verify Direct Link */}
                        <Link
                          to={`/verify/${cert.certCode}`}
                          target="_blank"
                          title="Open Public Verify URL"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-blue-300 transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Revoke / Reissue toggle */}
                        {cert.status === 'VALID' ? (
                          <button
                            onClick={() => handleRevoke(cert.id, cert.recipientName)}
                            title="Revoke Certificate"
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReissue(cert.id, cert.recipientName)}
                            title="Reissue Certificate"
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-emerald-950 text-slate-400 hover:text-emerald-400 transition"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
