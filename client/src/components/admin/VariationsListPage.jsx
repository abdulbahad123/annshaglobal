import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, X, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function VariationsListPage({ onNavigate, onAddVariant, onEditVariant }) {
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedVarForOptions, setSelectedVarForOptions] = useState(null);
  const [message, setMessage] = useState('');

  const fetchVariations = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/variations?search=${encodeURIComponent(search)}`);
      if (res.success) {
        setVariations(res.variations || []);
      }
    } catch (err) {
      console.error('Failed to load variations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariations();
  }, [search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete variation "${name}"?`)) return;
    try {
      const res = await axiosClient.delete(`/variations/${id}`);
      if (res.success) {
        setMessage(`Variation "${name}" deleted.`);
        setTimeout(() => setMessage(''), 3000);
        fetchVariations();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full bg-[#f0f0f1] min-h-screen p-4 sm:p-6 text-[#2c3338] font-sans">
      {/* Breadcrumb Header (Image 3) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#c3c4c7] pb-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-[#646970] mb-1">
            <span>🏠</span>
            <span>&gt;</span>
            <span>Shop Management</span>
            <span>&gt;</span>
            <span>Products</span>
            <span>&gt;</span>
            <span>Variants</span>
            <span>&gt;</span>
            <span className="font-semibold text-[#1d2327]">Variations</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1d2327] tracking-tight">
            Variations
          </h1>
          <p className="text-[11px] text-[#646970]">
            Manage product variations easily and efficiently by category.
          </p>
        </div>

        {/* Top Right Action Buttons (Image 3) */}
        <div className="flex items-center gap-2.5">
          <select className="px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] shadow-sm">
            <option>English</option>
          </select>

          <button
            onClick={onAddVariant}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded text-xs font-semibold shadow-sm transition-all border border-[#2271b1]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Variation</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-white border-l-4 border-[#00a32a] text-[#1d2327] text-xs font-semibold shadow-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#00a32a]" />
          <span>{message}</span>
        </div>
      )}

      {/* Main Table Card (Image 3) */}
      <div className="bg-white border border-[#c3c4c7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-[#f0f0f1] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#646970]">
            <span>Show</span>
            <select className="px-2 py-1 bg-white border border-[#8c8f94] rounded text-xs">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search variation or category..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
            />
            <Search className="w-3.5 h-3.5 text-[#646970] absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Variations Table (Image 3) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#2c3338]">
            <thead className="bg-[#f6f7f7] text-[#1d2327] font-semibold border-b border-[#c3c4c7]">
              <tr>
                <th className="p-3 w-8">
                  <input type="checkbox" className="rounded text-[#2271b1]" />
                </th>
                <th className="p-3">Name ⇅</th>
                <th className="p-3">Category ⇅</th>
                <th className="p-3">Subcategory ⇅</th>
                <th className="p-3 text-center">Options</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f1]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#646970]">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2271b1] mx-auto mb-2" />
                    <span>Loading variations...</span>
                  </td>
                </tr>
              ) : variations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[#646970]">
                    No variations found. Click "+ Add Variation" to create one.
                  </td>
                </tr>
              ) : (
                variations.map((v) => (
                  <tr key={v._id} className="hover:bg-[#f6f7f7] transition-colors">
                    <td className="p-3">
                      <input type="checkbox" className="rounded text-[#2271b1]" />
                    </td>
                    <td className="p-3 font-semibold text-[#1d2327]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2271b1]"></span>
                        <span>{v.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#f0f6fc] text-[#135e96] border border-[#c5d9ed] text-[11px] font-medium">
                        {v.category}
                      </span>
                    </td>
                    <td className="p-3 text-[#646970]">{v.subcategory || '-'}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedVarForOptions(v)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f6fc] hover:bg-[#c5d9ed] text-[#135e96] border border-[#c5d9ed] text-[11px] font-semibold transition-colors shadow-sm"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Show ({v.options?.length || 0})</span>
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditVariant(v._id)}
                          className="p-1 rounded text-[#2271b1] hover:bg-[#f0f0f1]"
                          title="Edit Variation"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id, v.name)}
                          className="p-1 rounded text-[#d63638] hover:bg-[#fcf0f1]"
                          title="Delete Variation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Options Preview Popover Modal */}
      {selectedVarForOptions && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#c3c4c7] shadow-2xl w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
              <h3 className="font-bold text-sm text-[#1d2327]">
                Options for "{selectedVarForOptions.name}" ({selectedVarForOptions.category})
              </h3>
              <button
                onClick={() => setSelectedVarForOptions(null)}
                className="p-1 rounded-full text-[#646970] hover:bg-[#f0f0f1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(selectedVarForOptions.options || []).map((opt, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-[#e2e4e7] bg-[#f6f7f7]"
                >
                  <div className="flex items-center gap-2.5">
                    {opt.colorCode || opt.hex ? (
                      <span
                        className="w-5 h-5 rounded-full border border-black/20 shadow-sm shrink-0"
                        style={{ backgroundColor: opt.colorCode || opt.hex }}
                      />
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-[#2271b1]/20 text-[#2271b1] text-[10px] font-bold flex items-center justify-center">
                        #{i + 1}
                      </span>
                    )}
                    <span className="font-semibold text-xs text-[#1d2327]">{opt.name}</span>
                  </div>
                  {opt.colorCode || opt.hex ? (
                    <span className="font-mono text-[11px] text-[#646970]">{opt.colorCode || opt.hex}</span>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedVarForOptions(null)}
                className="px-4 py-1.5 bg-[#2271b1] text-white rounded text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

