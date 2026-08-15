import React, { useState } from 'react';
import { Move, Type, Palette, QrCode, Sparkles } from 'lucide-react';

const DEFAULT_FIELDS = [
  { field: 'recipientName', label: 'Recipient Name', x: 50, y: 42, fontSize: 32, fontWeight: '700', color: '#fbbf24' },
  { field: 'eventName', label: 'Event Name', x: 50, y: 55, fontSize: 22, fontWeight: '600', color: '#38bdf8' },
  { field: 'issueDate', label: 'Issue Date', x: 30, y: 78, fontSize: 14, fontWeight: '400', color: '#94a3b8' },
  { field: 'certCode', label: 'Certificate Code', x: 70, y: 78, fontSize: 14, fontWeight: '500', color: '#cbd5e1' },
  { field: 'qrCode', label: 'QR Code Box', x: 88, y: 80, width: 70 },
  { field: 'authorityTitle', label: 'Authority Title', x: 50, y: 88, fontSize: 14, fontWeight: '500', color: '#94a3b8' },
];

export const TemplateEditor = ({ initialLayout = [], bgImageUrl, onSaveLayout }) => {
  const [fields, setFields] = useState(() => {
    if (Array.isArray(initialLayout) && initialLayout.length > 0) {
      return DEFAULT_FIELDS.map((df) => {
        const existing = initialLayout.find((item) => item.field === df.field);
        return existing ? { ...df, ...existing } : df;
      });
    }
    return DEFAULT_FIELDS;
  });

  const [activeFieldKey, setActiveFieldKey] = useState('recipientName');

  const activeField = fields.find((f) => f.field === activeFieldKey) || fields[0];

  const updateField = (key, updates) => {
    setFields((prev) =>
      prev.map((f) => (f.field === key ? { ...f, ...updates } : f))
    );
  };

  const handleCanvasClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const yPercent = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    updateField(activeFieldKey, { x: xPercent, y: yPercent });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Visual Workspace Canvas */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Interactive Canvas Preview (Click anywhere to move active element)
          </span>
          <span className="text-xs text-blue-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Active: {activeField.label} ({activeField.x}%, {activeField.y}%)
          </span>
        </div>

        <div
          onClick={handleCanvasClick}
          className="relative w-full aspect-[1123/794] rounded-2xl overflow-hidden glass-panel border-2 border-dashed border-slate-700 cursor-crosshair shadow-2xl group select-none bg-slate-900"
          style={
            bgImageUrl
              ? {
                  backgroundImage: `url(${bgImageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
              : {}
          }
        >
          {!bgImageUrl && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
              <div className="text-2xl font-bold font-cinzel text-amber-400 tracking-widest uppercase">
                CERTIFICATE OF COMPLETION
              </div>
              <div className="text-xs text-slate-500 tracking-widest mt-1">PROUDLY PRESENTED TO</div>
            </div>
          )}

          {/* Render Placeholders */}
          {fields.map((item) => {
            const isSelected = item.field === activeFieldKey;

            if (item.field === 'qrCode') {
              return (
                <div
                  key={item.field}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFieldKey(item.field);
                  }}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: `${item.width || 70}px`,
                    height: `${item.width || 70}px`,
                  }}
                  className={`absolute bg-white p-1 rounded-lg border-2 shadow-lg cursor-pointer flex flex-col items-center justify-center transition-all ${
                    isSelected ? 'border-blue-500 ring-4 ring-blue-500/30 scale-105 z-20' : 'border-slate-300 z-10'
                  }`}
                >
                  <QrCode className="w-full h-full text-slate-900" />
                  <span className="text-[9px] font-bold text-slate-700 uppercase tracking-tighter">QR VERIFY</span>
                </div>
              );
            }

            const getSampleText = (key) => {
              switch (key) {
                case 'recipientName':
                  return 'Jane Doe';
                case 'eventName':
                  return 'Web Security Workshop 2026';
                case 'issueDate':
                  return 'Issued on August 15, 2026';
                case 'certCode':
                  return 'ID: CERT-2026-X89A12';
                case 'authorityTitle':
                  return 'CertGuard Board • Issuing Director';
                default:
                  return item.label;
              }
            };

            return (
              <div
                key={item.field}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveFieldKey(item.field);
                }}
                style={{
                  left: `${item.x}%`,
                  top: `${item.y}%`,
                  transform: 'translate(-50%, -50%)',
                  fontSize: `${item.fontSize || 18}px`,
                  fontWeight: item.fontWeight || 'normal',
                  color: item.color || '#ffffff',
                }}
                className={`absolute whitespace-nowrap px-2 py-1 rounded cursor-pointer transition-all ${
                  isSelected
                    ? 'border-2 border-blue-500 bg-blue-500/20 shadow-lg ring-2 ring-blue-500/40 z-20 font-bold'
                    : 'hover:border hover:border-slate-400/50 z-10'
                }`}
              >
                {getSampleText(item.field)}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-400 text-center">
          💡 Click directly on any element or click on the canvas to relocate the active item.
        </p>
      </div>

      {/* Field Control Sidebar */}
      <div className="space-y-4 glass-panel p-5 rounded-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
          <span>Element Controls</span>
          <button
            type="button"
            onClick={() => onSaveLayout(fields)}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md"
          >
            Apply Layout
          </button>
        </h3>

        {/* Element Selector Tabs */}
        <div className="grid grid-cols-2 gap-2">
          {fields.map((f) => (
            <button
              key={f.field}
              type="button"
              onClick={() => setActiveFieldKey(f.field)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl text-left truncate transition ${
                f.field === activeFieldKey
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Adjustments Form */}
        <div className="space-y-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Move className="w-4 h-4 text-blue-400" /> Position Coordinates
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 font-semibold">X Axis (%): {activeField.x}%</label>
              <input
                type="range"
                min="5"
                max="95"
                value={activeField.x}
                onChange={(e) => updateField(activeFieldKey, { x: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-1"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-semibold">Y Axis (%): {activeField.y}%</label>
              <input
                type="range"
                min="5"
                max="95"
                value={activeField.y}
                onChange={(e) => updateField(activeFieldKey, { y: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-1"
              />
            </div>
          </div>

          {activeField.field === 'qrCode' ? (
            <div>
              <label className="text-[11px] text-slate-400 font-semibold">QR Size (px): {activeField.width || 70}px</label>
              <input
                type="range"
                min="40"
                max="150"
                value={activeField.width || 70}
                onChange={(e) => updateField(activeFieldKey, { width: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-1"
              />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 pt-2 border-t border-slate-800">
                <Type className="w-4 h-4 text-emerald-400" /> Typography Settings
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold">Font Size: {activeField.fontSize || 18}px</label>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={activeField.fontSize || 18}
                  onChange={(e) => updateField(activeFieldKey, { fontSize: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold">Font Weight</label>
                  <select
                    value={activeField.fontWeight || '400'}
                    onChange={(e) => updateField(activeFieldKey, { fontWeight: e.target.value })}
                    className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
                  >
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">SemiBold (600)</option>
                    <option value="700">Bold (700)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <Palette className="w-3 h-3" /> Color
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={activeField.color || '#ffffff'}
                      onChange={(e) => updateField(activeFieldKey, { color: e.target.value })}
                      className="w-7 h-7 rounded border border-slate-700 bg-slate-900 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={activeField.color || '#ffffff'}
                      onChange={(e) => updateField(activeFieldKey, { color: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

    </div>
  );
};
