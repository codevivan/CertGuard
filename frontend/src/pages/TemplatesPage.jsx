import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { TemplateEditor } from '../components/TemplateEditor';
import { Layers, Plus, Upload, Check, Trash2, Edit3, Sparkles } from 'lucide-react';

export const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State for upload/create template
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [name, setName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/templates');
      setTemplates(res.data.templates);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleUploadTemplate = async (e) => {
    e.preventDefault();
    if (!name) return alert('Template name is required.');

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('isDefault', isDefault);
      if (imageFile) {
        formData.append('templateImage', imageFile);
      }

      await api.post('/templates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowUploadModal(false);
      setName('');
      setImageFile(null);
      fetchTemplates();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload template.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveLayout = async (updatedLayout) => {
    if (!selectedTemplate) return;
    try {
      await api.put(`/templates/${selectedTemplate.id}`, {
        fieldLayout: JSON.stringify(updatedLayout),
      });
      alert('Template field positions saved successfully!');
      setIsEditing(false);
      fetchTemplates();
    } catch (err) {
      alert('Failed to save layout coordinates.');
    }
  };

  const handleDelete = async (id, templateName) => {
    if (!window.confirm(`Delete template "${templateName}"?`)) return;
    try {
      await api.delete(`/templates/${id}`);
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
        setIsEditing(false);
      }
      fetchTemplates();
    } catch (err) {
      alert('Failed to delete template.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-white">Certificate Templates</h1>
          <p className="text-sm text-slate-400 mt-1">
            Upload custom background designs and position recipient text & QR code placeholders.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition"
        >
          <Upload className="w-4 h-4" /> Upload Template
        </button>
      </div>

      {/* Mode View: Gallery or Editor */}
      {isEditing && selectedTemplate ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between glass-panel p-4 rounded-xl border border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Editing Layout: {selectedTemplate.name}
              </h2>
              <p className="text-xs text-slate-400">
                Drag or use control sliders to adjust precise percentages for recipient name, event name, issue date, and QR code.
              </p>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300"
            >
              Back to Templates
            </button>
          </div>

          <TemplateEditor
            initialLayout={selectedTemplate.fieldLayout}
            bgImageUrl={selectedTemplate.imagePath}
            onSaveLayout={handleSaveLayout}
          />
        </div>
      ) : (
        /* Template Gallery Grid */
        <div>
          {loading ? (
            <div className="py-12 flex justify-center text-blue-400">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="py-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl">
              <Layers className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-400">No certificate templates found.</p>
              <p className="text-xs text-slate-500 mt-1">Upload a background image or use the default system template.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-blue-500/50 transition group shadow-xl"
                >
                  {/* Thumbnail / Image Preview */}
                  <div className="relative aspect-[1123/794] bg-slate-900 overflow-hidden border-b border-slate-800 flex items-center justify-center">
                    {tpl.imagePath ? (
                      <img
                        src={tpl.imagePath}
                        alt={tpl.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-center">
                        <div className="text-sm font-bold font-cinzel text-amber-400 tracking-wider">
                          DEFAULT CERTIFICATE DESIGN
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1">System Built-in Canvas</span>
                      </div>
                    )}

                    {tpl.isDefault && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg flex items-center gap-1 backdrop-blur-md">
                        <Check className="w-3 h-3" /> DEFAULT TEMPLATE
                      </span>
                    )}
                  </div>

                  {/* Template Info & Actions */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-slate-100 text-base font-heading truncate">
                      {tpl.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Created by {tpl.creator?.name || 'System Admin'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => {
                          setSelectedTemplate(tpl);
                          setIsEditing(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-semibold transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Customize Layout
                      </button>

                      <button
                        onClick={() => handleDelete(tpl.id, tpl.name)}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Template Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-slate-100 font-heading">Upload New Template</h2>

            <form onSubmit={handleUploadTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Modern Executive Gold Background"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Background Image (PNG / JPG)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
                <label htmlFor="defaultCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Set as system default template
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload & Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
