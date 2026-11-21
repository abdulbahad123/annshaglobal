import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  ShoppingCart,
  Palette,
  DollarSign,
  CreditCard,
  Search,
  Plus,
  Trash2,
  Edit,
  X,
  Upload,
  RefreshCw,
  Eye,
  CheckCircle,
  Menu,
  ShieldCheck,
  Globe,
  Calendar,
  LogOut,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  FileText,
  Sliders
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

import ProductEditPage from './ProductEditPage';
import VariationsListPage from './VariationsListPage';
import VariantEditPage from './VariantEditPage';
import ManageProductVariationsPage from './ManageProductVariationsPage';
import CategoryEditPage from './CategoryEditPage';

export default function AdminPortal({ onBackToStore, onClose, currentPath = '/admin', navigate }) {
  const handleBack = onBackToStore || onClose;
  const activePath = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/admin');

  const handleNavigate = (path) => {
    if (navigate) {
      navigate(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const { user, isAdmin, login, logout } = useAuth();
  const [adminEmail, setAdminEmail] = useState('admin@annshaglobal.com');
  const [adminPassword, setAdminPassword] = useState('adminPassword123!');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openProductsDropdown, setOpenProductsDropdown] = useState(true);

  // URL Subroute parsing for dedicated full pages
  let currentView = 'dashboard';
  let targetProductId = null;
  let targetCategoryId = null;
  let targetVariantId = null;

  if (activePath === '/admin/product/new' || activePath === '/admin/products/new' || activePath === '/admin/items/new') {
    currentView = 'add_product';
  } else if (activePath.startsWith('/admin/product/') && activePath.endsWith('/variations')) {
    currentView = 'manage_item_variations';
    targetProductId = activePath.replace('/admin/product/', '').replace('/variations', '').replace(/\/$/, '');
  } else if (activePath.startsWith('/admin/product/') && !activePath.endsWith('/variations') && !activePath.endsWith('/new')) {
    currentView = 'edit_product';
    targetProductId = activePath.replace('/admin/product/', '').replace(/\/$/, '');
  } else if (activePath === '/admin/category/new' || activePath === '/admin/categories/new') {
    currentView = 'add_category';
  } else if (activePath.startsWith('/admin/category/') && !activePath.endsWith('/new')) {
    currentView = 'edit_category';
    targetCategoryId = activePath.replace('/admin/category/', '').replace(/\/$/, '');
  } else if (activePath === '/admin/variants/new') {
    currentView = 'add_variant';
  } else if (activePath.startsWith('/admin/variants/edit/')) {
    currentView = 'edit_variant';
    targetVariantId = activePath.replace('/admin/variants/edit/', '').replace(/\/$/, '');
  } else if (activePath === '/admin/variants' || activePath === '/admin/variations') {
    currentView = 'variations_list';
  } else if (activePath === '/admin/categories') {
    currentView = 'categories';
  } else if (activePath === '/admin/orders') {
    currentView = 'orders';
  } else if (activePath === '/admin/customers') {
    currentView = 'customers';
  } else if (activePath === '/admin/editor' || activePath === '/admin/website_editor') {
    currentView = 'website_editor';
  } else if (activePath === '/admin/revenue') {
    currentView = 'revenue';
  } else if (activePath === '/admin/payments') {
    currentView = 'payments';
  } else if (activePath === '/admin/products' || activePath === '/admin/items') {
    currentView = 'products';
  } else {
    currentView = activeMenu;
  }

  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerPagination, setCustomerPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [customerFilter, setCustomerFilter] = useState({ rangeType: '', startDate: '', endDate: '', search: '' });

  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [categories, setCategories] = useState([]);

  const [orders, setOrders] = useState([]);
  const [orderPagination, setOrderPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [orderFilter, setOrderFilter] = useState({ rangeType: '', startDate: '', endDate: '', search: '', status: 'all', paymentStatus: 'all' });

  const [cmsConfig, setCmsConfig] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);

  // Modals & form states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    subtitle: '',
    sku: '',
    description: '',
    price: '',
    comparePrice: '',
    stock: 10,
    category: '',
    badge: 'none',
    orderIndex: 1,
    weight: '0.85 kg',
    dimensions: '28 x 14 x 20 cm',
    material: '100% Genuine Italian Leather',
    featuresText: 'Premium genuine leather\nSpacious compartments\nStylish and versatile design',
    variantsText: 'Beige:#E4CFBA\nPurple:#C2A5D8\nBlack:#2B2B2B\nPink:#F3A7BD',
    sizesText: 'One Size, Medium, Large',
    imagesText: ''
  });
  const [selectedProductFiles, setSelectedProductFiles] = useState([]);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ 
    name: '', 
    slug: '', 
    description: '', 
    image: '', 
    orderIndex: 1 
  });
  const [selectedCategoryFile, setSelectedCategoryFile] = useState(null);

  // Website Editor Multi-Page Sub-tab states
  const [editorTab, setEditorTab] = useState('home'); // 'home' | 'brand' | 'blogs' | 'faqs' | 'contact' | 'footer'
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState(0);
  const [newBlog, setNewBlog] = useState({
    title: '',
    category: 'Home & Living',
    author: 'Annsha Editorial',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
    summary: '',
    content: ''
  });
  const [showAddBlog, setShowAddBlog] = useState(false);
  const [newFaq, setNewFaq] = useState({
    category: 'Shipping',
    question: '',
    answer: ''
  });
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [dbStatus, setDbStatus] = useState({
    type: 'MongoDB',
    connected: false,
    mode: 'Embedded Dual-Storage Active (Automatic Persistent JSON Engine)',
    connectionState: 'Dual Storage Fallback Active'
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync activeMenu with URL-based currentView (so sidebar highlights correctly)
  useEffect(() => {
    if (currentView === 'products' || currentView === 'edit_product' || currentView === 'add_product' || currentView === 'manage_item_variations') {
      setActiveMenu('products');
      if (isAdmin && currentView === 'products') { fetchProducts(); fetchCategories(); }
    } else if (currentView === 'categories' || currentView === 'edit_category' || currentView === 'add_category') {
      setActiveMenu('categories');
      if (isAdmin && currentView === 'categories') fetchCategories();
    } else if (currentView === 'variations_list' || currentView === 'add_variant' || currentView === 'edit_variant') {
      setActiveMenu('products');
    } else if (currentView === 'orders') {
      setActiveMenu('orders');
      if (isAdmin) fetchOrders(1);
    } else if (currentView === 'customers') {
      setActiveMenu('customers');
      if (isAdmin) fetchCustomers(1);
    } else if (currentView === 'website_editor') {
      setActiveMenu('website_editor');
      if (isAdmin) fetchCMSConfig();
    } else if (['revenue','payments','dashboard'].includes(currentView)) {
      setActiveMenu(currentView);
    }
  }, [activePath, isAdmin]);

  // Fetch initial dashboard and overview data whenever admin is authenticated
  useEffect(() => {
    fetchDbStatus();
    if (isAdmin) {
      fetchDashboardData();
      fetchCategories();
      // Auto-load data for URL-driven views
      if (currentView === 'products') { fetchProducts(); }
      if (currentView === 'categories') { fetchCategories(); }
      if (currentView === 'orders') { fetchOrders(1); }
      if (currentView === 'customers') { fetchCustomers(1); }
      if (currentView === 'website_editor') { fetchCMSConfig(); }
      if (currentView === 'revenue' || currentView === 'payments') { fetchDashboardData(); }
    }
  }, [isAdmin]);

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/health').then(r => r.json());
      if (res?.database) {
        setDbStatus(res.database);
      }
    } catch (e) {
      // fallback safe
    }
  };

  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      await login(adminEmail, adminPassword);
      showNotification('Administrator authenticated successfully!');
    } catch (err) {
      setAuthError(err.message || 'Invalid administrator credentials');
    } finally {
      setAuthLoading(false);
    }
  };

  const showNotification = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3500);
  };

  const fetchDashboardData = async () => {
    try {
      const [revRes, custRes, ordRes, prodRes] = await Promise.all([
        axiosClient.get('/revenue/overview'),
        axiosClient.get('/customers/stats'),
        axiosClient.get('/orders/admin/all?limit=5'),
        axiosClient.get('/products/admin/all?limit=5')
      ]);

      setRevenueData(revRes);
      setDashboardStats({
        revenue: revRes.stats,
        customerStats: custRes,
        recentOrders: ordRes.orders || [],
        productsCount: prodRes.total || 0
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  };

  // Fetch Customers with Date Filters (Today, Yesterday, Custom, Search)
  const fetchCustomers = async (page = 1, filters = customerFilter) => {
    setLoading(true);
    try {
      let query = `/customers?page=${page}&limit=8&search=${encodeURIComponent(filters.search)}`;
      if (filters.rangeType) query += `&rangeType=${filters.rangeType}`;
      if (filters.startDate) query += `&startDate=${filters.startDate}`;
      if (filters.endDate) query += `&endDate=${filters.endDate}`;

      const res = await axiosClient.get(query);
      if (res.success) {
        setCustomers(res.customers);
        setCustomerPagination({ page: res.currentPage, totalPages: res.totalPages, total: res.total });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Orders with Date Filters (Today, Yesterday, Custom, Search, Status)
  const fetchOrders = async (page = 1, filters = orderFilter) => {
    setLoading(true);
    try {
      let query = `/orders/admin/all?page=${page}&limit=8&search=${encodeURIComponent(filters.search)}&status=${filters.status}&paymentStatus=${filters.paymentStatus}`;
      if (filters.rangeType) query += `&rangeType=${filters.rangeType}`;
      if (filters.startDate) query += `&startDate=${filters.startDate}`;
      if (filters.endDate) query += `&endDate=${filters.endDate}`;

      const res = await axiosClient.get(query);
      if (res.success) {
        setOrders(res.orders);
        setOrderPagination({ page: res.currentPage, totalPages: res.totalPages, total: res.total });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosClient.get(`/products/admin/all?search=${encodeURIComponent(productSearch)}`);
      if (res.success) setProducts(res.products);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosClient.get('/categories/admin/all');
      if (res.success) setCategories(res.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCMSConfig = async () => {
    try {
      const res = await axiosClient.get('/cms/config');
      if (res.success) setCmsConfig(res.config);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const res = await axiosClient.get('/payments/settings');
      if (res.success) setPaymentSettings(res.settings);
    } catch (err) {
      console.error(err);
    }
  };

  // Switch menus
  const handleSelectMenu = (menuId) => {
    setActiveMenu(menuId);
    setIsSidebarOpen(false);
    // Update URL to match menu
    const urlMap = {
      dashboard: '/admin',
      customers: '/admin/customers',
      products: '/admin/products',
      categories: '/admin/categories',
      orders: '/admin/orders',
      website_editor: '/admin/editor',
      revenue: '/admin/revenue',
      payments: '/admin/payments',
    };
    if (urlMap[menuId]) handleNavigate(urlMap[menuId]);
    if (menuId === 'dashboard') fetchDashboardData();
    if (menuId === 'customers') fetchCustomers(1);
    if (menuId === 'products') { fetchProducts(); fetchCategories(); }
    if (menuId === 'categories') fetchCategories();
    if (menuId === 'orders') fetchOrders(1);
    if (menuId === 'website_editor') fetchCMSConfig();
    if (menuId === 'revenue') fetchDashboardData();
    if (menuId === 'payments') fetchPaymentSettings();
  };

  // Product CRUD with Auto-WebP Conversion
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', productForm.title);
      formData.append('subtitle', productForm.subtitle || '');
      formData.append('sku', productForm.sku);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('comparePrice', productForm.comparePrice || 0);
      formData.append('stock', productForm.stock);
      formData.append('category', productForm.category || categories[0]?._id);
      formData.append('badge', productForm.badge);
      formData.append('orderIndex', productForm.orderIndex || 1);
      formData.append('weight', productForm.weight || '');
      formData.append('dimensions', productForm.dimensions || '');
      formData.append('material', productForm.material || '');

      // Parse feature bullet points
      const features = productForm.featuresText ? productForm.featuresText.split('\n').map(s => s.trim()).filter(Boolean) : [];
      formData.append('features', JSON.stringify(features));

      // Parse color variants
      const variants = productForm.variantsText ? productForm.variantsText.split('\n').map(line => {
        const parts = line.split(':').map(s => s.trim());
        return { name: parts[0] || 'Color', color: parts[0] || 'Color', hex: parts[1] || '#E4CFBA', image: parts[2] || '' };
      }).filter(v => v.name) : [];
      formData.append('variants', JSON.stringify(variants));

      // Parse sizes
      const sizes = productForm.sizesText ? productForm.sizesText.split(',').map(s => s.trim()).filter(Boolean) : [];
      formData.append('sizes', JSON.stringify(sizes));

      // Additional images
      if (productForm.imagesText) {
        const extraImgs = productForm.imagesText.split(',').map(s => s.trim()).filter(Boolean);
        extraImgs.forEach(img => formData.append('images', img));
      }

      if (selectedProductFiles.length > 0) {
        for (let i = 0; i < selectedProductFiles.length; i++) {
          formData.append('images', selectedProductFiles[i]);
        }
      }

      if (editingProduct) {
        await axiosClient.put(`/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('Product updated successfully with rich variants, order & specs!');
      } else {
        await axiosClient.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('Product created successfully with rich variants, order & specs!');
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      setSelectedProductFiles([]);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axiosClient.delete(`/products/${id}`);
        showNotification('Product deleted successfully.');
        fetchProducts();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Category CRUD with Auto-WebP Conversion & Display Order
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('description', categoryForm.description || '');
      formData.append('orderIndex', categoryForm.orderIndex || 1);
      if (categoryForm.slug) formData.append('slug', categoryForm.slug);

      if (selectedCategoryFile) {
        formData.append('image', selectedCategoryFile);
      } else if (categoryForm.image) {
        formData.append('image', categoryForm.image);
      }

      if (editingCategory) {
        await axiosClient.put(`/categories/${editingCategory._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('Category updated successfully with order index!');
      } else {
        await axiosClient.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showNotification('Category created with auto-converted WebP banner!');
      }

      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      setSelectedCategoryFile(null);
      fetchCategories();

      showNotification('Category created with auto-converted WebP banner!');
      setIsCategoryModalOpen(false);
      setSelectedCategoryFile(null);
      fetchCategories();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Delete this category?')) {
      try {
        await axiosClient.delete(`/categories/${id}`);
        showNotification('Category deleted.');
        fetchCategories();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosClient.patch(`/orders/admin/${orderId}/status`, { status: newStatus });
      showNotification(`Order status updated to ${newStatus}`);
      fetchOrders(orderPagination.page);
    } catch (err) {
      alert(err.message);
    }
  };

  // Save Website Editor Config
  const handleSaveCMS = async () => {
    setLoading(true);
    try {
      await axiosClient.put('/cms/config', cmsConfig);
      showNotification('Storefront Website configuration updated successfully! Changes published.');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBannerImage = async (file, onUploaded) => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await axiosClient.post('/cms/upload-banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success && res.url) {
        onUploaded(res.url);
        showNotification('Image converted to WebP format via Sharp and updated!');
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlog = () => {
    if (!newBlog.title) return alert('Please enter an article title.');
    const updatedBlogs = [
      ...(cmsConfig.blogs || []),
      {
        ...newBlog,
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      }
    ];
    setCmsConfig({ ...cmsConfig, blogs: updatedBlogs });
    setNewBlog({
      title: '',
      category: 'Home & Living',
      author: 'Annsha Editorial',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
      summary: '',
      content: ''
    });
    setShowAddBlog(false);
    showNotification('New Blog article added to draft! Click "Save Website Changes" to publish.');
  };

  const handleDeleteBlog = (id) => {
    const updated = (cmsConfig.blogs || []).filter(b => b.id !== id);
    setCmsConfig({ ...cmsConfig, blogs: updated });
    showNotification('Blog article removed! Click "Save Website Changes" to publish.');
  };

  const handleAddFaq = () => {
    if (!newFaq.question || !newFaq.answer) return alert('Please enter both question and answer.');
    const updatedFaqs = [
      ...(cmsConfig.faqs || []),
      { ...newFaq, id: Date.now() }
    ];
    setCmsConfig({ ...cmsConfig, faqs: updatedFaqs });
    setNewFaq({ category: 'Shipping', question: '', answer: '' });
    setShowAddFaq(false);
    showNotification('New FAQ item added to draft! Click "Save Website Changes" to publish.');
  };

  const handleDeleteFaq = (id) => {
    const updated = (cmsConfig.faqs || []).filter(f => f.id !== id);
    setCmsConfig({ ...cmsConfig, faqs: updated });
    showNotification('FAQ item removed! Click "Save Website Changes" to publish.');
  };

  // Save Payment Settings
  const handleSavePaymentSettings = async () => {
    setLoading(true);
    try {
      await axiosClient.put('/payments/settings', paymentSettings);
      showNotification('Payment Gateway settings updated successfully!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Date Filter Component used by Customers and Orders
  const renderDateFilterBar = (filterState, setFilterState, onApply) => (
    <div className="flex flex-wrap items-center gap-2 bg-[#FAF5EE] p-3 rounded-sm border border-[#c3c4c7] mb-4 text-xs">
      <span className="font-bold text-[#2271b1] flex items-center gap-1">
        <Calendar className="w-3.5 h-3.5" /> Filter by Date:
      </span>

      {/* Today */}
      <button
        onClick={() => {
          const updated = { ...filterState, rangeType: filterState.rangeType === 'today' ? '' : 'today' };
          setFilterState(updated);
          onApply(1, updated);
        }}
        className={`px-3 py-1.5 rounded font-semibold transition-all ${filterState.rangeType === 'today' ? 'bg-[#2271b1] text-white' : 'bg-white text-[#1d2327] border border-[#c3c4c7] hover:bg-[#f0f0f1]'}`}
      >
        Today
      </button>

      {/* Yesterday */}
      <button
        onClick={() => {
          const updated = { ...filterState, rangeType: filterState.rangeType === 'yesterday' ? '' : 'yesterday' };
          setFilterState(updated);
          onApply(1, updated);
        }}
        className={`px-3 py-1.5 rounded font-semibold transition-all ${filterState.rangeType === 'yesterday' ? 'bg-[#2271b1] text-white' : 'bg-white text-[#1d2327] border border-[#c3c4c7] hover:bg-[#f0f0f1]'}`}
      >
        Yesterday
      </button>

      {/* Custom Date Range */}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={filterState.startDate || ''}
          onChange={(e) => setFilterState({ ...filterState, rangeType: 'custom', startDate: e.target.value })}
          className="px-2 py-1 bg-white border border-[#c3c4c7] rounded-lg text-xs"
        />
        <span>to</span>
        <input
          type="date"
          value={filterState.endDate || ''}
          onChange={(e) => setFilterState({ ...filterState, rangeType: 'custom', endDate: e.target.value })}
          className="px-2 py-1 bg-white border border-[#c3c4c7] rounded-lg text-xs"
        />
        <button
          onClick={() => onApply(1, { ...filterState, rangeType: 'custom' })}
          className="px-3 py-1 bg-[#2271b1] text-white rounded-lg font-semibold hover:bg-[#59330E]"
        >
          Apply
        </button>
      </div>

      {filterState.rangeType && (
        <button
          onClick={() => {
            const cleared = { ...filterState, rangeType: '', startDate: '', endDate: '' };
            setFilterState(cleared);
            onApply(1, cleared);
          }}
          className="text-[#B93822] hover:underline font-semibold ml-auto"
        >
          Reset Filter
        </button>
      )}
    </div>
  );

  // If user is not yet logged in as Admin, show the authentic WordPress WP-Admin Login Screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full bg-[#f0f0f1] flex flex-col justify-center items-center p-4 selection:bg-[#2271b1] selection:text-white font-sans">
        {/* WordPress Emblem & Site Name Header */}
        <div className="mb-6 text-center">
          <div className="w-16 h-16 mx-auto rounded bg-[#1d2327] border-2 border-[#2271b1] flex items-center justify-center text-white shadow-md mb-3">
            <span className="font-sans text-3xl font-bold text-[#2271b1]">W</span>
          </div>
          <h1 className="text-xl font-bold text-[#1d2327] tracking-tight">ANNSHA GLOBAL</h1>
          <p className="text-[11px] text-[#646970] uppercase tracking-wider font-semibold">WordPress WP-Admin Portal</p>
        </div>

        {/* WordPress Postbox Login Card */}
        <div className="w-full max-w-[360px] bg-white border border-[#c3c4c7] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4 text-[#2c3338]">
          {authError && (
            <div className="p-3 bg-[#fcf0f1] border-l-4 border-[#d63638] text-[#1d2327] text-xs font-medium">
              <strong>Error:</strong> {authError}
            </div>
          )}

          {/* 1-Click Instant Demo Access */}
          <button
            type="button"
            disabled={authLoading}
            onClick={() => {
              setAdminEmail('admin@annshaglobal.com');
              setAdminPassword('adminPassword123!');
              login('admin@annshaglobal.com', 'adminPassword123!').catch((err) => setAuthError(err.message));
            }}
            className="w-full py-2.5 bg-[#2271b1] hover:bg-[#135e96] active:bg-[#0a4b78] text-white rounded text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 border border-[#2271b1]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>⚡ 1-Click Demo Admin Login</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-[#dcdcde] w-full"></div>
            <span className="bg-white px-2 text-[10px] uppercase font-bold text-[#646970] absolute">
              or credentials
            </span>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">Username or Email Address</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#2c3338] block mb-1">Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-[#2c3338] focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-1.5 text-xs text-[#646970] cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#2271b1] focus:ring-[#2271b1]" />
                <span>Remember Me</span>
              </label>

              <button
                type="submit"
                disabled={authLoading}
                className="px-5 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded text-xs font-semibold shadow-sm transition-all border border-[#2271b1] flex items-center gap-1.5"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Log In</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Link */}
        {handleBack && (
          <div className="mt-6 text-center text-xs text-[#646970]">
            <button
              type="button"
              onClick={handleBack}
              className="text-[#2271b1] hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>← Go to Annsha Global Storefront</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f0f0f1] flex flex-col text-[#2c3338] font-sans">
      {/* WordPress Admin Top Bar */}
      <header className="bg-[#1d2327] text-[#c3c4c7] px-3 sm:px-4 py-2 flex items-center justify-between shadow-sm sticky top-0 z-40 h-11 border-b border-[#2c3338]">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1 rounded hover:bg-[#2c3338] text-white"
            aria-label="Toggle WP Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
          
          {/* WordPress Site Title & Visit Site */}
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-[#2271b1] flex items-center justify-center text-white text-[10px] font-bold">
              W
            </div>
            <span className="font-semibold text-xs sm:text-sm text-white tracking-wide">
              Annsha Global
            </span>
          </div>

          {/* Visit Website Button (WP-style) */}
          {handleBack && (
            <button
              onClick={handleBack}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-[#c3c4c7] hover:text-white hover:bg-[#2c3338] rounded transition-colors"
              title="Return to Customer Storefront"
            >
              <ExternalLink className="w-3 h-3 text-[#72aee6]" />
              <span>Visit Store</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          {/* Live MongoDB Status Pill */}
          <span 
            className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#13171a] text-[11px] border border-[#2c3338]" 
            title={dbStatus.connected ? "MongoDB Live Server: Connected & Syncing" : "MongoDB Architecture: Embedded Dual-Storage Active"}
          >
            <span className={`w-2 h-2 rounded ${dbStatus.connected ? 'bg-[#00a32a]' : 'bg-[#dba617]'} animate-pulse`}></span>
            <span className="text-[#c3c4c7]">🍃 MongoDB:</span>
            <span className={dbStatus.connected ? "text-[#00a32a] font-semibold" : "text-[#dba617] font-semibold"}>
              {dbStatus.connected ? 'Connected' : 'Active Dual Engine'}
            </span>
          </span>

          {/* Howdy, Administrator & Logout */}
          <div className="flex items-center gap-2.5 border-l border-[#2c3338] pl-3">
            <span className="text-[11px] hidden sm:inline text-[#a7aaad]">
              Howdy, <strong className="text-white font-semibold">{user?.name ? user.name.split(' ')[0] : 'Administrator'}</strong>
            </span>
            <div className="w-6 h-6 rounded bg-[#2271b1] text-white flex items-center justify-center text-[10px] font-bold">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            <button
              onClick={async () => {
                await logout();
              }}
              className="p-1 rounded hover:bg-[#2c3338] text-[#a7aaad] hover:text-[#d63638] transition-colors"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* WordPress Dismissible Notice Toast */}
      {message && (
        <div className="bg-white border-l-4 border-[#00a32a] text-[#1d2327] px-4 py-2.5 text-xs font-semibold shadow-sm flex items-center gap-2 mx-4 mt-3">
          <CheckCircle className="w-4 h-4 text-[#00a32a]" />
          <span>{message}</span>
        </div>
      )}

      {/* Content Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* WordPress Admin Sidebar */}
        <aside
          className={`w-56 bg-[#1d2327] text-[#c3c4c7] flex flex-col justify-between absolute lg:static inset-y-0 left-0 z-30 transition-transform duration-200 select-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="py-2 space-y-0.5 overflow-y-auto">
            {/* 1. Core Dashboard */}
            <button
              onClick={() => handleSelectMenu('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${currentView === 'dashboard' ? 'bg-[#2271b1] text-white font-semibold' : 'hover:bg-[#2c3338] hover:text-[#72aee6]'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* 2. Shop Management Group (Images 3, 4, 5, 6) */}
            <div className="pt-3 pb-1 px-3 text-[10px] uppercase font-bold text-[#646970] tracking-wider">
              Shop Management
            </div>

            {/* Products Dropdown Group */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setOpenProductsDropdown(!openProductsDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#c3c4c7] hover:bg-[#2c3338] hover:text-[#72aee6] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-[#72aee6]" />
                  <span>Products</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openProductsDropdown ? 'rotate-180' : ''}`} />
              </button>

              {openProductsDropdown && (
                <div className="pl-4 pr-2 space-y-0.5 border-l border-[#2c3338] ml-4 text-xs">
                  {/* Categories */}
                  <button
                    type="button"
                    onClick={() => handleNavigate('/admin/categories')}
                    className={`w-full text-left px-2.5 py-1.5 rounded transition-colors ${currentView === 'categories' || currentView === 'add_category' || currentView === 'edit_category' ? 'bg-[#2271b1] text-white font-semibold' : 'text-[#a7aaad] hover:text-white hover:bg-[#2c3338]'}`}
                  >
                    • Categories
                  </button>

                  {/* Variants Group */}
                  <div className="pt-1.5 pb-0.5">
                    <div className="px-2.5 py-1 text-[11px] font-bold text-[#c3c4c7] flex items-center justify-between">
                      <span>• Variants</span>
                      <ChevronDown className="w-3 h-3 text-[#646970]" />
                    </div>
                    <div className="pl-2 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleNavigate('/admin/variants/new')}
                        className={`w-full text-left px-2.5 py-1 rounded transition-colors ${currentView === 'add_variant' ? 'bg-[#2271b1] text-white font-semibold' : 'text-[#a7aaad] hover:text-white hover:bg-[#2c3338]'}`}
                      >
                        • Add Variant
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('/admin/variants')}
                        className={`w-full text-left px-2.5 py-1 rounded transition-colors ${currentView === 'variations_list' || currentView === 'edit_variant' ? 'bg-[#2271b1] text-white font-semibold' : 'text-[#a7aaad] hover:text-white hover:bg-[#2c3338]'}`}
                      >
                        • Variations
                      </button>
                    </div>
                  </div>

                  {/* Items Group */}
                  <div className="pt-1.5 pb-0.5">
                    <div className="px-2.5 py-1 text-[11px] font-bold text-[#c3c4c7] flex items-center justify-between">
                      <span>• Items</span>
                      <ChevronDown className="w-3 h-3 text-[#646970]" />
                    </div>
                    <div className="pl-2 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleNavigate('/admin/product/new')}
                        className={`w-full text-left px-2.5 py-1 rounded transition-colors ${currentView === 'add_product' ? 'bg-[#2271b1] text-white font-semibold' : 'text-[#a7aaad] hover:text-white hover:bg-[#2c3338]'}`}
                      >
                        • Add Item
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('/admin/products')}
                        className={`w-full text-left px-2.5 py-1 rounded transition-colors ${currentView === 'products' || currentView === 'edit_product' || currentView === 'manage_item_variations' ? 'bg-[#2271b1] text-white font-semibold' : 'text-[#a7aaad] hover:text-white hover:bg-[#2c3338]'}`}
                      >
                        • Items
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Orders — outside Products dropdown */}
            <button
              type="button"
              onClick={() => handleNavigate('/admin/orders')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${currentView === 'orders' ? 'bg-[#2271b1] text-white font-semibold' : 'hover:bg-[#2c3338] hover:text-[#72aee6]'}`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Orders</span>
            </button>

            {/* Customers Section */}
            <button
              onClick={() => handleSelectMenu('customers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${currentView === 'customers' ? 'bg-[#2271b1] text-white font-semibold' : 'hover:bg-[#2c3338] hover:text-[#72aee6]'}`}
            >
              <Users className="w-4 h-4" />
              <span>Customers / Users</span>
            </button>

            {/* Appearance Section */}
            <div className="pt-3 pb-1 px-3 text-[10px] uppercase font-bold text-[#646970] tracking-wider">
              Appearance
            </div>
            <button
              onClick={() => handleSelectMenu('website_editor')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${currentView === 'website_editor' ? 'bg-[#2271b1] text-white font-semibold' : 'hover:bg-[#2c3338] hover:text-[#72aee6]'}`}
            >
              <Palette className="w-4 h-4 text-[#dba617]" />
              <span className="font-semibold text-white">Website Editor (Customizer)</span>
            </button>

            {/* Settings & Analytics Section */}
            <div className="pt-3 pb-1 px-3 text-[10px] uppercase font-bold text-[#646970] tracking-wider">
              Settings & Analytics
            </div>
            <button
              onClick={() => handleSelectMenu('revenue')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${currentView === 'revenue' ? 'bg-[#2271b1] text-white font-semibold' : 'hover:bg-[#2c3338] hover:text-[#72aee6]'}`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Analytics & Revenue</span>
            </button>
            <button
              onClick={() => handleSelectMenu('payments')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${currentView === 'payments' ? 'bg-[#2271b1] text-white font-semibold' : 'hover:bg-[#2c3338] hover:text-[#72aee6]'}`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payment Gateways</span>
            </button>
          </div>

          {/* WordPress Sidebar Footer */}
          <div className="p-3 border-t border-[#2c3338] bg-[#15191c] text-[10px] text-[#8c8f94]">
            <p className="font-semibold text-[#c3c4c7]">WordPress 6.7 Luxury MERN</p>
            <p className="text-[9px] mt-0.5 text-[#646970]">Sharp WebP Engine • Active</p>
          </div>
        </aside>

        {/* Main WordPress Work Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f0f0f1]">

          {/* DEDICATED FULL PAGES FOR ADD / EDIT / MANAGE (NO POPUP MODALS! - TASK 2) */}

          {currentView === 'add_product' && (
            <ProductEditPage
              isNew={true}
              onBack={() => handleNavigate('/admin/products')}
              categories={categories}
              onProductSaved={() => { fetchProducts(); fetchDashboardData(); }}
            />
          )}

          {currentView === 'edit_product' && (
            <ProductEditPage
              productId={targetProductId}
              isNew={false}
              onBack={() => handleNavigate('/admin/products')}
              categories={categories}
              onProductSaved={() => { fetchProducts(); fetchDashboardData(); }}
            />
          )}

          {currentView === 'manage_item_variations' && (
            <ManageProductVariationsPage
              productId={targetProductId}
              onBack={() => handleNavigate('/admin/products')}
              onSaved={() => { fetchProducts(); }}
            />
          )}

          {currentView === 'variations_list' && (
            <VariationsListPage
              onNavigate={handleNavigate}
              onAddVariant={() => handleNavigate('/admin/variants/new')}
              onEditVariant={(id) => handleNavigate(`/admin/variants/edit/${id}`)}
            />
          )}

          {currentView === 'add_variant' && (
            <VariantEditPage
              isNew={true}
              categories={categories}
              onBack={() => handleNavigate('/admin/variants')}
              onVariantSaved={() => {}}
            />
          )}

          {currentView === 'edit_variant' && (
            <VariantEditPage
              variantId={targetVariantId}
              isNew={false}
              categories={categories}
              onBack={() => handleNavigate('/admin/variants')}
              onVariantSaved={() => {}}
            />
          )}

          {currentView === 'add_category' && (
            <CategoryEditPage
              isNew={true}
              onBack={() => handleNavigate('/admin/categories')}
              onCategorySaved={() => { fetchCategories(); }}
            />
          )}

          {currentView === 'edit_category' && (
            <CategoryEditPage
              categoryId={targetCategoryId}
              isNew={false}
              onBack={() => handleNavigate('/admin/categories')}
              onCategorySaved={() => { fetchCategories(); }}
            />
          )}

          {/* 1. DASHBOARD MENU */}
          {currentView === 'dashboard' && !dashboardStats && (
              <div className="flex flex-col items-center justify-center py-24 text-[#646970]">
                <RefreshCw className="w-8 h-8 animate-spin text-[#2271b1] mb-3" />
                <p className="font-semibold text-sm">Loading Admin Metrics & Analytics...</p>
              </div>
            )}

            {activeMenu === 'dashboard' && dashboardStats && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="font-sans text-2xl font-bold text-[#1d2327]">
                    Admin Dashboard Overview
                  </h1>
                  <span className="text-xs text-[#646970]">
                    Live status • Device responsive
                  </span>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-sm bg-white border border-[#c3c4c7] shadow-sm">
                    <span className="text-xs text-[#646970]">Total Revenue</span>
                    <h3 className="font-sans text-2xl font-bold text-[#2271b1] mt-1">
                      ${dashboardStats.revenue?.totalRevenue?.toFixed(2) || '0.00'}
                    </h3>
                    <p className="text-[10px] text-[#2E7D32] mt-1">
                      Today: ${dashboardStats.revenue?.todayRevenue?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  <div className="p-4 rounded-sm bg-white border border-[#c3c4c7] shadow-sm">
                    <span className="text-xs text-[#646970]">Total Orders</span>
                    <h3 className="font-sans text-2xl font-bold text-[#1d2327] mt-1">
                      {dashboardStats.revenue?.totalOrders || 0}
                    </h3>
                    <p className="text-[10px] text-[#2271b1] mt-1">
                      Avg: ${dashboardStats.revenue?.avgOrderValue?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  <div className="p-4 rounded-sm bg-white border border-[#c3c4c7] shadow-sm">
                    <span className="text-xs text-[#646970]">Total Customers</span>
                    <h3 className="font-sans text-2xl font-bold text-[#1d2327] mt-1">
                      {dashboardStats.customerStats?.totalCustomers || 0}
                    </h3>
                    <p className="text-[10px] text-[#2271b1] mt-1">International visitors</p>
                  </div>

                  <div className="p-4 rounded-sm bg-white border border-[#c3c4c7] shadow-sm">
                    <span className="text-xs text-[#646970]">Active Products</span>
                    <h3 className="font-sans text-2xl font-bold text-[#1d2327] mt-1">
                      {dashboardStats.productsCount || 0}
                    </h3>
                    <p className="text-[10px] text-[#2271b1] mt-1">Under 6 categories</p>
                  </div>
                </div>

                {/* Recent Customers with Country & Geolocation breakdown */}
                <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-sans text-base font-bold text-[#1d2327] flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#2271b1]" />
                        Recent Customers & Country Geolocation
                      </h2>
                      <p className="text-xs text-[#646970]">
                        Captured automatically upon customer registration/login
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectMenu('customers')}
                      className="text-xs font-bold text-[#2271b1] hover:underline"
                    >
                      View All Customers &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dashboardStats.customerStats?.recentCustomers?.map((c) => (
                      <div
                        key={c._id}
                        className="p-3.5 rounded-sm bg-[#FAF5EE] border border-[#c3c4c7] flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-[#1d2327]">{c.name}</p>
                          <p className="text-[11px] text-[#646970]">{c.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-white text-[#2271b1] font-semibold text-[10px] border border-[#c3c4c7]">
                            📍 {c.city}, {c.country} ({c.countryCode || 'US'})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#646970] block">Spent</span>
                          <span className="font-bold text-[#2271b1]">${c.totalSpent || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-sans text-base font-bold text-[#1d2327]">
                      Recent Orders
                    </h2>
                    <button
                      onClick={() => handleSelectMenu('orders')}
                      className="text-xs font-bold text-[#2271b1] hover:underline"
                    >
                      View All Orders &rarr;
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#c3c4c7] text-[#646970]">
                          <th className="pb-2">Order #</th>
                          <th className="pb-2">Customer</th>
                          <th className="pb-2">Total</th>
                          <th className="pb-2">Payment</th>
                          <th className="pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F5EBE1]">
                        {dashboardStats.recentOrders.map((ord) => (
                          <tr key={ord._id} className="hover:bg-[#FAF5EE]">
                            <td className="py-2.5 font-bold text-[#2271b1]">{ord.orderNumber}</td>
                            <td className="py-2.5">{ord.customerName}</td>
                            <td className="py-2.5 font-bold">${Number(ord.grandTotal).toFixed(2)}</td>
                            <td className="py-2.5 uppercase text-[10px]">{ord.paymentMethod}</td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32]">
                                {ord.orderStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. CUSTOMERS MENU */}
            {activeMenu === 'customers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="font-sans text-2xl font-bold text-[#1d2327]">
                    Customers Directory
                  </h1>
                  <span className="text-xs text-[#646970]">
                    Total Registered: {customerPagination.total}
                  </span>
                </div>

                {/* Common Date Filter Bar & Search */}
                {renderDateFilterBar(customerFilter, setCustomerFilter, fetchCustomers)}

                {/* Search Box */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-[#A4978C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search customers by name, email, country, phone..."
                      value={customerFilter.search}
                      onChange={(e) => {
                        const updated = { ...customerFilter, search: e.target.value };
                        setCustomerFilter(updated);
                        fetchCustomers(1, updated);
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[#c3c4c7] rounded text-xs focus:outline-none focus:border-[#704214]"
                    />
                  </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white rounded-sm border border-[#c3c4c7] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#FAF5EE] border-b border-[#c3c4c7] text-[#646970] font-semibold">
                          <th className="p-3">Customer</th>
                          <th className="p-3">Country / City</th>
                          <th className="p-3">Account Created</th>
                          <th className="p-3">Orders</th>
                          <th className="p-3">Total Spent</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F5EBE1]">
                        {customers.map((c) => (
                          <tr key={c._id} className="hover:bg-[#FAF5EE]">
                            <td className="p-3 font-semibold text-[#1d2327]">
                              <div>{c.name}</div>
                              <div className="text-[11px] text-[#646970] font-normal">{c.email}</div>
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1 font-medium">
                                📍 {c.city}, {c.country}
                              </span>
                            </td>
                            <td className="p-3 text-[#646970]">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3 font-bold text-[#2271b1]">
                              {c.totalOrders || 0}
                            </td>
                            <td className="p-3 font-bold">
                              ${Number(c.totalSpent || 0).toFixed(2)}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {c.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="p-3 border-t border-[#c3c4c7] flex items-center justify-between text-xs">
                    <span>Page {customerPagination.page} of {customerPagination.totalPages || 1}</span>
                    <div className="flex gap-2">
                      <button
                        disabled={customerPagination.page <= 1}
                        onClick={() => fetchCustomers(customerPagination.page - 1)}
                        className="px-3 py-1 bg-white border border-[#c3c4c7] rounded-lg disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        disabled={customerPagination.page >= customerPagination.totalPages}
                        onClick={() => fetchCustomers(customerPagination.page + 1)}
                        className="px-3 py-1 bg-white border border-[#c3c4c7] rounded-lg disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PRODUCTS MENU */}
            {activeMenu === 'products' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="font-sans text-2xl font-bold text-[#1d2327]">
                      Items
                    </h1>
                    <p className="text-xs text-[#646970]">
                      Manage store products with image uploads, variants, and full specifications
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => handleNavigate('/admin/product/new')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#2271b1] text-white rounded text-xs font-semibold hover:bg-[#135e96] shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Item</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-[#2c3338] border border-[#c3c4c7] rounded text-xs font-medium hover:bg-[#f0f0f1]">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Images</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-[#2c3338] border border-[#c3c4c7] rounded text-xs font-medium hover:bg-[#f0f0f1]">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Sample CSV</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-[#2c3338] border border-[#c3c4c7] rounded text-xs font-medium hover:bg-[#f0f0f1]">
                      <ArrowLeft className="w-3.5 h-3.5 rotate-90" />
                      <span>Import CSV</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-[#2c3338] border border-[#c3c4c7] rounded text-xs font-medium hover:bg-[#f0f0f1]">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Product Search */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-[#A4978C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search products by title or SKU..."
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[#c3c4c7] rounded text-xs focus:outline-none focus:border-[#704214]"
                    />
                  </div>
                  <button
                    onClick={fetchProducts}
                    className="px-4 py-2 bg-[#2271b1] text-white rounded text-xs font-semibold"
                  >
                    Search
                  </button>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-sm border border-[#c3c4c7] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#FAF5EE] border-b border-[#c3c4c7] text-[#646970] font-semibold">
                          <th className="p-3 w-10"><input type="checkbox" className="rounded" /></th>
                          <th className="p-3">Image</th>
                          <th className="p-3">Title</th>
                          <th className="p-3">Price ($)</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">SKU</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Variants</th>
                          <th className="p-3">Featured</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F5EBE1]">
                        {products.map((p) => (
                          <tr key={p._id} className="hover:bg-[#FAF5EE]">
                            <td className="p-3"><input type="checkbox" className="rounded" /></td>
                            <td className="p-3">
                              <img
                                src={p.images?.[0]}
                                alt={p.title}
                                className="w-10 h-10 object-contain rounded bg-white border border-[#c3c4c7]"
                              />
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-[#1d2327] max-w-[180px] truncate block">
                                {p.title}
                              </span>
                              <span className="text-[10px] text-[#646970]">#{p.orderIndex || 1}</span>
                            </td>
                            <td className="p-3 font-bold">
                              ${Number(p.price).toFixed(2)}
                              {p.comparePrice > p.price && (
                                <span className="line-through text-[#646970] text-[10px] ml-1 block">${p.comparePrice}</span>
                              )}
                            </td>
                            <td className="p-3 text-[10px] text-[#646970] uppercase">
                              {p.badge || 'standard'}
                            </td>
                            <td className="p-3 text-[#2271b1] font-bold font-mono">{p.sku}</td>
                            <td className="p-3">{p.category?.name || 'General'}</td>
                            <td className="p-3">
                              <div className="flex flex-col gap-1">
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] w-fit ${p.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {p.stock} in stock
                                </span>
                                <button
                                  onClick={() => handleNavigate(`/admin/product/${p._id}/variations`)}
                                  className="px-2 py-0.5 bg-[#f0f0f1] border border-[#c3c4c7] rounded text-[10px] font-semibold text-[#2c3338] hover:bg-[#dcdcde] w-fit"
                                >
                                  Manage
                                </button>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.badge && p.badge !== 'none' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                {p.badge && p.badge !== 'none' ? '★ Yes' : 'No'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleNavigate(`/admin/product/${p._id}`)}
                                  className="p-1.5 text-[#2271b1] hover:bg-[#f0f0f1] rounded-lg"
                                  title="Edit Product"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p._id)}
                                  className="p-1.5 text-[#B93822] hover:bg-red-50 rounded-lg"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 4. CATEGORIES MENU */}
            {activeMenu === 'categories' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-sans text-2xl font-bold text-[#1d2327]">
                      Categories Directory
                    </h1>
                    <p className="text-xs text-[#646970]">
                      Manage category hierarchy and promotional pedestals
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavigate('/admin/category/new')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#2271b1] text-white rounded text-xs font-semibold hover:bg-[#135e96] shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((c) => (
                    <div
                      key={c._id}
                      className="p-4 rounded-sm bg-white border border-[#c3c4c7] shadow-sm flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-14 h-14 rounded-sm object-contain bg-[#FAF5EE] p-2 border border-[#c3c4c7]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.2 bg-[#FAF5EE] border border-[#c3c4c7] rounded text-[10px] font-bold text-[#2271b1]">
                              #{c.orderIndex || 1}
                            </span>
                            <h3 className="font-semibold text-xs text-[#1d2327]">{c.name}</h3>
                          </div>
                          <p className="text-[11px] text-[#646970] mt-0.5">{c.productCount || 0} Products</p>
                          <span className="text-[10px] text-[#2271b1] font-medium">/{c.slug}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleNavigate(`/admin/category/${c._id}`)}
                          className="p-1.5 text-[#2271b1] hover:bg-[#f0f0f1] rounded"
                          title="Edit category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c._id)}
                          className="p-1.5 text-[#B93822] hover:bg-red-50 rounded"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. ORDERS MENU */}
            {activeMenu === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="font-sans text-2xl font-bold text-[#1d2327]">
                    Order Management
                  </h1>
                  <span className="text-xs text-[#646970]">Total: {orderPagination.total}</span>
                </div>

                {/* Common Date Filter Bar */}
                {renderDateFilterBar(orderFilter, setOrderFilter, fetchOrders)}

                {/* Filter Controls Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-[#A4978C] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by Order #, Customer..."
                      value={orderFilter.search}
                      onChange={(e) => {
                        const updated = { ...orderFilter, search: e.target.value };
                        setOrderFilter(updated);
                        fetchOrders(1, updated);
                      }}
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#c3c4c7] rounded text-xs"
                    />
                  </div>

                  <select
                    value={orderFilter.status}
                    onChange={(e) => {
                      const updated = { ...orderFilter, status: e.target.value };
                      setOrderFilter(updated);
                      fetchOrders(1, updated);
                    }}
                    className="px-3 py-1.5 bg-white border border-[#c3c4c7] rounded text-xs"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-sm border border-[#c3c4c7] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#FAF5EE] border-b border-[#c3c4c7] text-[#646970] font-semibold">
                          <th className="p-3">Order Number</th>
                          <th className="p-3">Date</th>
                          <th className="p-3">Customer</th>
                          <th className="p-3">Destination</th>
                          <th className="p-3">Total</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Update Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F5EBE1]">
                        {orders.map((ord) => (
                          <tr key={ord._id} className="hover:bg-[#FAF5EE]">
                            <td className="p-3 font-bold text-[#2271b1]">{ord.orderNumber}</td>
                            <td className="p-3 text-[#646970]">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3 font-medium">{ord.customerName}</td>
                            <td className="p-3">
                              {ord.shippingAddress?.city}, {ord.shippingAddress?.country}
                            </td>
                            <td className="p-3 font-bold">
                              ${Number(ord.grandTotal).toFixed(2)}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32]">
                                {ord.orderStatus}
                              </span>
                            </td>
                            <td className="p-3">
                              <select
                                value={ord.orderStatus}
                                onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                                className="px-2 py-1 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="p-3 border-t border-[#c3c4c7] flex items-center justify-between text-xs">
                    <span>Page {orderPagination.page} of {orderPagination.totalPages || 1}</span>
                    <div className="flex gap-2">
                      <button
                        disabled={orderPagination.page <= 1}
                        onClick={() => fetchOrders(orderPagination.page - 1)}
                        className="px-3 py-1 bg-white border border-[#c3c4c7] rounded-lg disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        disabled={orderPagination.page >= orderPagination.totalPages}
                        onClick={() => fetchOrders(orderPagination.page + 1)}
                        className="px-3 py-1 bg-white border border-[#c3c4c7] rounded-lg disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. WEBSITE EDITOR MENU (CMS - ALL PAGES DYNAMIC) */}
            {activeMenu === 'website_editor' && cmsConfig && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-sans text-2xl font-bold text-[#1d2327]">
                      Website Editor CMS (All Pages)
                    </h1>
                    <p className="text-xs text-[#646970]">
                      100% Dynamic Content Control — Edit every inch of every page live.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveCMS}
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#2271b1] hover:bg-[#135e96] border border-[#2271b1] text-white rounded text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-[#C59B27]" />
                    <span>{loading ? 'Saving Changes...' : 'Save Website Changes'}</span>
                  </button>
                </div>

                {/* Sub-tab Navigation for All Pages */}
                <div className="flex flex-wrap items-center gap-2 border-b border-[#c3c4c7] pb-3 text-xs font-semibold">
                  <button
                    onClick={() => setEditorTab('home')}
                    className={`px-4 py-2 rounded-sm transition-all ${editorTab === 'home' ? 'bg-[#2271b1] text-white shadow-sm' : 'bg-white text-[#1d2327] hover:bg-[#f0f0f1]'}`}
                  >
                    🏠 Homepage
                  </button>
                  <button
                    onClick={() => setEditorTab('brand')}
                    className={`px-4 py-2 rounded-sm transition-all ${editorTab === 'brand' ? 'bg-[#2271b1] text-white shadow-sm' : 'bg-white text-[#1d2327] hover:bg-[#f0f0f1]'}`}
                  >
                    🏛️ Our Brand Page
                  </button>
                  <button
                    onClick={() => setEditorTab('blogs')}
                    className={`px-4 py-2 rounded-sm transition-all ${editorTab === 'blogs' ? 'bg-[#2271b1] text-white shadow-sm' : 'bg-white text-[#1d2327] hover:bg-[#f0f0f1]'}`}
                  >
                    ✍️ Blogs Journal
                  </button>
                  <button
                    onClick={() => setEditorTab('faqs')}
                    className={`px-4 py-2 rounded-sm transition-all ${editorTab === 'faqs' ? 'bg-[#2271b1] text-white shadow-sm' : 'bg-white text-[#1d2327] hover:bg-[#f0f0f1]'}`}
                  >
                    ❓ FAQs Concierge
                  </button>
                  <button
                    onClick={() => setEditorTab('contact')}
                    className={`px-4 py-2 rounded-sm transition-all ${editorTab === 'contact' ? 'bg-[#2271b1] text-white shadow-sm' : 'bg-white text-[#1d2327] hover:bg-[#f0f0f1]'}`}
                  >
                    📞 Contact Us Page
                  </button>
                  <button
                    onClick={() => setEditorTab('footer')}
                    className={`px-4 py-2 rounded-sm transition-all ${editorTab === 'footer' ? 'bg-[#2271b1] text-white shadow-sm' : 'bg-white text-[#1d2327] hover:bg-[#f0f0f1]'}`}
                  >
                    🌐 Footer & Global
                  </button>
                </div>

                {/* 1. HOMEPAGE TAB */}
                {editorTab === 'home' && (
                  <div className="space-y-6">
                    {/* Section 0: Brand Identity & Graphic Logo (Task 1) */}
                    <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-[#c3c4c7] pb-3">
                        <div>
                          <h3 className="font-sans text-base font-bold text-[#1d2327]">
                            Brand Identity &amp; Header Logo (Customizable)
                          </h3>
                          <p className="text-xs text-[#646970]">
                            Control the official store graphic logo live on Desktop, Mobile, and Footer.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCmsConfig({
                            ...cmsConfig,
                            header: {
                              ...cmsConfig.header,
                              logoUrl: '/images/logo.webp',
                              logoTitle: 'annsha GIFTS'
                            }
                          })}
                          className="px-3 py-1.5 bg-[#f6f7f7] border border-[#2271b1] text-[#2271b1] hover:bg-[#f0f0f1] rounded text-xs font-semibold"
                        >
                          ⚡ Use Official annsha GIFTS Logo
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        <div className="sm:col-span-8 space-y-3">
                          <div>
                            <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">
                              Header Logo Image URL (PNG / WebP / SVG)
                            </label>
                            <input
                              type="text"
                              value={cmsConfig.header?.logoUrl || '/images/logo.webp'}
                              onChange={(e) => setCmsConfig({
                                ...cmsConfig,
                                header: { ...cmsConfig.header, logoUrl: e.target.value }
                              })}
                              placeholder="e.g. /images/logo.webp"
                              className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">
                              Logo Alt Title
                            </label>
                            <input
                              type="text"
                              value={cmsConfig.header?.logoTitle || 'annsha GIFTS'}
                              onChange={(e) => setCmsConfig({
                                ...cmsConfig,
                                header: { ...cmsConfig.header, logoTitle: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                            />
                          </div>
                        </div>

                        {/* Live Graphic Logo Preview Box */}
                        <div className="sm:col-span-4 p-4 rounded bg-[#FAF5EE] border border-[#c3c4c7] text-center flex flex-col items-center justify-center">
                          <span className="text-[10px] uppercase font-bold text-[#646970] mb-2">Live Logo Preview</span>
                          <div className="bg-white p-2 rounded border border-[#c3c4c7] shadow-sm flex items-center justify-center w-full min-h-[64px]">
                            <img
                              src={cmsConfig.header?.logoUrl || '/images/logo.webp'}
                              alt="Logo Preview"
                              className="h-10 w-auto object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/logo.png';
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section A: Top Announcement Bar */}
                    <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-sans text-base font-bold text-[#1d2327]">
                          1. Top Announcement Bar
                        </h3>
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cmsConfig.announcementBar?.enabled !== false}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              announcementBar: { ...cmsConfig.announcementBar, enabled: e.target.checked }
                            })}
                            className="rounded text-[#2271b1]"
                          />
                          <span>Show Announcement Bar</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Shipping Note</label>
                          <input
                            type="text"
                            value={cmsConfig.announcementBar?.shippingText || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              announcementBar: { ...cmsConfig.announcementBar, shippingText: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Returns Note</label>
                          <input
                            type="text"
                            value={cmsConfig.announcementBar?.returnsText || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              announcementBar: { ...cmsConfig.announcementBar, returnsText: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Support Note</label>
                          <input
                            type="text"
                            value={cmsConfig.announcementBar?.supportText || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              announcementBar: { ...cmsConfig.announcementBar, supportText: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section B: Hero Banner Carousel & Multi-Slide Editor */}
                    <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="font-sans text-base font-bold text-[#1d2327]">
                            2. Hero Banner Carousel & Visual Staging (Slider Images)
                          </h3>
                          <p className="text-xs text-[#646970]">
                            Manage multiple slides with smooth auto-transition, custom headings, and WebP banners.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...(cmsConfig.heroBanners || [])];
                              updated.push({
                                tagline: 'EXCLUSIVE ARRIVALS',
                                title: 'New Luxury Additions,\nCurated for You.',
                                subtitle: 'Discover bespoke craftsmanship with unbeatable deals.',
                                buttonText: 'Shop Now',
                                buttonLink: '/shop',
                                imageUrl: '/images/sliderimage1.webp',
                                badgeText: 'Live Beautifully'
                              });
                              setCmsConfig({ ...cmsConfig, heroBanners: updated });
                              setActiveHeroSlideIndex(updated.length - 1);
                            }}
                            className="px-3 py-1.5 bg-[#FAF5EE] border border-[#c3c4c7] hover:bg-[#f0f0f1] text-[#2271b1] rounded-sm text-xs font-semibold flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Slide</span>
                          </button>
                          {(cmsConfig.heroBanners || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...(cmsConfig.heroBanners || [])];
                                updated.splice(activeHeroSlideIndex, 1);
                                setCmsConfig({ ...cmsConfig, heroBanners: updated });
                                setActiveHeroSlideIndex(Math.max(0, activeHeroSlideIndex - 1));
                              }}
                              className="px-3 py-1.5 bg-red-50 text-[#B93822] hover:bg-red-100 rounded-sm text-xs font-semibold flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Slide</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Slide Selection Tabs */}
                      <div className="flex items-center gap-2 border-b border-[#c3c4c7] pb-2 overflow-x-auto text-xs font-semibold">
                        {(cmsConfig.heroBanners || [{}]).map((slide, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => setActiveHeroSlideIndex(sIdx)}
                            className={`px-3.5 py-1.5 rounded-lg transition-all ${activeHeroSlideIndex === sIdx ? 'bg-[#2271b1] text-white shadow-sm' : 'bg-[#FAF5EE] text-[#2c3338] hover:bg-[#F0E7DB]'}`}
                          >
                            Slide {sIdx + 1} {sIdx === 0 ? '(Default)' : `(Slide ${sIdx + 1})`}
                          </button>
                        ))}
                      </div>

                      {/* Active Slide Form Fields */}
                      {(() => {
                        const activeSlide = cmsConfig.heroBanners?.[activeHeroSlideIndex] || {};
                        const updateActiveSlide = (field, val) => {
                          const updated = [...(cmsConfig.heroBanners || [{}])];
                          if (!updated[activeHeroSlideIndex]) updated[activeHeroSlideIndex] = {};
                          updated[activeHeroSlideIndex][field] = val;
                          setCmsConfig({ ...cmsConfig, heroBanners: updated });
                        };

                        return (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Tagline</label>
                                <input
                                  type="text"
                                  value={activeSlide.tagline || ''}
                                  onChange={(e) => updateActiveSlide('tagline', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Button Text</label>
                                <input
                                  type="text"
                                  value={activeSlide.buttonText || ''}
                                  onChange={(e) => updateActiveSlide('buttonText', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Button Link</label>
                                <input
                                  type="text"
                                  value={activeSlide.buttonLink || '/shop'}
                                  onChange={(e) => updateActiveSlide('buttonLink', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Badge Text (Seal)</label>
                                <input
                                  type="text"
                                  value={activeSlide.badgeText || ''}
                                  onChange={(e) => updateActiveSlide('badgeText', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Main Heading (Title)</label>
                                <textarea
                                  rows="2"
                                  value={activeSlide.title || ''}
                                  onChange={(e) => updateActiveSlide('title', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Subtitle Description</label>
                                <textarea
                                  rows="2"
                                  value={activeSlide.subtitle || ''}
                                  onChange={(e) => updateActiveSlide('subtitle', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[11px] font-semibold text-[#2c3338] block">Slider Image (URL or WebP Upload)</label>
                              <div className="flex flex-col sm:flex-row items-center gap-3">
                                <input
                                  type="text"
                                  value={activeSlide.imageUrl || ''}
                                  onChange={(e) => updateActiveSlide('imageUrl', e.target.value)}
                                  placeholder="/images/sliderimage2.webp"
                                  className="flex-1 w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                                />
                                {activeSlide.imageUrl && (
                                  <div className="w-16 h-10 rounded-lg overflow-hidden border border-[#c3c4c7] shrink-0">
                                    <img src={activeSlide.imageUrl} alt="Slide Preview" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                              <div className="p-3 border-2 border-dashed border-[#C59B27] rounded-sm bg-[#FAF5EE] text-center text-xs">
                                <label className="cursor-pointer font-bold text-[#2271b1] hover:underline flex items-center justify-center gap-1.5">
                                  <Upload className="w-4 h-4" />
                                  <span>Upload New Slide Banner (Auto-Converts PNG/JPG to WebP via Sharp)</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        handleUploadBannerImage(e.target.files[0], (webpUrl) => {
                                          updateActiveSlide('imageUrl', webpUrl);
                                        });
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Section C: 4 Value Props / Trust Badges */}
                    <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-4">
                      <h3 className="font-sans text-base font-bold text-[#1d2327]">
                        3. Four Value Props / Trust Badges
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[0, 1, 2, 3].map((idx) => (
                          <div key={idx} className="p-3 rounded-sm bg-[#FAF5EE] border border-[#c3c4c7] space-y-2">
                            <span className="font-bold text-[11px] text-[#2271b1]">Badge {idx + 1}</span>
                            <input
                              type="text"
                              placeholder="Title"
                              value={cmsConfig.valueProps?.[idx]?.title || ''}
                              onChange={(e) => {
                                const updated = [...(cmsConfig.valueProps || [])];
                                if (!updated[idx]) updated[idx] = {};
                                updated[idx].title = e.target.value;
                                setCmsConfig({ ...cmsConfig, valueProps: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Subtitle"
                              value={cmsConfig.valueProps?.[idx]?.subtitle || ''}
                              onChange={(e) => {
                                const updated = [...(cmsConfig.valueProps || [])];
                                if (!updated[idx]) updated[idx] = {};
                                updated[idx].subtitle = e.target.value;
                                setCmsConfig({ ...cmsConfig, valueProps: updated });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section D: Dual Promo Banners (Fashion & Smart Home) */}
                    <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-4">
                      <h3 className="font-sans text-base font-bold text-[#1d2327]">
                        4. Dual Promotional Banners (Offer Banners)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Promo 1 */}
                        <div className="p-4 rounded-sm bg-[#FAF5EE] border border-[#c3c4c7] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#2271b1]">Promo Card 1 (Fashion Sale)</span>
                            {cmsConfig.promoBanners?.banner1?.imageUrl && (
                              <img src={cmsConfig.promoBanners.banner1.imageUrl} alt="Promo 1 Preview" className="w-12 h-8 rounded object-cover border border-[#c3c4c7]" />
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Title"
                            value={cmsConfig.promoBanners?.banner1?.title || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              promoBanners: {
                                ...cmsConfig.promoBanners,
                                banner1: { ...cmsConfig.promoBanners?.banner1, title: e.target.value }
                              }
                            })}
                            className="w-full px-3 py-1.5 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Subtitle"
                            value={cmsConfig.promoBanners?.banner1?.subtitle || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              promoBanners: {
                                ...cmsConfig.promoBanners,
                                banner1: { ...cmsConfig.promoBanners?.banner1, subtitle: e.target.value }
                              }
                            })}
                            className="w-full px-3 py-1.5 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Button Text"
                              value={cmsConfig.promoBanners?.banner1?.buttonText || ''}
                              onChange={(e) => setCmsConfig({
                                ...cmsConfig,
                                promoBanners: {
                                  ...cmsConfig.promoBanners,
                                  banner1: { ...cmsConfig.promoBanners?.banner1, buttonText: e.target.value }
                                }
                              })}
                              className="w-full px-3 py-1.5 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Button Link"
                              value={cmsConfig.promoBanners?.banner1?.buttonLink || '/shop'}
                              onChange={(e) => setCmsConfig({
                                ...cmsConfig,
                                promoBanners: {
                                  ...cmsConfig.promoBanners,
                                  banner1: { ...cmsConfig.promoBanners?.banner1, buttonLink: e.target.value }
                                }
                              })}
                              className="w-full px-3 py-1.5 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Image URL (/images/offerbanner1.webp)"
                            value={cmsConfig.promoBanners?.banner1?.imageUrl || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              promoBanners: {
                                ...cmsConfig.promoBanners,
                                banner1: { ...cmsConfig.promoBanners?.banner1, imageUrl: e.target.value }
                              }
                            })}
                            className="w-full px-3 py-1.5 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                          />
                          <div className="p-2 border border-dashed border-[#C59B27] rounded-lg bg-white text-center text-[11px]">
                            <label className="cursor-pointer font-bold text-[#2271b1] hover:underline flex items-center justify-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Promo 1 (Auto WebP)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleUploadBannerImage(e.target.files[0], (webpUrl) => {
                                      setCmsConfig({
                                        ...cmsConfig,
                                        promoBanners: {
                                          ...cmsConfig.promoBanners,
                                          banner1: { ...cmsConfig.promoBanners?.banner1, imageUrl: webpUrl }
                                        }
                                      });
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Promo 2 */}
                        <div className="p-4 rounded-sm bg-[#FAF5EE] border border-[#c3c4c7] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#2271b1]">Promo Card 2 (Smart Home)</span>
                            {cmsConfig.promoBanners?.banner2?.imageUrl && (
                              <img src={cmsConfig.promoBanners.banner2.imageUrl} alt="Promo 2 Preview" className="w-12 h-8 rounded object-cover border border-[#c3c4c7]" />
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Title"
                            value={cmsConfig.promoBanners?.banner2?.title || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              promoBanners: {
                                ...cmsConfig.promoBanners,
                                banner2: { ...cmsConfig.promoBanners?.banner2, title: e.target.value }
                              }
                            })}
                            className="w-full px-3 py-1.5 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Subtitle"
                            value={cmsConfig.promoBanners?.banner2?.subtitle || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              promoBanners: {
                                ...cmsConfig.promoBanners,
                                banner2: { ...cmsConfig.promoBanners?.banner2, subtitle: e.target.value }
                              }
                            })}
                            className="w-full px-3 py-1.5 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Button Text"
                              value={cmsConfig.promoBanners?.banner2?.buttonText || ''}
                              onChange={(e) => setCmsConfig({
                                ...cmsConfig,
                                promoBanners: {
                                  ...cmsConfig.promoBanners,
                                  banner2: { ...cmsConfig.promoBanners?.banner2, buttonText: e.target.value }
                                }
                              })}
                              className="w-full px-3 py-1.5 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Button Link"
                              value={cmsConfig.promoBanners?.banner2?.buttonLink || '/shop'}
                              onChange={(e) => setCmsConfig({
                                ...cmsConfig,
                                promoBanners: {
                                  ...cmsConfig.promoBanners,
                                  banner2: { ...cmsConfig.promoBanners?.banner2, buttonLink: e.target.value }
                                }
                              })}
                              className="w-full px-3 py-1.5 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Image URL (/images/offerbanner2.webp)"
                            value={cmsConfig.promoBanners?.banner2?.imageUrl || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              promoBanners: {
                                ...cmsConfig.promoBanners,
                                banner2: { ...cmsConfig.promoBanners?.banner2, imageUrl: e.target.value }
                              }
                            })}
                            className="w-full px-3 py-1.5 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                          />
                          <div className="p-2 border border-dashed border-[#C59B27] rounded-lg bg-white text-center text-[11px]">
                            <label className="cursor-pointer font-bold text-[#2271b1] hover:underline flex items-center justify-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Promo 2 (Auto WebP)</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleUploadBannerImage(e.target.files[0], (webpUrl) => {
                                      setCmsConfig({
                                        ...cmsConfig,
                                        promoBanners: {
                                          ...cmsConfig.promoBanners,
                                          banner2: { ...cmsConfig.promoBanners?.banner2, imageUrl: webpUrl }
                                        }
                                      });
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section E: Newsletter */}
                    <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-3">
                      <h3 className="font-sans text-base font-bold text-[#1d2327]">
                        5. Newsletter Section
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Heading"
                          value={cmsConfig.newsletter?.heading || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            newsletter: { ...cmsConfig.newsletter, heading: e.target.value }
                          })}
                          className="px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Subtitle"
                          value={cmsConfig.newsletter?.subtitle || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            newsletter: { ...cmsConfig.newsletter, subtitle: e.target.value }
                          })}
                          className="px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Button Text"
                          value={cmsConfig.newsletter?.buttonText || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            newsletter: { ...cmsConfig.newsletter, buttonText: e.target.value }
                          })}
                          className="px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. OUR BRAND PAGE TAB */}
                {editorTab === 'brand' && (
                  <div className="space-y-5">
                    <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-4">
                      <h3 className="font-sans text-base font-bold text-[#1d2327]">
                        Brand Story & Heritage Manifesto
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Brand Tagline</label>
                          <input
                            type="text"
                            value={cmsConfig.ourBrand?.tagline || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, tagline: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Main Heading (Title)</label>
                          <input
                            type="text"
                            value={cmsConfig.ourBrand?.title || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, title: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Heritage Subtitle Paragraph</label>
                        <textarea
                          rows="2"
                          value={cmsConfig.ourBrand?.subtitle || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            ourBrand: { ...cmsConfig.ourBrand, subtitle: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-4">
                      <h3 className="font-sans text-base font-bold text-[#1d2327]">
                        Philosophy & Verification Stats
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Philosophy Tagline</label>
                          <input
                            type="text"
                            value={cmsConfig.ourBrand?.philosophyTagline || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, philosophyTagline: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Philosophy Title</label>
                          <input
                            type="text"
                            value={cmsConfig.ourBrand?.philosophyTitle || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, philosophyTitle: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Philosophy Body Description</label>
                        <textarea
                          rows="3"
                          value={cmsConfig.ourBrand?.philosophyText || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            ourBrand: { ...cmsConfig.ourBrand, philosophyText: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>

                      {/* 3 Metric Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="p-3 bg-[#FAF5EE] rounded-sm border border-[#c3c4c7] space-y-1.5">
                          <label className="text-[10px] font-bold text-[#2271b1] block">Metric 1</label>
                          <input
                            type="text"
                            placeholder="Value (e.g. 100%)"
                            value={cmsConfig.ourBrand?.stat1Value || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, stat1Value: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Label (e.g. Authenticity Verified)"
                            value={cmsConfig.ourBrand?.stat1Label || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, stat1Label: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                          />
                        </div>

                        <div className="p-3 bg-[#FAF5EE] rounded-sm border border-[#c3c4c7] space-y-1.5">
                          <label className="text-[10px] font-bold text-[#2271b1] block">Metric 2</label>
                          <input
                            type="text"
                            placeholder="Value (e.g. 45+)"
                            value={cmsConfig.ourBrand?.stat2Value || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, stat2Value: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Label (e.g. Countries Shipped)"
                            value={cmsConfig.ourBrand?.stat2Label || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, stat2Label: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                          />
                        </div>

                        <div className="p-3 bg-[#FAF5EE] rounded-sm border border-[#c3c4c7] space-y-1.5">
                          <label className="text-[10px] font-bold text-[#2271b1] block">Metric 3</label>
                          <input
                            type="text"
                            placeholder="Value (e.g. 24/7)"
                            value={cmsConfig.ourBrand?.stat3Value || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, stat3Value: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Label (e.g. Concierge Service)"
                            value={cmsConfig.ourBrand?.stat3Label || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, stat3Label: e.target.value }
                            })}
                            className="w-full px-2 py-1 bg-white border border-[#c3c4c7] rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Brand Visual Image URL</label>
                        <input
                          type="text"
                          value={cmsConfig.ourBrand?.imageUrl || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            ourBrand: { ...cmsConfig.ourBrand, imageUrl: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs mb-2"
                        />
                        <div className="p-3 border-2 border-dashed border-[#C59B27] rounded-sm bg-[#FAF5EE] text-center text-xs">
                          <label className="cursor-pointer font-bold text-[#2271b1] hover:underline flex items-center justify-center gap-1.5">
                            <Upload className="w-4 h-4" />
                            <span>Upload Brand Visual (Auto WebP Transcoding via Sharp)</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleUploadBannerImage(e.target.files[0], (webpUrl) => {
                                    setCmsConfig({
                                      ...cmsConfig,
                                      ourBrand: { ...cmsConfig.ourBrand, imageUrl: webpUrl }
                                    });
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. BLOGS JOURNAL TAB */}
                {editorTab === 'blogs' && (
                  <div className="space-y-5">
                    <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-sans text-base font-bold text-[#1d2327]">
                          Blog Header & Articles Manager
                        </h3>
                        <button
                          onClick={() => setShowAddBlog(!showAddBlog)}
                          className="px-4 py-1.5 bg-[#2271b1] text-white rounded text-xs font-semibold hover:bg-[#59330E] flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{showAddBlog ? 'Cancel' : 'Add New Blog Article'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Header Tagline"
                          value={cmsConfig.blogsHeader?.tagline || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            blogsHeader: { ...cmsConfig.blogsHeader, tagline: e.target.value }
                          })}
                          className="px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Header Title"
                          value={cmsConfig.blogsHeader?.title || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            blogsHeader: { ...cmsConfig.blogsHeader, title: e.target.value }
                          })}
                          className="px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>

                      {/* Add Blog Form Card */}
                      {showAddBlog && (
                        <div className="p-4 rounded-sm bg-[#FAF5EE] border border-[#c3c4c7] space-y-3">
                          <h4 className="font-bold text-xs text-[#2271b1]">Create New Blog Article</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <input
                              type="text"
                              placeholder="Article Title *"
                              value={newBlog.title}
                              onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                              className="px-3 py-2 bg-white border border-[#c3c4c7] rounded-sm"
                            />
                            <input
                              type="text"
                              placeholder="Category (e.g. Luxury Watches)"
                              value={newBlog.category}
                              onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                              className="px-3 py-2 bg-white border border-[#c3c4c7] rounded-sm"
                            />
                            <input
                              type="text"
                              placeholder="Author Name"
                              value={newBlog.author}
                              onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                              className="px-3 py-2 bg-white border border-[#c3c4c7] rounded-sm"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Featured Image URL"
                            value={newBlog.image}
                            onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-[#c3c4c7] rounded-sm text-xs"
                          />
                          <textarea
                            rows="2"
                            placeholder="Summary (short excerpt)"
                            value={newBlog.summary}
                            onChange={(e) => setNewBlog({ ...newBlog, summary: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-[#c3c4c7] rounded-sm text-xs"
                          />
                          <textarea
                            rows="3"
                            placeholder="Full Article Content"
                            value={newBlog.content}
                            onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-[#c3c4c7] rounded-sm text-xs"
                          />
                          <button
                            onClick={handleAddBlog}
                            className="px-5 py-2 bg-[#2271b1] text-white rounded text-xs font-bold hover:bg-[#59330E]"
                          >
                            Publish Article to Draft
                          </button>
                        </div>
                      )}

                      {/* Existing Articles List */}
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-[#2c3338]">Current Published Articles ({(cmsConfig.blogs || []).length}):</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(cmsConfig.blogs || []).map((art) => (
                            <div key={art.id} className="p-3 rounded-sm bg-white border border-[#c3c4c7] shadow-sm flex items-start justify-between gap-3">
                              <img src={art.image} alt={art.title} className="w-16 h-16 rounded-sm object-cover shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-[#2271b1] uppercase">{art.category}</span>
                                <h4 className="font-sans font-bold text-xs text-[#1d2327] truncate">{art.title}</h4>
                                <p className="text-[10px] text-[#646970] line-clamp-2 mt-0.5">{art.summary}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteBlog(art.id)}
                                className="p-1.5 text-[#B93822] hover:bg-red-50 rounded-lg shrink-0"
                                title="Delete article"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. FAQS CONCIERGE TAB */}
                {editorTab === 'faqs' && (
                  <div className="space-y-5">
                    <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-sans text-base font-bold text-[#1d2327]">
                          Frequently Asked Questions (FAQ) Manager
                        </h3>
                        <button
                          onClick={() => setShowAddFaq(!showAddFaq)}
                          className="px-4 py-1.5 bg-[#2271b1] text-white rounded text-xs font-semibold hover:bg-[#59330E] flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{showAddFaq ? 'Cancel' : 'Add New FAQ Item'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Header Tagline"
                          value={cmsConfig.faqHeader?.tagline || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            faqHeader: { ...cmsConfig.faqHeader, tagline: e.target.value }
                          })}
                          className="px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Header Title"
                          value={cmsConfig.faqHeader?.title || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            faqHeader: { ...cmsConfig.faqHeader, title: e.target.value }
                          })}
                          className="px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>

                      {/* Add FAQ Form Card */}
                      {showAddFaq && (
                        <div className="p-4 rounded-sm bg-[#FAF5EE] border border-[#c3c4c7] space-y-3 text-xs">
                          <h4 className="font-bold text-[#2271b1]">Create New FAQ</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <select
                              value={newFaq.category}
                              onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                              className="px-3 py-2 bg-white border border-[#c3c4c7] rounded-sm"
                            >
                              <option value="Shipping">Shipping</option>
                              <option value="Returns">Returns</option>
                              <option value="Payment">Payment</option>
                              <option value="Authenticity">Authenticity</option>
                              <option value="Orders">Orders</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Question *"
                              value={newFaq.question}
                              onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                              className="sm:col-span-2 px-3 py-2 bg-white border border-[#c3c4c7] rounded-sm"
                            />
                          </div>
                          <textarea
                            rows="3"
                            placeholder="Detailed Answer *"
                            value={newFaq.answer}
                            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-[#c3c4c7] rounded-sm"
                          />
                          <button
                            onClick={handleAddFaq}
                            className="px-5 py-2 bg-[#2271b1] text-white rounded font-bold hover:bg-[#59330E]"
                          >
                            Add FAQ to Draft
                          </button>
                        </div>
                      )}

                      {/* Existing FAQs List */}
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-[#2c3338]">Current FAQs ({(cmsConfig.faqs || []).length}):</span>
                        <div className="space-y-2">
                          {(cmsConfig.faqs || []).map((faq) => (
                            <div key={faq.id} className="p-3.5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF5EE] text-[#2271b1]">
                                  {faq.category}
                                </span>
                                <h4 className="font-sans font-bold text-xs text-[#1d2327]">{faq.question}</h4>
                                <p className="text-[11px] text-[#646970] leading-relaxed">{faq.answer}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteFaq(faq.id)}
                                className="p-1.5 text-[#B93822] hover:bg-red-50 rounded-lg shrink-0"
                                title="Delete FAQ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. CONTACT US PAGE TAB */}
                {editorTab === 'contact' && (
                  <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-4">
                    <h3 className="font-sans text-base font-bold text-[#1d2327]">
                      Concierge & Contact Us Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Header Tagline</label>
                        <input
                          type="text"
                          value={cmsConfig.contactUs?.tagline || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            contactUs: { ...cmsConfig.contactUs, tagline: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Header Title</label>
                        <input
                          type="text"
                          value={cmsConfig.contactUs?.title || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            contactUs: { ...cmsConfig.contactUs, title: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Subtitle Note</label>
                      <textarea
                        rows="2"
                        value={cmsConfig.contactUs?.subtitle || ''}
                        onChange={(e) => setCmsConfig({
                          ...cmsConfig,
                          contactUs: { ...cmsConfig.contactUs, subtitle: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Telephone Concierge</label>
                        <input
                          type="text"
                          value={cmsConfig.contactUs?.phone || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            contactUs: { ...cmsConfig.contactUs, phone: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Client Support Email</label>
                        <input
                          type="email"
                          value={cmsConfig.contactUs?.email || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            contactUs: { ...cmsConfig.contactUs, email: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Flagship Global Office</label>
                        <input
                          type="text"
                          value={cmsConfig.contactUs?.address || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            contactUs: { ...cmsConfig.contactUs, address: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Boutique Operating Hours</label>
                        <input
                          type="text"
                          value={cmsConfig.contactUs?.hours || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            contactUs: { ...cmsConfig.contactUs, hours: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. FOOTER & GLOBAL TAB */}
                {editorTab === 'footer' && (
                  <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] shadow-sm space-y-4">
                    <h3 className="font-sans text-base font-bold text-[#1d2327]">
                      Footer & Global Store Configuration
                    </h3>
                    <div>
                      <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Footer About Description</label>
                      <textarea
                        rows="2"
                        value={cmsConfig.footer?.aboutText || ''}
                        onChange={(e) => setCmsConfig({
                          ...cmsConfig,
                          footer: { ...cmsConfig.footer, aboutText: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Copyright Line</label>
                        <input
                          type="text"
                          value={cmsConfig.footer?.copyrightText || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            footer: { ...cmsConfig.footer, copyrightText: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Google Play Link</label>
                        <input
                          type="text"
                          value={cmsConfig.footer?.playStoreLink || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            footer: { ...cmsConfig.footer, playStoreLink: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#2c3338] block mb-1">Apple App Store Link</label>
                        <input
                          type="text"
                          value={cmsConfig.footer?.appStoreLink || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            footer: { ...cmsConfig.footer, appStoreLink: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. REVENUE MENU */}
            {activeMenu === 'revenue' && revenueData && (
              <div className="space-y-6">
                <h1 className="font-sans text-2xl font-bold text-[#1d2327]">
                  Revenue & Financial Analytics
                </h1>

                {/* Revenue stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-sm bg-white border border-[#c3c4c7]">
                    <span className="text-xs text-[#646970]">Lifetime Revenue</span>
                    <h2 className="font-sans text-2xl font-bold text-[#2271b1] mt-1">
                      ${revenueData.stats?.totalRevenue?.toFixed(2) || '0.00'}
                    </h2>
                  </div>
                  <div className="p-4 rounded-sm bg-white border border-[#c3c4c7]">
                    <span className="text-xs text-[#646970]">Today's Revenue</span>
                    <h2 className="font-sans text-2xl font-bold text-[#2E7D32] mt-1">
                      ${revenueData.stats?.todayRevenue?.toFixed(2) || '0.00'}
                    </h2>
                  </div>
                  <div className="p-4 rounded-sm bg-white border border-[#c3c4c7]">
                    <span className="text-xs text-[#646970]">Yesterday's Revenue</span>
                    <h2 className="font-sans text-2xl font-bold text-[#1d2327] mt-1">
                      ${revenueData.stats?.yesterdayRevenue?.toFixed(2) || '0.00'}
                    </h2>
                  </div>
                  <div className="p-4 rounded-sm bg-white border border-[#c3c4c7]">
                    <span className="text-xs text-[#646970]">Average Order Value (AOV)</span>
                    <h2 className="font-sans text-2xl font-bold text-[#1d2327] mt-1">
                      ${revenueData.stats?.avgOrderValue?.toFixed(2) || '0.00'}
                    </h2>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="p-5 rounded-sm bg-white border border-[#c3c4c7]">
                  <h3 className="font-sans text-base font-bold text-[#1d2327] mb-3">
                    Revenue Breakdown by Payment Gateway
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {revenueData.paymentBreakdown?.map((pb) => (
                      <div key={pb._id} className="p-4 rounded-sm bg-[#FAF5EE] border border-[#c3c4c7]">
                        <span className="text-xs uppercase font-bold text-[#2271b1] block">
                          {pb._id}
                        </span>
                        <span className="text-lg font-bold text-[#1d2327] block mt-1">
                          ${pb.total?.toFixed(2) || 0}
                        </span>
                        <span className="text-[11px] text-[#646970]">{pb.count} Orders processed</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 8. PAYMENT GATEWAY MENU */}
            {activeMenu === 'payments' && paymentSettings && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-sans text-2xl font-bold text-[#1d2327]">
                      Dynamic Payment Settings
                    </h1>
                    <p className="text-xs text-[#646970]">
                      Enable/disable payment channels and configure credentials
                    </p>
                  </div>
                  <button
                    onClick={handleSavePaymentSettings}
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#2271b1] text-white rounded text-xs font-semibold hover:bg-[#59330E]"
                  >
                    Save Settings
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stripe */}
                  <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#1d2327]">Stripe Card</h3>
                      <input
                        type="checkbox"
                        checked={paymentSettings.stripe?.enabled}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          stripe: { ...paymentSettings.stripe, enabled: e.target.checked }
                        })}
                        className="w-4 h-4 text-[#2271b1] rounded"
                      />
                    </div>
                    <label className="text-[11px] text-[#2c3338] block">Publishable Key</label>
                    <input
                      type="text"
                      value={paymentSettings.stripe?.publishableKey || ''}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        stripe: { ...paymentSettings.stripe, publishableKey: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-[#FAF5EE] border border-[#c3c4c7] rounded-lg text-xs"
                    />
                  </div>

                  {/* PayPal */}
                  <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#1d2327]">PayPal Express</h3>
                      <input
                        type="checkbox"
                        checked={paymentSettings.paypal?.enabled}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          paypal: { ...paymentSettings.paypal, enabled: e.target.checked }
                        })}
                        className="w-4 h-4 text-[#2271b1] rounded"
                      />
                    </div>
                    <label className="text-[11px] text-[#2c3338] block">Client ID</label>
                    <input
                      type="text"
                      value={paymentSettings.paypal?.clientId || ''}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        paypal: { ...paymentSettings.paypal, clientId: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-[#FAF5EE] border border-[#c3c4c7] rounded-lg text-xs"
                    />
                  </div>

                  {/* Cash on Delivery */}
                  <div className="p-5 rounded-sm bg-white border border-[#c3c4c7] space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#1d2327]">Cash on Delivery</h3>
                      <input
                        type="checkbox"
                        checked={paymentSettings.cod?.enabled}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          cod: { ...paymentSettings.cod, enabled: e.target.checked }
                        })}
                        className="w-4 h-4 text-[#2271b1] rounded"
                      />
                    </div>
                    <label className="text-[11px] text-[#2c3338] block">Max Order Amount ($)</label>
                    <input
                      type="number"
                      value={paymentSettings.cod?.maxOrderAmount || 1000}
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        cod: { ...paymentSettings.cod, maxOrderAmount: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-1.5 bg-[#FAF5EE] border border-[#c3c4c7] rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

      {/* ===== OLD PRODUCT MODAL REMOVED - Now uses dedicated /admin/product/:id pages ===== */}
      {false && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded p-6 max-w-2xl w-full border border-[#c3c4c7] shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#c3c4c7] pb-3">
              <div>
                <h3 className="font-sans text-lg font-bold text-[#1d2327]">
                  {editingProduct ? 'Edit Product (Full Variants & Specs)' : 'Add New Product (Full Variants & Specs)'}
                </h3>
                <p className="text-[11px] text-[#646970]">
                  Configure product details, variants, sort order, weight, dimensions, and images.
                </p>
              </div>
              <button onClick={() => setIsProductModalOpen(false)}>
                <X className="w-5 h-5 text-[#646970]" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              {/* Row 1: Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. Premium Leather Handbag"
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Subtitle / Short Summary</label>
                  <input
                    type="text"
                    value={productForm.subtitle}
                    onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                    placeholder="e.g. Elegant, stylish and spacious handbag for every occasion."
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                  />
                </div>
              </div>

              {/* Row 2: SKU, Category & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">SKU Reference</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="e.g. AG-HB-303"
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Display Sort Order (#)</label>
                  <input
                    type="number"
                    min="1"
                    value={productForm.orderIndex}
                    onChange={(e) => setProductForm({ ...productForm, orderIndex: e.target.value })}
                    placeholder="1, 2, 3..."
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm font-bold text-[#2271b1]"
                  />
                </div>
              </div>

              {/* Row 3: Pricing, Stock & Badge Filter */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Compare Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.comparePrice}
                    onChange={(e) => setProductForm({ ...productForm, comparePrice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Badge Filter</label>
                  <select
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                  >
                    <option value="none">None</option>
                    <option value="todays_deals">Today's Deals</option>
                    <option value="top_rated">Top Rated</option>
                    <option value="trending">Trending</option>
                    <option value="new_arrivals">New Arrivals</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Weight, Dimensions, Material */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Weight (e.g. 0.85 kg)</label>
                  <input
                    type="text"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                    placeholder="0.85 kg"
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Dimensions / Length x Width x Height</label>
                  <input
                    type="text"
                    value={productForm.dimensions}
                    onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                    placeholder="28 x 14 x 20 cm"
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Material</label>
                  <input
                    type="text"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    placeholder="100% Genuine Italian Leather"
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                  />
                </div>
              </div>

              {/* Row 5: Feature Bullet Points */}
              <div>
                <label className="font-semibold block mb-1">
                  Feature Highlights / Bullet Points (One per line)
                </label>
                <textarea
                  rows="3"
                  value={productForm.featuresText}
                  onChange={(e) => setProductForm({ ...productForm, featuresText: e.target.value })}
                  placeholder="Premium genuine leather&#10;Spacious compartments&#10;Stylish and versatile design"
                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                />
              </div>

              {/* Row 6: Color Variants & Sizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">
                    Color Swatches (Format: Name:HexCode:ImageUrl)
                  </label>
                  <textarea
                    rows="4"
                    value={productForm.variantsText}
                    onChange={(e) => setProductForm({ ...productForm, variantsText: e.target.value })}
                    placeholder="Beige:#E4CFBA&#10;Purple:#C2A5D8&#10;Black:#2B2B2B&#10;Pink:#F3A7BD"
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">
                    Sizes Available (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={productForm.sizesText}
                    onChange={(e) => setProductForm({ ...productForm, sizesText: e.target.value })}
                    placeholder="One Size, Medium, Large"
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm mb-2"
                  />
                  <label className="font-semibold block mb-1">
                    Additional Image URLs (Comma-separated)
                  </label>
                  <textarea
                    rows="2"
                    value={productForm.imagesText}
                    onChange={(e) => setProductForm({ ...productForm, imagesText: e.target.value })}
                    placeholder="/images/sliderimage2.webp, /images/sliderimage1.webp"
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Row 7: Full Description */}
              <div>
                <label className="font-semibold block mb-1">Full Description</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                />
              </div>

              {/* WebP Auto-Conversion File Dropzone */}
              <div className="p-4 border-2 border-dashed border-[#2271b1] rounded-sm bg-[#FAF5EE] text-center space-y-1">
                <Upload className="w-6 h-6 text-[#2271b1] mx-auto" />
                <p className="font-bold text-[#1d2327]">Upload Images (PNG / JPG / WebP)</p>
                <p className="text-[10px] text-[#646970]">
                  ⚡ Automatic Sharp Engine will transcode any file into optimized WebP format!
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedProductFiles(e.target.files)}
                  className="mt-2 text-[11px]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#2271b1] text-white rounded font-semibold hover:bg-[#135e96] border border-[#2271b1] shadow-sm text-xs"
              >
                {loading ? 'Converting & Saving...' : 'Save Product & Variants'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal with Sharp Auto-WebP Upload & Sort Order */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded p-6 max-w-md w-full border border-[#c3c4c7] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#c3c4c7] pb-3">
              <div>
                <h3 className="font-sans text-lg font-bold text-[#1d2327]">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <p className="text-[11px] text-[#646970]">Set category name, slug, and sort order.</p>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)}>
                <X className="w-5 h-5 text-[#646970]" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Beauty & Personal Care"
                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="e.g. beauty-care"
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Display Sort Order (#)</label>
                  <input
                    type="number"
                    min="1"
                    value={categoryForm.orderIndex}
                    onChange={(e) => setCategoryForm({ ...categoryForm, orderIndex: e.target.value })}
                    placeholder="1, 2, 3..."
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm font-bold text-[#2271b1]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="e.g. Premium botanical skincare & fragrances"
                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-[#c3c4c7] rounded-sm"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-[#2271b1] rounded-sm bg-[#FAF5EE] text-center space-y-1">
                <Upload className="w-6 h-6 text-[#2271b1] mx-auto" />
                <p className="font-bold text-[#1d2327]">Category Banner (Auto WebP)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedCategoryFile(e.target.files[0])}
                  className="mt-2 text-[11px]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#2271b1] text-white rounded font-semibold hover:bg-[#135e96] border border-[#2271b1] shadow-sm text-xs"
              >
                {loading ? 'Processing...' : (editingCategory ? 'Update Category' : 'Create Category')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

