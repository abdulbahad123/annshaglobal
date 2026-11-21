import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, RefreshCw, CheckCircle } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function VariantEditPage({ variantId, isNew = false, categories = [], onBack, onVariantSaved }) {
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: 'Color',
    category: '',
    categorySlug: '',
    subcategory: '-',
    options: [
      { name: 'Midnight Blue', colorCode: '#1A2B4C', hex: '#1A2B4C' },
      { name: 'Galaxy Purple', colorCode: '#5B2C6F', hex: '#5B2C6F' }
    ]
  });

  useEffect(() => {
    if (categories.length > 0 && !form.category) {
      setForm(prev => ({
        ...prev,
        category: categories[0]?.name || 'Beauty & Personal Care',
        categorySlug: categories[0]?.slug || 'beauty-personal-care'
      }));
    }
  }, [categories]);

  useEffect(() => {
    if (!isNew && variantId) {
      setLoading(true);
      axiosClient.get(`/variations/${variantId}`)
        .then(res => {
          if (res.success && res.variation) {
            const v = res.variation;
            setForm({
              name: v.name || 'Color',
              category: v.category || (categories[0]?.name || ''),
              categorySlug: v.categorySlug || '',
              subcategory: v.subcategory || '-',
              options: Array.isArray(v.options) && v.options.length > 0 ? v.options : [
                { name: 'Option 1', colorCode: '#000000', hex: '#000000' }
              ]
            });
          }
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load variation.');
        })
        .finally(() => setLoading(false));
    }
  }, [variantId, isNew]);

  const handleCategoryChange = (catName) => {
    const matched = categories.find(c => c.name === catName);
    setForm(prev => ({
      ...prev,
      category: catName,
      categorySlug: matched?.slug || catName.toLowerCase().replace(/\s+/g, '-')
    }));
  };

  const handleAddOption = () => {
    setForm(prev => ({
      ...prev,
      options: [...prev.options, { name: '', colorCode: '#000000', hex: '#000000' }]
    }));
  };

  const handleRemoveOption = (idx) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx)
    }));
  };

  const handleOptionChange = (idx, field, value) => {
    setForm(prev => {
      const updated = [...prev.options];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === 'colorCode') updated[idx].hex = value;
      if (field === 'hex') updated[idx].colorCode = value;
      return { ...prev, options: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (!form.name || !form.category) {
        throw new Error('Name and Category are required.');
      }

      const cleanOptions = form.options.filter(opt => opt.name && opt.name.trim());
      if (cleanOptions.length === 0) {
        throw new Error('Please specify at least one valid option.');
      }

      const payload = {
        name: form.name,
        category: form.category,
        categorySlug: form.categorySlug,
        subcategory: form.subcategory || '-',
        options: cleanOptions
      };

      let res;
      if (isNew) {
        res = await axiosClient.post('/variations', payload);
      } else {
        res = await axiosClient.put(`/variations/${variantId}`, payload);
      }

      if (res.success) {
        setMessage(`Variation ${isNew ? 'created' : 'updated'} successfully!`);
        setTimeout(() => {
          if (onVariantSaved) onVariantSaved();
          if (onBack) onBack();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to save variation.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-[#646970]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2271b1] mb-3" />
        <p className="text-xs font-semibold">Loading variation details...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f0f0f1] min-h-screen p-4 sm:p-6 text-[#2c3338] font-sans">
      {/* Top Breadcrumb & Blue Back Header (Image 4) */}
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
            <span>Variations</span>
            <span>&gt;</span>
            <span className="font-semibold text-[#1d2327]">
              {isNew ? 'Add Variant' : 'Edit Variant'}
            </span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1d2327] tracking-tight">
            {isNew ? 'Add Variant' : 'Edit Variant'}
          </h1>
        </div>

        {/* Blue Back Button (Image 4) */}
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

      {/* Main Card (Image 4) */}
      <div className="bg-white border border-[#c3c4c7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded p-6 max-w-4xl">
        <h2 className="text-sm font-bold text-[#1d2327] border-b border-[#f0f0f1] pb-3 mb-5">
          {isNew ? 'Create New Variation' : 'Edit Variation'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Category, Subcategory, Variant Name (Image 4) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-[#dba617] mt-1 font-medium">
                Changing the category may affect your product variations.
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                Subcategory
              </label>
              <select
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              >
                <option value="-">Select Subcategory</option>
                <option value="Luxury Accessories">Luxury Accessories</option>
                <option value="Bespoke Collection">Bespoke Collection</option>
                <option value="Everyday Essentials">Everyday Essentials</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                Variant Name (en) <span className="text-[#d63638]">**</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Color, Size, Capacity"
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>
          </div>

          {/* Purple Button: + Add Option (Image 4) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddOption}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5e548e] hover:bg-[#4a4175] text-white rounded text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Option</span>
            </button>
          </div>

          {/* Dynamic Option Rows (Image 4) */}
          <div className="space-y-3">
            {form.options.map((opt, idx) => (
              <div 
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 rounded-lg border border-[#e2e4e7] bg-[#f9f9f9]"
              >
                {/* Option Name (en) */}
                <div className="md:col-span-6">
                  <label className="text-[11px] font-medium text-[#2c3338] block mb-1">
                    Option Name (en)
                  </label>
                  <input
                    type="text"
                    required
                    value={opt.name}
                    onChange={(e) => handleOptionChange(idx, 'name', e.target.value)}
                    placeholder="e.g. Midnight Blue, Beige, 64GB"
                    className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1]"
                  />
                </div>

                {/* Color Code (optional) with Color box & Hex input */}
                <div className="md:col-span-5">
                  <label className="text-[11px] font-medium text-[#2c3338] block mb-1">
                    Color Code (optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={opt.colorCode || '#000000'}
                      onChange={(e) => handleOptionChange(idx, 'colorCode', e.target.value)}
                      className="w-8 h-8 rounded border border-[#8c8f94] cursor-pointer p-0.5 bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={opt.colorCode || ''}
                      onChange={(e) => handleOptionChange(idx, 'colorCode', e.target.value)}
                      placeholder="#000000"
                      className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs font-mono text-[#2c3338] focus:outline-none focus:border-[#2271b1]"
                    />
                  </div>
                </div>

                {/* Red X Remove Button (Image 4) */}
                <div className="md:col-span-1 flex items-center justify-end pb-0.5">
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="p-1.5 bg-[#d63638] hover:bg-[#b32d2e] text-white rounded shadow-sm transition-colors"
                    title="Remove option"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Green Button: [ Update Variation ] (Image 4) */}
          <div className="pt-4 border-t border-[#f0f0f1]">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#00a32a] hover:bg-[#008a20] text-white rounded text-xs font-bold shadow transition-all flex items-center gap-2 border border-[#00a32a]"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Variation...</span>
                </>
              ) : (
                <span>{isNew ? 'Create Variation' : 'Update Variation'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

