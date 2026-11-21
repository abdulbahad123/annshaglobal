import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, RefreshCw, CheckCircle, Tag } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function ManageProductVariationsPage({ productId, onBack, onSaved }) {
  const [product, setProduct] = useState(null);
  const [variationsList, setVariationsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Selected variation definition (e.g. Color)
  const [selectedVarName, setSelectedVarName] = useState('Color');
  
  // Rows for mapping options to price and stock (Image 5)
  const [variantRows, setVariantRows] = useState([
    { option: 'Beige', price: 69.99, stock: 15, hex: '#E4CFBA' },
    { option: 'Purple', price: 69.99, stock: 10, hex: '#C2A5D8' }
  ]);

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, varsRes] = await Promise.all([
        axiosClient.get(`/products/detail/${productId}`),
        axiosClient.get('/variations')
      ]);

      if (prodRes.success && prodRes.product) {
        setProduct(prodRes.product);
        if (prodRes.product.variants && prodRes.product.variants.length > 0) {
          setVariantRows(prodRes.product.variants.map(v => ({
            option: v.name || v.color || 'Option',
            price: prodRes.product.price || 0,
            stock: prodRes.product.stock || 10,
            hex: v.hex || '#E4CFBA',
            image: v.image || ''
          })));
        }
      }

      if (varsRes.success && varsRes.variations) {
        setVariationsList(varsRes.variations);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load item variation settings.');
    } finally {
      setLoading(false);
    }
  };

  const currentAvailableOptions = () => {
    const matched = variationsList.find(v => v.name.toLowerCase() === selectedVarName.toLowerCase());
    return matched ? matched.options : [];
  };

  const handleAddOptionRow = () => {
    const opts = currentAvailableOptions();
    const firstOpt = opts[0];
    setVariantRows(prev => [
      ...prev,
      {
        option: firstOpt ? firstOpt.name : `Option ${prev.length + 1}`,
        price: product?.price || 0,
        stock: 10,
        hex: firstOpt ? (firstOpt.colorCode || firstOpt.hex) : '#000000'
      }
    ]);
  };

  const handleRemoveOptionRow = (idx) => {
    setVariantRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRowChange = (idx, field, value) => {
    setVariantRows(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };

      if (field === 'option') {
        const opts = currentAvailableOptions();
        const matched = opts.find(o => o.name === value);
        if (matched) {
          updated[idx].hex = matched.colorCode || matched.hex || '';
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const formattedVariants = variantRows.map(row => ({
        name: row.option,
        color: row.option,
        hex: row.hex || '#E4CFBA',
        image: row.image || product?.images?.[0] || ''
      }));

      const res = await axiosClient.put(`/products/${productId}`, {
        variants: formattedVariants
      });

      if (res.success) {
        setMessage('Product variations updated successfully!');
        setTimeout(() => {
          if (onSaved) onSaved();
          if (onBack) onBack();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to update variations.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-[#646970]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2271b1] mb-3" />
        <p className="text-xs font-semibold">Loading variations data...</p>
      </div>
    );
  }

  const availableOptions = currentAvailableOptions();

  return (
    <div className="w-full bg-[#f0f0f1] min-h-screen p-4 sm:p-6 text-[#2c3338] font-sans">
      {/* Top Breadcrumb & Blue Back Header (Image 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#c3c4c7] pb-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-[#646970] mb-1">
            <span>🏠</span>
            <span>&gt;</span>
            <span>Shop Management</span>
            <span>&gt;</span>
            <span>Items</span>
            <span>&gt;</span>
            <span className="truncate max-w-[200px]">{product?.title || productId}</span>
            <span>&gt;</span>
            <span className="font-semibold text-[#1d2327]">Manage Variations</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1d2327] tracking-tight">
            Manage Variations
          </h1>
          <p className="text-[11px] text-[#646970]">
            Assign variant options, custom prices, and stock counts for "{product?.title}".
          </p>
        </div>

        {/* Blue Back Button (Image 5) */}
        <button
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded text-xs font-semibold shadow-sm transition-all self-start sm:self-auto border border-[#2271b1]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-white border-l-4 border-[#00a32a] text-[#1d2327] text-xs font-semibold shadow-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#00a32a]" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-[#fcf0f1] border-l-4 border-[#d63638] text-[#1d2327] text-xs font-semibold shadow-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Main Card (Image 5) */}
      <div className="bg-white border border-[#c3c4c7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded p-6 max-w-4xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Variation Name Dropdown (Image 5) */}
          <div className="border-b border-[#f0f0f1] pb-4">
            <label className="text-xs font-bold text-[#1d2327] block mb-1">
              Variation Name <span className="text-[#d63638]">**</span>
            </label>
            <div className="max-w-md">
              <select
                value={selectedVarName}
                onChange={(e) => setSelectedVarName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              >
                {variationsList.map((v) => (
                  <option key={v._id} value={v.name}>
                    {v.name} ({v.category})
                  </option>
                ))}
                <option value="Color">Color</option>
                <option value="Size">Size</option>
                <option value="Capacity">Capacity</option>
                <option value="Material">Material</option>
              </select>
            </div>
          </div>

          {/* Section 2: Option Mapping Rows (Image 5) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#1d2327]">Variant Options Pricing &amp; Inventory</h3>
            
            {variantRows.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-3 rounded-lg border border-[#e2e4e7] bg-[#f9f9f9]"
              >
                {/* Option Dropdown */}
                <div className="sm:col-span-5">
                  <label className="text-[11px] font-medium text-[#2c3338] block mb-1">
                    Option <span className="text-[#d63638]">**</span>
                  </label>
                  {availableOptions.length > 0 ? (
                    <select
                      value={row.option}
                      onChange={(e) => handleRowChange(idx, 'option', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1]"
                    >
                      {availableOptions.map((opt, i) => (
                        <option key={i} value={opt.name}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={row.option}
                      onChange={(e) => handleRowChange(idx, 'option', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338]"
                    />
                  )}
                </div>

                {/* Price ($) */}
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-medium text-[#2c3338] block mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={row.price}
                    onChange={(e) => handleRowChange(idx, 'price', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1]"
                  />
                </div>

                {/* Stock Quantity */}
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-medium text-[#2c3338] block mb-1">
                    Stock <span className="text-[#d63638]">**</span>
                  </label>
                  <input
                    type="number"
                    value={row.stock}
                    onChange={(e) => handleRowChange(idx, 'stock', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1]"
                  />
                </div>

                {/* Remove Row Button */}
                <div className="sm:col-span-1 flex items-center justify-end pb-0.5">
                  <button
                    type="button"
                    onClick={() => handleRemoveOptionRow(idx)}
                    className="p-1.5 bg-[#d63638] hover:bg-[#b32d2e] text-white rounded shadow-sm transition-colors"
                    title="Remove variant row"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons: + Add Option & + Add Variant (Image 5) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddOptionRow}
              className="px-4 py-2 bg-[#00a32a] hover:bg-[#008a20] text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Option</span>
            </button>

            <button
              type="button"
              onClick={handleAddOptionRow}
              className="px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Variant</span>
            </button>
          </div>

          {/* Green Update Button (Image 5) */}
          <div className="pt-4 border-t border-[#f0f0f1]">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#00a32a] hover:bg-[#008a20] text-white rounded text-xs font-bold shadow transition-all flex items-center gap-2 border border-[#00a32a]"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Variations...</span>
                </>
              ) : (
                <span>Update Variation</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

