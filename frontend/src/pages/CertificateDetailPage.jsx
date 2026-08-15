import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import {
  Award,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Download,
  ExternalLink,
  RotateCcw,
  Ban,
  Calendar,
  User,
  Mail,
  Hash,
  Activity,
  ArrowLeft,
} from 'lucide-react';

export const CertificateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCertificateDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/certificates/${id}`);
      setCertificate(res.data.certificate);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch certificate details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificateDetails();
  }, [id]);

  const handleRevoke = async () => {
    if (!window.confirm('Are you sure you want to revoke this certificate?')) return;
    try {
      await api.patch(`/certificates/${id}/revoke`);
      fetchCertificateDetails();
    } catch (err) {
      alert('Failed to revoke certificate');
    }
  };

  const handleReissue = async () => {
    if (!window.confirm('Reissue certificate? This will regenerate PDF & QR code.')) return;
    try {
      await api.post(`/certificates/${id}/reissue`);
      alert('Certificate reissued successfully!');
      fetchCertificateDetails();
    } catch (err) {
      alert('Failed to reissue certificate');
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center text-blue-400">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-4 max-w-md mx-auto my-12">
        <XCircle className="w-10 h-10 mx-auto text-rose-400" />
        <h2 className="text-xl font-bold text-white font-heading">Certificate Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Invalid Certificate ID.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3">
          {certificate.pdfPath && (
            <a
              href={certificate.pdfPath}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </a>
          )}

          <Link
            to={`/verify/${certificate.certCode}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" /> Verify Portal
          </Link>
        </div>
      </div>

      {/* Main Grid: Details Card & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Core Metadata & Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            
            {/* Status Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-medium">Certificate Identifier</span>
                <h1 className="text-2xl font-extrabold font-mono text-blue-400 tracking-wide mt-0.5">
                  {certificate.certCode}
                </h1>
              </div>

              <div>
                {certificate.status === 'VALID' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4" /> VALID CREDENTIAL
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <XCircle className="w-4 h-4" /> REVOKED CREDENTIAL
                  </span>
                )}
              </div>
            </div>

            {/* Recipient & Event Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Recipient Name
                </span>
                <p className="text-base font-bold text-slate-100">{certificate.recipientName}</p>
                <p className="text-slate-400">{certificate.recipientEmail}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-blue-400" /> Event Name
                </span>
                <p className="text-base font-bold text-slate-100">{certificate.event?.name}</p>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold uppercase text-slate-300">
                  {certificate.event?.category}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Issue Date
                </span>
                <p className="text-sm font-semibold text-slate-200">
                  {new Date(certificate.issueDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Issued By
                </span>
                <p className="text-sm font-semibold text-slate-200">{certificate.creator?.name || 'System Admin'}</p>
              </div>
            </div>

            {/* Cryptographic SHA-256 Hash */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-emerald-400" /> Cryptographic SHA-256 Hash
              </span>
              <p className="font-mono text-xs text-slate-300 break-all">{certificate.hash}</p>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Credential Management Actions</span>

              {certificate.status === 'VALID' ? (
                <button
                  onClick={handleRevoke}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition"
                >
                  <Ban className="w-3.5 h-3.5" /> Revoke Certificate
                </button>
              ) : (
                <button
                  onClick={handleReissue}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reissue Certificate
                </button>
              )}
            </div>

          </div>

          {/* Verification Audit Log Table */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-heading flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Verification Audit Log History
            </h3>

            {certificate.verificationLogs?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No verification scans recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">IP Address</th>
                      <th className="py-2.5 px-3">Browser User Agent</th>
                      <th className="py-2.5 px-3">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {certificate.verificationLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-mono text-slate-300">
                          {new Date(log.verifiedAt).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                        <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{log.userAgent || 'Web Browser'}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">
                          {log.statusChecked}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Col: QR & File Preview */}
        <div className="space-y-6">
          
          {/* QR Code Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Verification QR Code
            </h3>

            {certificate.qrPath ? (
              <div className="bg-white p-3 rounded-2xl w-48 h-48 mx-auto shadow-xl border border-slate-700">
                <img src={certificate.qrPath} alt="QR Code" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 text-xs font-mono">
                No QR generated
              </div>
            )}

            <p className="text-[11px] text-slate-400">
              Scanners navigate directly to public verify portal for instant validation.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
