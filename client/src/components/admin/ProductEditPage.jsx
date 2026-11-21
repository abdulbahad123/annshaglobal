import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, CheckCircle, RefreshCw, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

export default function ProductEditPage({ productId, isNew = false, onBack, categories = [], onProductSaved }) {
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form State
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    sku: '',
    category: '',
    orderIndex: 1,
    price: '',
    comparePrice: '',
    stock: 10,
    badge: 'none',
    weight: '0.85 kg',
    dimensions: '28 x 14 x 20 cm',
    material: '100% Genuine Italian Leather',
    featuresText: 'Premium genuine leather\nSpacious compartments\nStylish and versatile design',
    description: '',
    images: [] // Slider images
  });

  const [thumbnailImage, setThumbnailImage] = useState('');
  const [uploadingSlider, setUploadingSlider] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  // Fetch product if editing
  useEffect(() => {
    if (!isNew && productId) {
      setLoading(true);
      axiosClient.get(`/products/detail/${productId}`)
        .then(res => {
          if (res.success && res.product) {
            const p = res.product;
            setForm({
              title: p.title || '',
              subtitle: p.subtitle || p.shortDescription || '',
              sku: p.sku || '',
              category: p.category?._id || p.category || (categories[0]?._id || ''),
              orderIndex: p.orderIndex || 1,
              price: p.price !== undefined ? p.price : '',
              comparePrice: p.comparePrice !== undefined ? p.comparePrice : '',
              stock: p.stock !== undefined ? p.stock : 10,
              badge: p.badge || 'none',
              weight: p.weight || '0.85 kg',
              dimensions: p.dimensions || '28 x 14 x 20 cm',
              material: p.material || '100% Genuine Italian Leather',
              featuresText: Array.isArray(p.features) ? p.features.join('\n') : (p.features || ''),
              description: p.description || '',
              images: Array.isArray(p.images) ? p.images : []
            });
            if (p.images && p.images.length > 0) {
              setThumbnailImage(p.images[0]);
            }
          }
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load product details.');
        })
        .finally(() => setLoading(false));
    }
  }, [productId, isNew]);

  // Upload Single Image (for Thumbnail)
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumb(true);
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
        setThumbnailImage(data.imageUrl);
        // Prepend to images array if not present
        if (!form.images.includes(data.imageUrl)) {
          setForm(prev => ({ ...prev, images: [data.imageUrl, ...prev.images] }));
        }
      } else {
        // Fallback base64
        const reader = new FileReader();
        reader.onload = (evt) => {
          setThumbnailImage(evt.target.result);
          setForm(prev => ({ ...prev, images: [evt.target.result, ...prev.images] }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingThumb(false);
    }
  };

  // Upload Multiple Slider Images via Drag & Drop or File Selection
  const handleSliderImagesUpload = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setUploadingSlider(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/products/upload-images', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.imageUrls && data.imageUrls.length > 0) {
        setForm(prev => ({
          ...prev,
          images: [...prev.images, ...data.imageUrls]
        }));
        if (!thumbnailImage) setThumbnailImage(data.imageUrls[0]);
      } else {
        // Fallback: load base64 previews
        files.forEach(file => {
          const reader = new FileReader();
          reader.onload = (evt) => {
            setForm(prev => ({
              ...prev,
              images: [...prev.images, evt.target.result]
            }));
            if (!thumbnailImage) setThumbnailImage(evt.target.result);
          };
          reader.readAsDataURL(file);
        });
      }
    } catch (err) {
      console.error('Slider images upload failed:', err);
    } finally {
      setUploadingSlider(false);
    }
  };

  const handleRemoveSliderImage = (indexToRemove) => {
    setForm(prev => {
      const updated = prev.images.filter((_, idx) => idx !== indexToRemove);
      if (thumbnailImage === prev.images[indexToRemove]) {
        setThumbnailImage(updated[0] || '');
      }
      return { ...prev, images: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const features = form.featuresText
        .split('\n')
        .map(f => f.trim())
        .filter(Boolean);

      // Ensure images array has thumbnail at index 0
      let finalImages = [...form.images];
      if (thumbnailImage && !finalImages.includes(thumbnailImage)) {
        finalImages.unshift(thumbnailImage);
      }

      if (finalImages.length === 0) {
        finalImages = ['/images/products/stylish-handbag.webp'];
      }

      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        sku: form.sku,
        category: form.category || (categories[0]?._id || 'cat_1'),
        orderIndex: Number(form.orderIndex) || 0,
        price: Number(form.price) || 0,
        comparePrice: Number(form.comparePrice) || 0,
        stock: Number(form.stock) || 10,
        badge: form.badge,
        weight: form.weight,
        dimensions: form.dimensions,
        material: form.material,
        features,
        description: form.description || form.subtitle,
        images: finalImages
      };

      let res;
      if (isNew) {
        res = await axiosClient.post('/products', payload);
      } else {
        res = await axiosClient.put(`/products/${productId}`, payload);
      }

      if (res.success) {
        setMessage(`Product ${isNew ? 'created' : 'updated'} successfully!`);
        setTimeout(() => {
          if (onProductSaved) onProductSaved();
          if (onBack) onBack();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-[#646970]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2271b1] mb-3" />
        <p className="text-xs font-semibold">Loading product information...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f0f0f1] min-h-screen p-4 sm:p-6 text-[#2c3338] font-sans">
      {/* Top Breadcrumb & Back Header (Matching Image 7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#c3c4c7] pb-4">
        <div>
          <nav className="flex items-center gap-2 text-xs text-[#646970] mb-1">
            <span>🏠</span>
            <span>&gt;</span>
            <span>Shop Management</span>
            <span>&gt;</span>
            <span>Products</span>
            <span>&gt;</span>
            <span>Items</span>
            <span>&gt;</span>
            <span className="font-semibold text-[#1d2327]">
              {isNew ? 'Add Item' : `Edit Item (${form.title || productId})`}
            </span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1d2327] tracking-tight">
            {isNew ? 'Add Item' : 'Edit Item'}
          </h1>
        </div>

        {/* Blue Back Button (Image 7) */}
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

      {/* Main Full-Page Form Container (Image 7) */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Card 1: Slider Images Upload (Image 7) */}
        <div className="bg-white border border-[#c3c4c7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#f0f0f1] pb-3">
            <h2 className="text-sm font-bold text-[#1d2327]">
              Slider Images <span className="text-[#d63638]">**</span>
            </h2>
            <p className="text-[11px] text-[#646970]">
              Upload multiple high-resolution product gallery slides. You can drag &amp; drop files directly.
            </p>
          </div>

          {/* Uploaded Slider Thumbnails List with red X button (Image 7) */}
          {form.images.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {form.images.map((img, idx) => (
                <div 
                  key={idx}
                  className="relative group w-24 h-24 rounded-lg border border-[#c3c4c7] p-1.5 bg-white shadow-sm flex items-center justify-center overflow-hidden"
                >
                  <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-full object-contain" />
                  
                  {/* Red Remove X Button (Image 7) */}
                  <button
                    type="button"
                    onClick={() => handleRemoveSliderImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#d63638] text-white flex items-center justify-center shadow hover:bg-[#b32d2e] transition-colors"
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  <span className="absolute bottom-1 left-1 px-1.5 py-0.2 bg-black/60 text-white text-[9px] rounded font-bold">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Drag & Drop File Upload Area (Image 7) */}
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-[#c3c4c7] hover:border-[#2271b1] rounded-xl p-8 text-center transition-colors bg-[#f6f7f7] hover:bg-[#f0f6fc]">
              {uploadingSlider ? (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-8 h-8 text-[#2271b1] animate-spin" />
                  <p className="text-xs font-semibold text-[#2271b1]">Converting &amp; Uploading Images...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="w-8 h-8 text-[#2271b1]" />
                  <p className="text-xs font-semibold text-[#1d2327]">
                    Drag and drop files here to upload
                  </p>
                  <p className="text-[11px] text-[#e05638] font-semibold">
                    Recommended Image Size : 500 x 500
                  </p>
                </div>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleSliderImagesUpload}
                disabled={uploadingSlider}
                className="hidden"
              />
            </div>
          </label>
        </div>

        {/* Card 2: Thumbnail Image Upload (Image 7) */}
        <div className="bg-white border border-[#c3c4c7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#f0f0f1] pb-3">
            <h2 className="text-sm font-bold text-[#1d2327]">
              Thumbnail Image <span className="text-[#d63638]">**</span>
            </h2>
            <p className="text-[11px] text-[#646970]">
              Primary product showcase image displayed in category grids and product cards.
            </p>
          </div>

          <div className="flex items-start gap-4">
            {thumbnailImage ? (
              <div className="relative group w-28 h-28 rounded-lg border border-[#c3c4c7] p-2 bg-white shadow-sm flex items-center justify-center shrink-0">
                <img src={thumbnailImage} alt="Thumbnail preview" className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={() => setThumbnailImage('')}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#d63638] text-white flex items-center justify-center shadow hover:bg-[#b32d2e]"
                  title="Remove thumbnail"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : null}

            <label className="flex-1 block cursor-pointer">
              <div className="border-2 border-dashed border-[#c3c4c7] hover:border-[#2271b1] rounded-xl p-6 text-center transition-colors bg-[#f6f7f7] hover:bg-[#f0f6fc]">
                {uploadingThumb ? (
                  <RefreshCw className="w-6 h-6 text-[#2271b1] animate-spin mx-auto" />
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6 text-[#2271b1] mx-auto mb-1" />
                    <p className="text-xs font-semibold text-[#1d2327]">Upload Featured Thumbnail</p>
                    <p className="text-[10px] text-[#646970] mt-0.5">PNG, JPG, or WebP</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  disabled={uploadingThumb}
                  className="hidden"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Card 3: Core Information (Title, SKU, Category, Order, Price, Stock) */}
        <div className="bg-white border border-[#c3c4c7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] rounded p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#f0f0f1] pb-3">
            <h2 className="text-sm font-bold text-[#1d2327]">Item Details &amp; Specifications</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                Product Title <span className="text-[#d63638]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Premium Leather Handbag"
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                Subtitle / Short Summary
              </label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="e.g. Elegant, stylish and spacious handbag for every occasion."
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                SKU Reference Code <span className="text-[#d63638]">*</span>
              </label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g. AG-HB-003"
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs font-mono text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                Category <span className="text-[#d63638]">*</span>
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
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
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                Badge Filter
              </label>
              <select
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              >
                <option value="none">None (Standard Catalog)</option>
                <option value="todays_deals">Today's Deals</option>
                <option value="top_rated">Top Rated</option>
                <option value="trending">Trending</option>
                <option value="new_arrivals">New Arrivals</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                Price ($) <span className="text-[#d63638]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="69.99"
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                Compare Price / Original ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={form.comparePrice}
                onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                placeholder="99.99"
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">
                Stock Quantity <span className="text-[#d63638]">*</span>
              </label>
              <input
                type="number"
                required
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="20"
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">Weight</label>
              <input
                type="text"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder="0.85 kg"
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">Dimensions</label>
              <input
                type="text"
                value={form.dimensions}
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                placeholder="28 x 14 x 20 cm"
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">Material</label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                placeholder="100% Genuine Italian Leather"
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#2c3338] block mb-1">
              Feature Highlights / Bullet Points (One per line)
            </label>
            <textarea
              rows={3}
              value={form.featuresText}
              onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
              placeholder="Premium genuine leather&#10;Spacious compartments&#10;Stylish and versatile design"
              className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#2c3338] block mb-1">
              Full Product Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed description of product craftsmanship, materials, and usage..."
              className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
            />
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#00a32a] hover:bg-[#008a20] text-white rounded text-xs font-bold shadow transition-all border border-[#00a32a] flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Item...</span>
              </>
            ) : (
              <span>{isNew ? 'Create Item' : 'Update Item'}</span>
            )}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2 bg-white hover:bg-[#f0f0f1] text-[#2c3338] rounded text-xs font-semibold border border-[#8c8f94] shadow-sm transition-colors"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}

