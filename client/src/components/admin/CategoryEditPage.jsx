import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, CheckCircle, RefreshCw, Image as ImageIcon } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function CategoryEditPage({ categoryId, isNew = false, onBack, onCategorySaved }) {
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    orderIndex: 1,
    image: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!isNew && categoryId) {
      setLoading(true);
      axiosClient.get('/categories')
        .then(res => {
          if (res.success && res.categories) {
            const matched = res.categories.find(c => c._id === categoryId || c.slug === categoryId);
            if (matched) {
              setForm({
                name: matched.name || '',
                slug: matched.slug || '',
                description: matched.description || '',
                orderIndex: matched.orderIndex || 1,
                image: matched.image || ''
              });
            }
          }
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load category.');
        })
        .finally(() => setLoading(false));
    }
  }, [categoryId, isNew]);

  const handleNameChange = (val) => {
    setForm(prev => ({
      ...prev,
      name: val,
      slug: isNew ? val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : prev.slug
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/products/upload-single', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setForm(prev => ({ ...prev, image: data.imageUrl }));
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
          setForm(prev => ({ ...prev, image: evt.target.result }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (!form.name) throw new Error('Category name is required.');

      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().trim().replace(/\s+/g, '-'),
        description: form.description,
        orderIndex: Number(form.orderIndex) || 0,
        image: form.image || '/images/categories/beauty-care.webp'
      };

      let res;
      if (isNew) {
        res = await axiosClient.post('/categories', payload);
      } else {
        res = await axiosClient.put(`/categories/${categoryId}`, payload);
      }

      if (res.success) {
        setMessage(`Category ${isNew ? 'created' : 'updated'} successfully!`);
        setTimeout(() => {
          if (onCategorySaved) onCategorySaved();
          if (onBack) onBack();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to save category.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-[#646970]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2271b1] mb-3" />
        <p className="text-xs font-semibold">Loading category data...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f0f0f1] min-h-screen p-4 sm:p-6 text-[#2c3338] font-sans">
      {/* Top Breadcrumb & Blue Back Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#c3c4c7] pb-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-[#646970] mb-1">
            <span>🏠</span>
            <span>&gt;</span>
            <span>Shop Management</span>
            <span>&gt;</span>
            <span>Products</span>
            <span>&gt;</span>
            <span>Categories</span>
            <span>&gt;</span>
            <span className="font-semibold text-[#1d2327]">
              {isNew ? 'Add Category' : `Edit Category (${form.name || categoryId})`}
            </span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1d2327] tracking-tight">
            {isNew ? 'Add Category' : 'Edit Category'}
          </h1>
        </div>

        {/* Blue Back Button */}
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

      {/* Main Form Card */}
      <div className="bg-white border border-[#c3c4c7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded p-6 max-w-3xl space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Category Image Upload Dropzone */}
          <div>
            <label className="text-xs font-bold text-[#1d2327] block mb-1">
              Category Image
            </label>
            <div className="flex items-start gap-4">
              {form.image ? (
                <div className="relative group w-24 h-24 rounded-lg border border-[#c3c4c7] p-1.5 bg-white shadow-sm flex items-center justify-center shrink-0">
                  <img src={form.image} alt="Preview" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: '' })}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#d63638] text-white flex items-center justify-center shadow hover:bg-[#b32d2e]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : null}

              <label className="flex-1 block cursor-pointer">
                <div className="border-2 border-dashed border-[#c3c4c7] hover:border-[#2271b1] rounded-xl p-6 text-center transition-colors bg-[#f6f7f7] hover:bg-[#f0f6fc]">
                  {uploadingImage ? (
                    <RefreshCw className="w-6 h-6 text-[#2271b1] animate-spin mx-auto" />
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-[#2271b1] mx-auto mb-1" />
                      <p className="text-xs font-semibold text-[#1d2327]">Upload Category Image</p>
                      <p className="text-[10px] text-[#646970]">Transparent PNG or WebP</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                Category Name <span className="text-[#d63638]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Beauty & Personal Care"
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                Category Slug
              </label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. beauty-personal-care"
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                Display Sort Order (#)
              </label>
              <input
                type="number"
                min="0"
                value={form.orderIndex}
                onChange={(e) => setForm({ ...form, orderIndex: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#2c3338] block mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief summary of items in this luxury collection..."
              className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#f0f0f1] flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#00a32a] hover:bg-[#008a20] text-white rounded text-xs font-bold shadow transition-all border border-[#00a32a] flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isNew ? 'Create Category' : 'Update Category'}</span>
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2 bg-white hover:bg-[#f0f0f1] text-[#2c3338] rounded text-xs font-semibold border border-[#8c8f94] shadow-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

