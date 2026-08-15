import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Award,
  User,
  Hash,
  Download,
  ExternalLink,
  QrCode,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

export const PublicVerifyPage = () => {
  const { certCode: paramCode } = useParams();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState(paramCode || '');
  const [loading, setLoading] = useState(!!paramCode);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const verifyCode = async (codeToVerify) => {
    if (!codeToVerify) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.get(`/verify/${codeToVerify.trim()}`);
      setResult(res.data);
    } catch (err) {
      if (err.response && err.response.data) {
        setResult(err.response.data);
      } else {
        setError('Verification service unavailable. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramCode) {
      setInputCode(paramCode);
      verifyCode(paramCode);
    }
  }, [paramCode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    navigate(`/verify/${inputCode.trim()}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      
      {/* Top Simple Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold font-heading text-lg text-white">CertGuard</span>
              <span className="block text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                CRYPTOGRAPHIC VERIFICATION
              </span>
            </div>
          </Link>

          <Link
            to="/login"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
          >
            Organizer Login
          </Link>
        </div>
      </header>

      {/* Main Verification Container */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 sm:py-12 space-y-8">
        
        {/* Verification Hero & Search Input */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Official Certificate Authenticator
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            Verify Certificate Authenticity
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Scan a certificate QR code or enter the unique Certificate ID below to verify recipient credentials and cryptographic SHA-256 integrity.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-lg mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-slate-400" />
              <input
                type="text"
                required
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter Certificate ID (e.g. CERT-2026-ALEX99)"
                className="w-full pl-11 pr-28 py-3.5 bg-slate-900 border-2 border-slate-800 rounded-2xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-xl transition"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg transition"
              >
                Verify Now
              </button>
            </div>
          </form>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-semibold text-slate-300">Checking SHA-256 ledger & cert status...</p>
          </div>
        )}

        {/* Verification Result Display Card */}
        {!loading && result && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            
            {result.found && result.valid ? (
              /* VALID CERTIFICATE CARD */
              <div className="glass-panel rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Status Badge Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-lg">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/30">
                        OFFICIALLY AUTHENTIC & VALID
                      </span>
                      <h2 className="text-xl font-extrabold font-heading text-white mt-1">
                        Certificate Verified
                      </h2>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Certificate ID</span>
                    <span className="text-base font-mono font-bold text-blue-400">{result.certificate.certCode}</span>
                  </div>
                </div>

                {/* Certificate Core Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-400" /> Issued To
                    </span>
                    <p className="text-lg font-bold text-white font-heading">{result.certificate.recipientName}</p>
                    <p className="text-xs text-slate-400">{result.certificate.recipientEmail}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-blue-400" /> Event & Category
                    </span>
                    <p className="text-lg font-bold text-white font-heading">{result.certificate.eventName}</p>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 uppercase">
                      {result.certificate.eventCategory}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" /> Date of Issuance
                    </span>
                    <p className="text-sm font-semibold text-slate-200">
                      {new Date(result.certificate.issueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-blue-400" /> Issuing Authority
                    </span>
                    <p className="text-sm font-semibold text-slate-200">{result.certificate.organizerName}</p>
                  </div>
                </div>

                {/* Cryptographic SHA-256 Hash Proof */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-emerald-400" /> SHA-256 Cryptographic Fingerprint
                    </span>
                    <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hash Match Confirmed
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-400 break-all bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    {result.certificate.hash}
                  </p>
                </div>

                {/* Download PDF Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-slate-400">
                    Verified live from CertGuard immutable verification logs.
                  </span>
                  {result.certificate.pdfPath && (
                    <a
                      href={result.certificate.pdfPath}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition"
                    >
                      <Download className="w-4 h-4" /> Download Verified PDF
                    </a>
                  )}
                </div>

              </div>
            ) : result.found && !result.valid ? (
              /* REVOKED OR MISMATCH CERTIFICATE CARD */
              <div className="glass-panel rounded-3xl border-2 border-rose-500/40 bg-gradient-to-b from-rose-950/20 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6 text-left">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-rose-500/20 text-rose-400 text-[10px] font-bold tracking-wider uppercase border border-rose-500/30">
                      STATUS: REVOKED / INVALID
                    </span>
                    <h2 className="text-xl font-extrabold font-heading text-white mt-1">
                      Certificate Deauthorized
                    </h2>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
                  {result.message}
                </div>

                {result.certificate && (
                  <div className="space-y-2 text-xs text-slate-300">
                    <div><strong>Originally Issued To:</strong> {result.certificate.recipientName}</div>
                    <div><strong>Event:</strong> {result.certificate.eventName}</div>
                    <div><strong>Code:</strong> {result.certificate.certCode}</div>
                  </div>
                )}
              </div>
            ) : (
              /* NOT FOUND CARD */
              <div className="glass-panel rounded-3xl border border-slate-800 p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center mx-auto border border-slate-800">
                  <XCircle className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-bold font-heading text-white">Certificate Not Found</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No certificate record exists for ID <strong className="text-slate-200 font-mono">{inputCode}</strong>. Please double-check spelling or contact the issuing organizer.
                </p>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <p>© 2026 CertGuard • Cryptographic Digital Certificate Infrastructure</p>
      </footer>

    </div>
  );
};
