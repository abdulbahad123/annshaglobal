import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
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
  Sliders,
  Tag,
  Ticket,
  Copy,
  Truck,
  MapPin,
  List,
  Grid,
  BookOpen
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
    setIsSidebarOpen(false);
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
  const [openPoliciesDropdown, setOpenPoliciesDropdown] = useState(true);

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
  } else if (activePath === '/admin/coupons') {
    currentView = 'coupons';
  } else if (activePath === '/admin/delivery' || activePath === '/admin/shipping') {
    currentView = 'delivery';
  } else if (activePath === '/admin/policies' || activePath === '/admin/policy-pages' || activePath.startsWith('/admin/policies/')) {
    currentView = 'policies';
  } else if (activePath === '/admin/customers') {
    currentView = 'customers';
  } else if (activePath === '/admin/staff' || activePath === '/admin/team') {
    currentView = 'staff';
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
  // Staff Management State (Task 3)
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSearch, setStaffSearch] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('All');
  const [staffStatusFilter, setStaffStatusFilter] = useState('All');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [staffFormData, setStaffFormData] = useState({
    name: '',
    email: '',
    role: 'Store Manager',
    department: 'Operations',
    phone: '',
    status: 'active',
    permissions: ['products', 'orders'],
    notes: ''
  });
  const [customers, setCustomers] = useState([]);
  const [customerPagination, setCustomerPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [customerFilter, setCustomerFilter] = useState({ rangeType: '', startDate: '', endDate: '', search: '' });

  // Coupon View Modes (Task 6: List & Grid with Edit Icon)
  const [couponViewMode, setCouponViewMode] = useState('list');
  const [editingCouponIdx, setEditingCouponIdx] = useState(null);

  // Policy Pages State (Task 3: Hierarchical Parent-Child Category, No Tabs)
  const [activePolicyTab, setActivePolicyTab] = useState('privacy');

  useEffect(() => {
    if (activePath.startsWith('/admin/policies/')) {
      const sub = activePath.replace('/admin/policies/', '').replace(/\/$/, '');
      if (['privacy', 'terms', 'refund', 'shipping', 'contact', 'about'].includes(sub)) {
        setActivePolicyTab(sub);
      }
    }
  }, [activePath]);

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
    } else if (currentView === 'coupons') {
      setActiveMenu('coupons');
      if (isAdmin) fetchCoupons();
    } else if (currentView === 'delivery') {
      setActiveMenu('delivery');
      if (isAdmin) fetchCMSConfig();
    } else if (currentView === 'policies') {
      setActiveMenu('policies');
      if (isAdmin) fetchCMSConfig();
    } else if (currentView === 'customers') {
      setActiveMenu('customers');
      if (isAdmin) fetchCustomers(1);
    } else if (currentView === 'staff') {
      setActiveMenu('staff');
      if (isAdmin) fetchStaff();
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
      if (currentView === 'coupons') { fetchCoupons(); }
      if (currentView === 'delivery') { fetchCMSConfig(); }
      if (currentView === 'customers') { fetchCustomers(1); }
      if (currentView === 'staff') { fetchStaff(); }
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

  // Staff Management Methods (Task 3: Full Dynamic Staff Functionality)
  const fetchStaff = async () => {
    setStaffLoading(true);
    try {
      let query = `/staff?search=${encodeURIComponent(staffSearch)}`;
      if (staffRoleFilter && staffRoleFilter !== 'All') query += `&role=${encodeURIComponent(staffRoleFilter)}`;
      if (staffStatusFilter && staffStatusFilter !== 'All') query += `&status=${encodeURIComponent(staffStatusFilter)}`;
      const res = await axiosClient.get(query);
      if (res.success) {
        setStaffList(res.staff || []);
      }
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setStaffLoading(false);
    }
  };

  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffFormData({
      name: '',
      email: '',
      role: 'Store Manager',
      department: 'Operations',
      phone: '',
      status: 'active',
      permissions: ['products', 'orders'],
      notes: ''
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (member) => {
    setEditingStaffId(member._id);
    setStaffFormData({
      name: member.name || '',
      email: member.email || '',
      role: member.role || 'Store Manager',
      department: member.department || 'Operations',
      phone: member.phone || '',
      status: member.status || 'active',
      permissions: Array.isArray(member.permissions) ? member.permissions : ['products', 'orders'],
      notes: member.notes || ''
    });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = async (e) => {
    if (e) e.preventDefault();
    if (!staffFormData.name || !staffFormData.email) {
      alert('Please provide staff member name and email address.');
      return;
    }
    setStaffLoading(true);
    try {
      if (editingStaffId) {
        await axiosClient.put(`/staff/${editingStaffId}`, staffFormData);
        showNotification(`Staff member "${staffFormData.name}" updated successfully.`);
      } else {
        await axiosClient.post('/staff', staffFormData);
        showNotification(`New staff member "${staffFormData.name}" added successfully.`);
      }
      setIsStaffModalOpen(false);
      fetchStaff();
    } catch (err) {
      alert(err.message || 'Failed to save staff member');
    } finally {
      setStaffLoading(false);
    }
  };

  const handleDeleteStaff = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove staff member "${name}"?`)) return;
    try {
      await axiosClient.delete(`/staff/${id}`);
      showNotification(`Staff member "${name}" was removed.`);
      fetchStaff();
    } catch (err) {
      alert(err.message || 'Failed to delete staff member');
    }
  };

  const handleToggleStaffStatus = async (id) => {
    try {
      await axiosClient.patch(`/staff/${id}/status`);
      showNotification('Staff status updated.');
      fetchStaff();
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
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

  const fetchCoupons = async () => {
    try {
      const res = await axiosClient.get('/coupons/admin/all');
      if (res?.success && res.coupons?.length > 0) {
        setCmsConfig(prev => ({
          ...(prev || {}),
          pdpSettings: {
            ...(prev?.pdpSettings || {}),
            coupons: res.coupons
          }
        }));
      } else {
        fetchCMSConfig();
      }
    } catch (err) {
      fetchCMSConfig();
    }
  };

  const handleSaveCoupons = async () => {
    setLoading(true);
    try {
      const list = cmsConfig?.pdpSettings?.coupons || [];
      await axiosClient.put('/cms/config', cmsConfig);
      for (const cp of list) {
        if (cp._id && !String(cp._id).startsWith('temp_')) {
          await axiosClient.put(`/coupons/admin/${cp._id}`, cp).catch(() => {});
        } else {
          const res = await axiosClient.post('/coupons/admin', cp).catch(() => {});
          if (res?.data?.coupon?._id) cp._id = res.data.coupon._id;
        }
      }
      showNotification('Coupons & Vouchers saved and published to live database!');
      fetchCoupons();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
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
      staff: '/admin/staff',
      products: '/admin/products',
      categories: '/admin/categories',
      orders: '/admin/orders',
      coupons: '/admin/coupons',
      delivery: '/admin/delivery',
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
    if (menuId === 'coupons') fetchCoupons();
    if (menuId === 'delivery') fetchCMSConfig();
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

  const renderBannerUploader = (label, currentUrl, defaultPreset, onUpdateUrl, aspectHint = 'Recommended: 2160x730px or widescreen high-res PNG/JPG') => {
    return (
      <div className="space-y-2 p-3 bg-[#FAF5EE] rounded-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-700">{label}</label>
          <span className="text-[10px] text-slate-500 font-medium">{aspectHint}</span>
        </div>

        {currentUrl && (
          <div className="relative rounded border border-slate-300 overflow-hidden bg-white shadow-xs max-h-36 group">
            <img
              src={currentUrl}
              alt={label}
              className="w-full h-28 sm:h-32 object-cover object-center"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between px-4">
              <span className="text-[11px] text-white font-mono truncate max-w-sm">{currentUrl}</span>
              {defaultPreset && (
                <button
                  type="button"
                  onClick={() => onUpdateUrl(defaultPreset)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 text-[10px] font-bold rounded shadow-xs"
                >
                  Reset Default Banner
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
          <div className="sm:col-span-7">
            <label className="cursor-pointer font-bold text-[#704214] hover:text-[#59330E] hover:bg-[#F5EBE1] flex items-center justify-center gap-2 p-2.5 bg-white border-2 border-dashed border-[#C59B27] rounded text-xs transition-colors shadow-2xs">
              <Upload className="w-4 h-4 text-[#704214]" />
              <span>Choose Banner Image File (Auto WebP)</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleUploadBannerImage(e.target.files[0], (webpUrl) => {
                      onUpdateUrl(webpUrl);
                    });
                  }
                }}
              />
            </label>
          </div>
          <div className="sm:col-span-5">
            <input
              type="text"
              value={currentUrl || ''}
              onChange={(e) => onUpdateUrl(e.target.value)}
              placeholder="or paste custom image URL"
              className="w-full h-full px-3 py-2 bg-white border border-slate-200 rounded text-xs font-mono text-slate-600 focus:outline-none focus:border-[#704214]"
            />
          </div>
        </div>
      </div>
    );
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
    <div className="flex flex-wrap items-center gap-2 bg-[#FAF5EE] p-3 rounded-sm border border-slate-200 mb-4 text-xs">
      <span className="font-bold text-[#704214] flex items-center gap-1">
        <Calendar className="w-3.5 h-3.5" /> Filter by Date:
      </span>

      {/* Today */}
      <button
        onClick={() => {
          const updated = { ...filterState, rangeType: filterState.rangeType === 'today' ? '' : 'today' };
          setFilterState(updated);
          onApply(1, updated);
        }}
        className={`px-3 py-1.5 rounded font-semibold transition-all ${filterState.rangeType === 'today' ? 'bg-[#704214] text-white' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-100'}`}
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
        className={`px-3 py-1.5 rounded font-semibold transition-all ${filterState.rangeType === 'yesterday' ? 'bg-[#704214] text-white' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-100'}`}
      >
        Yesterday
      </button>

      {/* Custom Date Range */}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={filterState.startDate || ''}
          onChange={(e) => setFilterState({ ...filterState, rangeType: 'custom', startDate: e.target.value })}
          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
        />
        <span>to</span>
        <input
          type="date"
          value={filterState.endDate || ''}
          onChange={(e) => setFilterState({ ...filterState, rangeType: 'custom', endDate: e.target.value })}
          className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
        />
        <button
          onClick={() => onApply(1, { ...filterState, rangeType: 'custom' })}
          className="px-3 py-1 bg-[#704214] text-white rounded-lg font-semibold hover:bg-[#59330E]"
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
      <div className="min-h-screen w-full bg-slate-100 flex flex-col justify-center items-center p-4 selection:bg-[#704214] selection:text-white font-sans">
        {/* WordPress Emblem & Site Name Header */}
        <div className="mb-6 text-center">
          <div className="w-16 h-16 mx-auto rounded bg-[#1d2327] border-2 border-[#704214] flex items-center justify-center text-white shadow-md mb-3">
            <span className="font-sans text-3xl font-bold text-[#704214]">W</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">ANNSHA GLOBAL</h1>
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">WordPress WP-Admin Portal</p>
        </div>

        {/* WordPress Postbox Login Card */}
        <div className="w-full max-w-[360px] bg-white border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4 text-slate-700">
          {authError && (
            <div className="p-3 bg-[#fcf0f1] border-l-4 border-[#d63638] text-slate-900 text-xs font-medium">
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
            className="w-full py-2.5 bg-[#704214] hover:bg-[#59330E] active:bg-[#0a4b78] text-white rounded text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 border border-[#704214]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>⚡ 1-Click Demo Admin Login</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-[#dcdcde] w-full"></div>
            <span className="bg-white px-2 text-[10px] uppercase font-bold text-slate-500 absolute">
              or credentials
            </span>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Username or Email Address</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-slate-700 focus:outline-none focus:border-[#704214] focus:ring-1 focus:ring-[#2271b1] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-[#8c8f94] rounded text-xs text-slate-700 focus:outline-none focus:border-[#704214] focus:ring-1 focus:ring-[#2271b1] transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#704214] focus:ring-[#2271b1]" />
                <span>Remember Me</span>
              </label>

              <button
                type="submit"
                disabled={authLoading}
                className="px-5 py-1.5 bg-[#704214] hover:bg-[#59330E] text-white rounded text-xs font-semibold shadow-sm transition-all border border-[#704214] flex items-center gap-1.5"
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
          <div className="mt-6 text-center text-xs text-slate-500">
            <button
              type="button"
              onClick={handleBack}
              className="text-[#704214] hover:underline font-medium inline-flex items-center gap-1"
            >
              <span>← Go to Annsha Global Storefront</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col text-slate-800 font-sans">
      {/* Modern Luxury Admin Top Bar */}
      <header className="bg-[#0F172A] text-slate-200 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-md sticky top-0 z-40 h-14 border-b border-slate-800">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Annsha Global Luxury Logo & Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#704214] to-[#C59B27] flex items-center justify-center text-white shadow-sm font-serif font-black text-xs tracking-wider">
              AG
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">
                Annsha Global
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Admin Suite
              </span>
            </div>
          </div>

          {/* Visit Website Button */}
          {handleBack && (
            <button
              onClick={handleBack}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all shadow-xs"
              title="Return to Customer Storefront"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Visit Store</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs">
          {/* Live MongoDB Status Pill */}
          <span 
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 font-medium" 
            title={dbStatus.connected ? "MongoDB Live Server: Connected & Syncing" : "MongoDB Architecture: Embedded Dual-Storage Active"}
          >
            <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></span>
            <span>MongoDB: {dbStatus.connected ? 'Connected' : 'Active Dual Engine'}</span>
          </span>

          {/* Administrator Profile & Logout */}
          <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#704214] to-[#8C531B] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-semibold text-white">{user?.name ? user.name.split(' ')[0] : 'Administrator'}</p>
              <p className="text-[10px] text-slate-400">Store Manager</p>
            </div>
            <button
              onClick={async () => {
                await logout();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors ml-1"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Dismissible Notice Toast */}
      {message && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-950 px-4 py-2.5 text-xs font-semibold shadow-xs flex items-center gap-2 mx-4 mt-3 rounded-r-xl">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Content Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          />
        )}

        {/* Modern Admin Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0F172A] border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out select-none shadow-2xl lg:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          {/* Header on mobile drawer with close button */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#704214] to-[#C59B27] text-white flex items-center justify-center font-bold text-xs">AG</div>
              <span className="font-bold text-white text-sm">Annsha Admin</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3 space-y-1 overflow-y-auto">
            {/* 1. Core Dashboard */}
            <button
              onClick={() => handleSelectMenu('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${currentView === 'dashboard' ? 'bg-[#704214] text-white font-semibold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* 2. Shop Management Group */}
            <div className="pt-3 pb-1 px-3.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Shop Management
            </div>

            {/* Products Dropdown Group */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setOpenProductsDropdown(!openProductsDropdown)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/80 hover:text-white transition-all"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-amber-400" />
                  <span>Products</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openProductsDropdown ? 'rotate-180' : ''}`} />
              </button>

              {openProductsDropdown && (
                <div className="pl-4 pr-2 space-y-1 border-l border-slate-800 ml-4 py-1 text-xs">
                  {/* Categories */}
                  <button
                    type="button"
                    onClick={() => handleNavigate('/admin/categories')}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${currentView === 'categories' || currentView === 'add_category' || currentView === 'edit_category' ? 'bg-[#704214] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                  >
                    • Categories
                  </button>

                  {/* Variants Group */}
                  <div className="pt-1 pb-0.5">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 flex items-center justify-between">
                      <span>• Variants</span>
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </div>
                    <div className="pl-2 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleNavigate('/admin/variants/new')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${currentView === 'add_variant' ? 'bg-[#704214] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                      >
                        • Add Variant
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('/admin/variants')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${currentView === 'variations_list' || currentView === 'edit_variant' ? 'bg-[#704214] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                      >
                        • Variations
                      </button>
                    </div>
                  </div>

                  {/* Items Group */}
                  <div className="pt-1 pb-0.5">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 flex items-center justify-between">
                      <span>• Items</span>
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </div>
                    <div className="pl-2 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleNavigate('/admin/product/new')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${currentView === 'add_product' ? 'bg-[#704214] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                      >
                        • Add Item
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('/admin/products')}
                        className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${currentView === 'products' || currentView === 'edit_product' || currentView === 'manage_item_variations' ? 'bg-[#704214] text-white font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
                      >
                        • Items List
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Orders */}
            <button
              type="button"
              onClick={() => handleNavigate('/admin/orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${currentView === 'orders' ? 'bg-[#704214] text-white font-semibold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Orders</span>
            </button>

            {/* Coupons & Vouchers */}
            <button
              type="button"
              onClick={() => handleNavigate('/admin/coupons')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${currentView === 'coupons' ? 'bg-[#704214] text-white font-semibold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}`}
            >
              <Tag className="w-4 h-4 text-amber-400" />
              <span>Coupons &amp; Vouchers</span>
            </button>

            {/* Delivery & Shipping */}
            <button
              type="button"
              onClick={() => handleNavigate('/admin/delivery')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${currentView === 'delivery' ? 'bg-[#704214] text-white font-semibold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}`}
            >
              <Truck className="w-4 h-4 text-sky-400" />
              <span>Delivery &amp; Shipping</span>
            </button>

            {/* Customers Section */}
            <button
              onClick={() => handleSelectMenu('customers')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${currentView === 'customers' ? 'bg-[#704214] text-white font-semibold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}`}
            >
              <Users className="w-4 h-4" />
              <span>Customers / Users</span>
            </button>
            {/* Staff / Team Management (Task 3) */}
            <button
              onClick={() => handleSelectMenu('staff')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${currentView === 'staff' ? 'bg-[#704214] text-white font-semibold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}`}
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Staff / Team Management</span>
            </button>

            {/* Appearance Section */}
            <div className="pt-3 pb-1 px-3.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Appearance &amp; Content
            </div>

            {/* Website Editor (Customizer) */}
            <button
              onClick={() => handleSelectMenu('website_editor')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${currentView === 'website_editor' ? 'bg-[#704214] text-white font-semibold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}`}
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-white">Website Editor</span>
            </button>

            {/* Policy Pages (Parent category under Website Editor with child policy pages) - Task 3 */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => setOpenPoliciesDropdown(!openPoliciesDropdown)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${currentView === 'policies' ? 'bg-slate-800 text-amber-300 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Policy Pages</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openPoliciesDropdown || currentView === 'policies' ? 'rotate-180' : ''}`} />
              </button>

              {(openPoliciesDropdown || currentView === 'policies') && (
                <div className="pl-4 pr-2 space-y-1 border-l border-slate-800 ml-4 py-1 text-xs">
                  {[
                    { id: 'privacy', label: 'Privacy Policy', icon: '🔒' },
                    { id: 'terms', label: 'Terms & Conditions', icon: '📄' },
                    { id: 'refund', label: 'Refund & Cancellation', icon: '🔄' },
                    { id: 'shipping', label: 'Shipping & Delivery', icon: '🚚' },
                    { id: 'contact', label: 'Contact Us', icon: '📞' },
                    { id: 'about', label: 'About Us', icon: '🏛️' }
                  ].map((sub) => {
                    const isSelected = currentView === 'policies' && activePolicyTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setActivePolicyTab(sub.id);
                          handleNavigate(`/admin/policies/${sub.id}`);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                          isSelected 
                            ? 'bg-[#704214] text-white font-semibold' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="text-xs">{sub.icon}</span>
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Settings & Analytics Section */}
            <div className="pt-3 pb-1 px-3.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Settings &amp; Analytics
            </div>
            <button
              onClick={() => handleSelectMenu('revenue')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${currentView === 'revenue' ? 'bg-[#704214] text-white font-semibold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Analytics &amp; Revenue</span>
            </button>
            <button
              onClick={() => handleSelectMenu('payments')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${currentView === 'payments' ? 'bg-[#704214] text-white font-semibold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}`}
            >
              <CreditCard className="w-4 h-4 text-purple-400" />
              <span>Payment Gateways</span>
            </button>
          </div>

          {/* Modern Sidebar Footer */}
          <div className="p-3.5 border-t border-slate-800 bg-[#0B1120] text-[11px] text-slate-400">
            <p className="font-semibold text-slate-200">Annsha Global Commerce v2.0</p>
            <p className="text-[10px] mt-0.5 text-slate-500">Cloud Sharp WebP Engine • Active</p>
          </div>
        </aside>

        {/* Main Work Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F8FAFC]">

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
              <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-[#704214] mb-3" />
                <p className="font-semibold text-sm">Loading Admin Metrics & Analytics...</p>
              </div>
            )}

            {activeMenu === 'dashboard' && dashboardStats && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="font-sans text-2xl font-bold text-slate-900">
                    Admin Dashboard Overview
                  </h1>
                  <span className="text-xs text-slate-500">
                    Live status • Device responsive
                  </span>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-sm bg-white border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500">Total Revenue</span>
                    <h3 className="font-sans text-2xl font-bold text-[#704214] mt-1">
                      ${dashboardStats.revenue?.totalRevenue?.toFixed(2) || '0.00'}
                    </h3>
                    <p className="text-[10px] text-[#2E7D32] mt-1">
                      Today: ${dashboardStats.revenue?.todayRevenue?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  <div className="p-4 rounded-sm bg-white border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500">Total Orders</span>
                    <h3 className="font-sans text-2xl font-bold text-slate-900 mt-1">
                      {dashboardStats.revenue?.totalOrders || 0}
                    </h3>
                    <p className="text-[10px] text-[#704214] mt-1">
                      Avg: ${dashboardStats.revenue?.avgOrderValue?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  <div className="p-4 rounded-sm bg-white border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500">Total Customers</span>
                    <h3 className="font-sans text-2xl font-bold text-slate-900 mt-1">
                      {dashboardStats.customerStats?.totalCustomers || 0}
                    </h3>
                    <p className="text-[10px] text-[#704214] mt-1">International visitors</p>
                  </div>

                  <div className="p-4 rounded-sm bg-white border border-slate-200 shadow-sm">
                    <span className="text-xs text-slate-500">Active Products</span>
                    <h3 className="font-sans text-2xl font-bold text-slate-900 mt-1">
                      {dashboardStats.productsCount || 0}
                    </h3>
                    <p className="text-[10px] text-[#704214] mt-1">Under 6 categories</p>
                  </div>
                </div>

                {/* Recent Customers with Country & Geolocation breakdown */}
                <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-sans text-base font-bold text-slate-900 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#704214]" />
                        Recent Customers & Country Geolocation
                      </h2>
                      <p className="text-xs text-slate-500">
                        Captured automatically upon customer registration/login
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectMenu('customers')}
                      className="text-xs font-bold text-[#704214] hover:underline"
                    >
                      View All Customers &rarr;
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dashboardStats.customerStats?.recentCustomers?.map((c) => (
                      <div
                        key={c._id}
                        className="p-3.5 rounded-sm bg-[#FAF5EE] border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <p className="text-[11px] text-slate-500">{c.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-white text-[#704214] font-semibold text-[10px] border border-slate-200">
                            📍 {c.city}, {c.country} ({c.countryCode || 'US'})
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Spent</span>
                          <span className="font-bold text-[#704214]">${c.totalSpent || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-sans text-base font-bold text-slate-900">
                      Recent Orders
                    </h2>
                    <button
                      onClick={() => handleSelectMenu('orders')}
                      className="text-xs font-bold text-[#704214] hover:underline"
                    >
                      View All Orders &rarr;
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
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
                            <td className="py-2.5 font-bold text-[#704214]">{ord.orderNumber}</td>
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
                  <h1 className="font-sans text-2xl font-bold text-slate-900">
                    Customers Directory
                  </h1>
                  <span className="text-xs text-slate-500">
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
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-[#704214]"
                    />
                  </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#FAF5EE] border-b border-slate-200 text-slate-500 font-semibold">
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
                            <td className="p-3 font-semibold text-slate-900">
                              <div>{c.name}</div>
                              <div className="text-[11px] text-slate-500 font-normal">{c.email}</div>
                            </td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1 font-medium">
                                📍 {c.city}, {c.country}
                              </span>
                            </td>
                            <td className="p-3 text-slate-500">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-3 font-bold text-[#704214]">
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
                  <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span>Page {customerPagination.page} of {customerPagination.totalPages || 1}</span>
                    <div className="flex gap-2">
                      <button
                        disabled={customerPagination.page <= 1}
                        onClick={() => fetchCustomers(customerPagination.page - 1)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        disabled={customerPagination.page >= customerPagination.totalPages}
                        onClick={() => fetchCustomers(customerPagination.page + 1)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* 2.5 STAFF & TEAM MANAGEMENT MENU (Task 3: Full Dynamic Staff Functionality) */}
            {activeMenu === 'staff' && (
              <div className="space-y-6">
                {/* Header Title & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-sans text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                      <span>Staff &amp; Team Management</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        Live Access Control
                      </span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Manage administrative roles, department assignments, and granular operational privileges.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddStaff}
                    className="px-5 py-2.5 bg-[#704214] hover:bg-[#59330E] text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2 shrink-0 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4 text-amber-300" />
                    <span>Add Staff Member</span>
                  </button>
                </div>

                {/* 4 Summary Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Staff</span>
                    <span className="text-2xl font-bold text-slate-900 mt-1 block">{staffList.length}</span>
                    <span className="text-[10px] text-slate-400">Registered Accounts</span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Active Now</span>
                    <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                      {staffList.filter(s => s.status === 'active').length}
                    </span>
                    <span className="text-[10px] text-emerald-600">Full System Access</span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">Departments</span>
                    <span className="text-2xl font-bold text-indigo-700 mt-1 block">
                      {new Set(staffList.map(s => s.department || 'Operations')).size}
                    </span>
                    <span className="text-[10px] text-indigo-500">Cross-Functional</span>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">Administrators</span>
                    <span className="text-2xl font-bold text-purple-700 mt-1 block">
                      {staffList.filter(s => s.role === 'Administrator').length}
                    </span>
                    <span className="text-[10px] text-purple-500">Super Privilege</span>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search staff by name, email, department, phone..."
                      value={staffSearch}
                      onChange={(e) => {
                        setStaffSearch(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') fetchStaff();
                      }}
                      className="w-full pl-10 pr-4 py-2 bg-[#FAF5EE] border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#704214]"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    {/* Role Filter */}
                    <select
                      value={staffRoleFilter}
                      onChange={(e) => {
                        setStaffRoleFilter(e.target.value);
                      }}
                      className="px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-[#704214]"
                    >
                      <option value="All">All Roles</option>
                      <option value="Administrator">Administrator</option>
                      <option value="Store Manager">Store Manager</option>
                      <option value="Order Manager">Order Manager</option>
                      <option value="Support Agent">Support Agent</option>
                      <option value="Content Editor">Content Editor</option>
                      <option value="Inventory Specialist">Inventory Specialist</option>
                    </select>

                    {/* Status Filter */}
                    <select
                      value={staffStatusFilter}
                      onChange={(e) => {
                        setStaffStatusFilter(e.target.value);
                      }}
                      className="px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-[#704214]"
                    >
                      <option value="All">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    <button
                      onClick={fetchStaff}
                      className="px-3 py-2 bg-[#FAF5EE] border border-slate-200 hover:bg-[#F0E7DB] rounded-xl text-xs font-bold text-[#704214] transition-colors"
                      title="Refresh Directory"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${staffLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Staff Roster Table */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#FAF5EE] border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3.5">Staff Member</th>
                          <th className="p-3.5">Role &amp; Department</th>
                          <th className="p-3.5">Permissions</th>
                          <th className="p-3.5">Contact Phone</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {staffList.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="p-8 text-center text-slate-400">
                              {staffLoading ? 'Loading staff directory...' : 'No staff members found matching your search.'}
                            </td>
                          </tr>
                        ) : (
                          staffList.map((member) => {
                            const initials = member.name
                              ? member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                              : 'ST';
                            
                            const roleColor = {
                              'Administrator': 'bg-purple-50 text-purple-700 border-purple-200',
                              'Store Manager': 'bg-amber-50 text-amber-800 border-amber-200',
                              'Order Manager': 'bg-blue-50 text-blue-700 border-blue-200',
                              'Support Agent': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                              'Content Editor': 'bg-indigo-50 text-indigo-700 border-indigo-200',
                              'Inventory Specialist': 'bg-cyan-50 text-cyan-700 border-cyan-200'
                            }[member.role] || 'bg-slate-50 text-slate-700 border-slate-200';

                            return (
                              <tr key={member._id} className="hover:bg-[#FAF5EE]/60 transition-colors">
                                {/* Name & Avatar */}
                                <td className="p-3.5 font-medium">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#704214] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                      {initials}
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                                      <p className="text-[11px] text-slate-500">{member.email}</p>
                                    </div>
                                  </div>
                                </td>

                                {/* Role & Department */}
                                <td className="p-3.5">
                                  <div className="space-y-1">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleColor}`}>
                                      {member.role}
                                    </span>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                      Dept: {member.department || 'Operations'}
                                    </p>
                                  </div>
                                </td>

                                {/* Granular Permissions Chips */}
                                <td className="p-3.5">
                                  <div className="flex flex-wrap gap-1 max-w-xs">
                                    {(member.permissions || []).map((perm, idx) => (
                                      <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                        {perm}
                                      </span>
                                    ))}
                                    {(!member.permissions || member.permissions.length === 0) && (
                                      <span className="text-[11px] text-slate-400 italic">No special permissions</span>
                                    )}
                                  </div>
                                </td>

                                {/* Phone */}
                                <td className="p-3.5 text-slate-600">
                                  {member.phone || <span className="text-slate-400 italic">—</span>}
                                </td>

                                {/* Status with Toggle Click */}
                                <td className="p-3.5">
                                  <button
                                    onClick={() => handleToggleStaffStatus(member._id)}
                                    title="Click to toggle status"
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                                      member.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                        : member.status === 'suspended'
                                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                    }`}
                                  >
                                    {member.status === 'active' ? '● Active' : member.status === 'suspended' ? '▲ Suspended' : '✖ Inactive'}
                                  </button>
                                </td>

                                {/* Actions */}
                                <td className="p-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleOpenEditStaff(member)}
                                      className="p-1.5 text-slate-600 hover:text-[#704214] hover:bg-[#FAF5EE] rounded-lg transition-colors"
                                      title="Edit Staff Member"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteStaff(member._id, member.name)}
                                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                      title="Remove Staff"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add / Edit Staff Modal */}
                {isStaffModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-fadeIn">
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAF5EE]">
                        <div>
                          <h3 className="font-sans text-lg font-bold text-slate-900">
                            {editingStaffId ? 'Edit Staff Member' : 'Add New Staff Member'}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Configure administrative credentials and store access permissions.
                          </p>
                        </div>
                        <button
                          onClick={() => setIsStaffModalOpen(false)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveStaff} className="p-6 space-y-4 text-xs">
                        {/* Name & Email Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={staffFormData.name}
                              onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                              placeholder="e.g. Marcus Vance"
                              className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-xl focus:outline-none focus:border-[#704214]"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                            <input
                              type="email"
                              required
                              value={staffFormData.email}
                              onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                              placeholder="e.g. marcus@annshaglobal.com"
                              className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-xl focus:outline-none focus:border-[#704214]"
                            />
                          </div>
                        </div>

                        {/* Role & Department Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Role Title</label>
                            <select
                              value={staffFormData.role}
                              onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                              className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-xl focus:outline-none focus:border-[#704214]"
                            >
                              <option value="Administrator">Administrator (Super Admin)</option>
                              <option value="Store Manager">Store Manager</option>
                              <option value="Order Manager">Order Manager</option>
                              <option value="Support Agent">Support Agent</option>
                              <option value="Content Editor">Content Editor</option>
                              <option value="Inventory Specialist">Inventory Specialist</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Department</label>
                            <input
                              type="text"
                              value={staffFormData.department}
                              onChange={(e) => setStaffFormData({ ...staffFormData, department: e.target.value })}
                              placeholder="e.g. Operations / Customer Care"
                              className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-xl focus:outline-none focus:border-[#704214]"
                            />
                          </div>
                        </div>

                        {/* Phone & Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                            <input
                              type="text"
                              value={staffFormData.phone}
                              onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                              placeholder="+1 (555) 000-0000"
                              className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-xl focus:outline-none focus:border-[#704214]"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Account Status</label>
                            <select
                              value={staffFormData.status}
                              onChange={(e) => setStaffFormData({ ...staffFormData, status: e.target.value })}
                              className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-xl focus:outline-none focus:border-[#704214]"
                            >
                              <option value="active">Active (Full Access)</option>
                              <option value="suspended">Suspended (Access Paused)</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>

                        {/* Permissions Checkbox Grid */}
                        <div className="pt-2">
                          <label className="font-bold text-slate-700 block mb-1.5">
                            Granular Operational Privileges
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#FAF5EE] p-3 rounded-2xl border border-slate-200">
                            {[
                              { id: 'products', label: 'Products & Catalog' },
                              { id: 'orders', label: 'Orders & Shipments' },
                              { id: 'customers', label: 'Customer Directory' },
                              { id: 'cms', label: 'Website CMS Customizer' },
                              { id: 'coupons', label: 'Coupons & Vouchers' },
                              { id: 'settings', label: 'Store Settings' },
                              { id: 'staff', label: 'Staff Management' }
                            ].map((perm) => {
                              const isChecked = (staffFormData.permissions || []).includes(perm.id);
                              return (
                                <label key={perm.id} className="flex items-center gap-2 cursor-pointer text-[11px] font-medium text-slate-700">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const current = [...(staffFormData.permissions || [])];
                                      if (e.target.checked) {
                                        if (!current.includes(perm.id)) current.push(perm.id);
                                      } else {
                                        const idx = current.indexOf(perm.id);
                                        if (idx !== -1) current.splice(idx, 1);
                                      }
                                      setStaffFormData({ ...staffFormData, permissions: current });
                                    }}
                                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#704214] accent-[#704214]"
                                  />
                                  <span>{perm.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Administrative Notes</label>
                          <textarea
                            rows="2"
                            value={staffFormData.notes}
                            onChange={(e) => setStaffFormData({ ...staffFormData, notes: e.target.value })}
                            placeholder="Optional role description or internal notes..."
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-xl focus:outline-none focus:border-[#704214]"
                          />
                        </div>

                        {/* Buttons */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setIsStaffModalOpen(false)}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={staffLoading}
                            className="px-6 py-2.5 bg-[#704214] hover:bg-[#59330E] text-white rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                          >
                            <span>{editingStaffId ? 'Update Staff Member' : 'Create Staff Account'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 3. PRODUCTS MENU */}
            {activeMenu === 'products' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="font-sans text-2xl font-bold text-slate-900">
                      Items
                    </h1>
                    <p className="text-xs text-slate-500">
                      Manage store products with image uploads, variants, and full specifications
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => handleNavigate('/admin/product/new')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#704214] text-white rounded text-xs font-semibold hover:bg-[#59330E] shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Item</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded text-xs font-medium hover:bg-slate-100">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Images</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded text-xs font-medium hover:bg-slate-100">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Sample CSV</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded text-xs font-medium hover:bg-slate-100">
                      <ArrowLeft className="w-3.5 h-3.5 rotate-90" />
                      <span>Import CSV</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded text-xs font-medium hover:bg-slate-100">
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
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-[#704214]"
                    />
                  </div>
                  <button
                    onClick={fetchProducts}
                    className="px-4 py-2 bg-[#704214] text-white rounded text-xs font-semibold"
                  >
                    Search
                  </button>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#FAF5EE] border-b border-slate-200 text-slate-500 font-semibold">
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
                                className="w-10 h-10 object-contain rounded bg-white border border-slate-200"
                              />
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-slate-900 max-w-[180px] truncate block">
                                {p.title}
                              </span>
                              <span className="text-[10px] text-slate-500">#{p.orderIndex || 1}</span>
                            </td>
                            <td className="p-3 font-bold">
                              ${Number(p.price).toFixed(2)}
                              {p.comparePrice > p.price && (
                                <span className="line-through text-slate-500 text-[10px] ml-1 block">${p.comparePrice}</span>
                              )}
                            </td>
                            <td className="p-3 text-[10px] text-slate-500 uppercase">
                              {p.badge || 'standard'}
                            </td>
                            <td className="p-3 text-[#704214] font-bold font-mono">{p.sku}</td>
                            <td className="p-3">{p.category?.name || 'General'}</td>
                            <td className="p-3">
                              <div className="flex flex-col gap-1">
                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] w-fit ${p.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {p.stock} in stock
                                </span>
                                <button
                                  onClick={() => handleNavigate(`/admin/product/${p._id}/variations`)}
                                  className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-semibold text-slate-700 hover:bg-[#dcdcde] w-fit"
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
                                  className="p-1.5 text-[#704214] hover:bg-slate-100 rounded-lg"
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
                    <h1 className="font-sans text-2xl font-bold text-slate-900">
                      Categories Directory
                    </h1>
                    <p className="text-xs text-slate-500">
                      Manage category hierarchy and promotional pedestals
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavigate('/admin/category/new')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#704214] text-white rounded text-xs font-semibold hover:bg-[#59330E] shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((c) => (
                    <div
                      key={c._id}
                      className="p-4 rounded-sm bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-14 h-14 rounded-sm object-contain bg-[#FAF5EE] p-2 border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.2 bg-[#FAF5EE] border border-slate-200 rounded text-[10px] font-bold text-[#704214]">
                              #{c.orderIndex || 1}
                            </span>
                            <h3 className="font-semibold text-xs text-slate-900">{c.name}</h3>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{c.productCount || 0} Products</p>
                          <span className="text-[10px] text-[#704214] font-medium">/{c.slug}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleNavigate(`/admin/category/${c._id}`)}
                          className="p-1.5 text-[#704214] hover:bg-slate-100 rounded"
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
                  <h1 className="font-sans text-2xl font-bold text-slate-900">
                    Order Management
                  </h1>
                  <span className="text-xs text-slate-500">Total: {orderPagination.total}</span>
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
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    />
                  </div>

                  <select
                    value={orderFilter.status}
                    onChange={(e) => {
                      const updated = { ...orderFilter, status: e.target.value };
                      setOrderFilter(updated);
                      fetchOrders(1, updated);
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded text-xs"
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
                <div className="bg-white rounded-sm border border-slate-200 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-[#FAF5EE] border-b border-slate-200 text-slate-500 font-semibold">
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
                            <td className="p-3 font-bold text-[#704214]">{ord.orderNumber}</td>
                            <td className="p-3 text-slate-500">
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
                                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
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
                  <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span>Page {orderPagination.page} of {orderPagination.totalPages || 1}</span>
                    <div className="flex gap-2">
                      <button
                        disabled={orderPagination.page <= 1}
                        onClick={() => fetchOrders(orderPagination.page - 1)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        disabled={orderPagination.page >= orderPagination.totalPages}
                        onClick={() => fetchOrders(orderPagination.page + 1)}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-40"
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
                    <h1 className="font-sans text-2xl font-bold text-slate-900">
                      Website Editor CMS (All Pages)
                    </h1>
                    <p className="text-xs text-slate-500">
                      100% Dynamic Content Control — Edit every inch of every page live.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveCMS}
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#704214] hover:bg-[#59330E] border border-[#704214] text-white rounded text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-[#C59B27]" />
                    <span>{loading ? 'Saving Changes...' : 'Save Website Changes'}</span>
                  </button>
                </div>

                {/* Sub-tab Navigation for All Pages */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
                  <button
                    onClick={() => setEditorTab('home')}
                    className={`px-4 py-2 rounded-sm transition-all ${editorTab === 'home' ? 'bg-[#704214] text-white shadow-sm' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
                  >
                    🏠 Homepage
                  </button>
                  <button
                    onClick={() => setEditorTab('brand')}
                    className={`px-4 py-2 rounded-sm transition-all ${editorTab === 'brand' ? 'bg-[#704214] text-white shadow-sm' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
                  >
                    🏛️ Our Brand Page
                  </button>
                  <button
                    onClick={() => setEditorTab('blogs')}
                    className={`px-4 py-2 rounded-sm transition-all ${editorTab === 'blogs' ? 'bg-[#704214] text-white shadow-sm' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
                  >
                    ✍️ Blogs Journal
                  </button>
                  <button
                    onClick={() => setEditorTab('faqs')}
                    className={`px-4 py-2 rounded-sm transition-all ${editorTab === 'faqs' ? 'bg-[#704214] text-white shadow-sm' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
                  >
                    ❓ FAQs Concierge
                  </button>
                  <button
                    onClick={() => setEditorTab('contact')}
                    className={`px-4 py-2 rounded-sm transition-all ${editorTab === 'contact' ? 'bg-[#704214] text-white shadow-sm' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
                  >
                    📞 Contact Us Page
                  </button>
                  <button
                    onClick={() => setEditorTab('footer')}
                    className={`px-4 py-2 rounded-sm transition-all ${editorTab === 'footer' ? 'bg-[#704214] text-white shadow-sm' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
                  >
                    🌐 Footer & Global
                  </button>
                  <button
                    onClick={() => setEditorTab('pdp')}
                    className={`px-4 py-2 rounded-sm transition-all ${editorTab === 'pdp' ? 'bg-[#704214] text-white shadow-sm' : 'bg-white text-slate-900 hover:bg-slate-100'}`}
                  >
                    💎 Product Page &amp; Conversion
                  </button>
                </div>

                {/* 1. HOMEPAGE TAB */}
                {editorTab === 'home' && (
                  <div className="space-y-6">
                    {/* Section 0: Brand Identity & Graphic Logo (Task 1) */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <h3 className="font-sans text-base font-bold text-slate-900">
                            Brand Identity &amp; Header Logo (Customizable)
                          </h3>
                          <p className="text-xs text-slate-500">
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
                          className="px-3 py-1.5 bg-slate-50 border border-[#704214] text-[#704214] hover:bg-slate-100 rounded text-xs font-semibold"
                        >
                          ⚡ Use Official annsha GIFTS Logo
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        <div className="sm:col-span-8 space-y-3">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
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
                              className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                              Logo Alt Title
                            </label>
                            <input
                              type="text"
                              value={cmsConfig.header?.logoTitle || 'annsha GIFTS'}
                              onChange={(e) => setCmsConfig({
                                ...cmsConfig,
                                header: { ...cmsConfig.header, logoTitle: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                            />
                          </div>
                        </div>

                        {/* Live Graphic Logo Preview Box */}
                        <div className="sm:col-span-4 p-4 rounded bg-[#FAF5EE] border border-slate-200 text-center flex flex-col items-center justify-center">
                          <span className="text-[10px] uppercase font-bold text-slate-500 mb-2">Live Logo Preview</span>
                          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm flex items-center justify-center w-full min-h-[64px]">
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

                      {/* Header & Navbar Dynamic Background Image Control (Task 2) */}
                      <div className="border-t border-slate-200 pt-4 mt-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>🎨 Header &amp; Navigation Background Image (Full Width)</span>
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Applies custom background texture or gradient across the entire Header and Navbar.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCmsConfig({
                              ...cmsConfig,
                              header: {
                                ...cmsConfig.header,
                                backgroundImage: '/images/Soft Ivory Wave Gradient.png'
                              }
                            })}
                            className="px-3 py-1 bg-amber-50 border border-amber-600 text-[#704214] hover:bg-amber-100 rounded text-[11px] font-semibold"
                          >
                            ⚡ Set Soft Ivory Wave Gradient
                          </button>
                        </div>

                        {renderBannerUploader(
                          "Header Background Image (Widescreen)",
                          cmsConfig.header?.backgroundImage || '/images/Soft Ivory Wave Gradient.png',
                          '/images/Soft Ivory Wave Gradient.png',
                          (newUrl) => setCmsConfig({ ...cmsConfig, header: { ...cmsConfig.header, backgroundImage: newUrl } }),
                          "Displays behind Header & Navbar across all storefront pages"
                        )}
                      </div>
                    </div>

                    {/* Section A: Top Announcement Bar */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-sans text-base font-bold text-slate-900">
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
                            className="rounded text-[#704214]"
                          />
                          <span>Show Announcement Bar</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Shipping Note</label>
                          <input
                            type="text"
                            value={cmsConfig.announcementBar?.shippingText || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              announcementBar: { ...cmsConfig.announcementBar, shippingText: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Returns Note</label>
                          <input
                            type="text"
                            value={cmsConfig.announcementBar?.returnsText || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              announcementBar: { ...cmsConfig.announcementBar, returnsText: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Support Note</label>
                          <input
                            type="text"
                            value={cmsConfig.announcementBar?.supportText || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              announcementBar: { ...cmsConfig.announcementBar, supportText: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section B: Hero Banner Carousel & Multi-Slide Editor */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <h3 className="font-sans text-base font-bold text-slate-900">
                            2. Hero Banner Carousel & Visual Staging (Slider Images)
                          </h3>
                          <p className="text-xs text-slate-500">
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
                            className="px-3 py-1.5 bg-[#FAF5EE] border border-slate-200 hover:bg-slate-100 text-[#704214] rounded-sm text-xs font-semibold flex items-center gap-1"
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
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
                        {(cmsConfig.heroBanners || [{}]).map((slide, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => setActiveHeroSlideIndex(sIdx)}
                            className={`px-3.5 py-1.5 rounded-lg transition-all ${activeHeroSlideIndex === sIdx ? 'bg-[#704214] text-white shadow-sm' : 'bg-[#FAF5EE] text-slate-700 hover:bg-[#F0E7DB]'}`}
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
                                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tagline</label>
                                <input
                                  type="text"
                                  value={activeSlide.tagline || ''}
                                  onChange={(e) => updateActiveSlide('tagline', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Button Text</label>
                                <input
                                  type="text"
                                  value={activeSlide.buttonText || ''}
                                  onChange={(e) => updateActiveSlide('buttonText', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Button Link</label>
                                <input
                                  type="text"
                                  value={activeSlide.buttonLink || '/shop'}
                                  onChange={(e) => updateActiveSlide('buttonLink', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Badge Text (Seal)</label>
                                <input
                                  type="text"
                                  value={activeSlide.badgeText || ''}
                                  onChange={(e) => updateActiveSlide('badgeText', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Main Heading (Title)</label>
                                <textarea
                                  rows="2"
                                  value={activeSlide.title || ''}
                                  onChange={(e) => updateActiveSlide('title', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Subtitle Description</label>
                                <textarea
                                  rows="2"
                                  value={activeSlide.subtitle || ''}
                                  onChange={(e) => updateActiveSlide('subtitle', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[11px] font-semibold text-slate-700 block">Slider Image (URL or WebP Upload)</label>
                              <div className="flex flex-col sm:flex-row items-center gap-3">
                                <input
                                  type="text"
                                  value={activeSlide.imageUrl || ''}
                                  onChange={(e) => updateActiveSlide('imageUrl', e.target.value)}
                                  placeholder="/images/sliderimage2.webp"
                                  className="flex-1 w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                                />
                                {activeSlide.imageUrl && (
                                  <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                    <img src={activeSlide.imageUrl} alt="Slide Preview" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                              <div className="p-3 border-2 border-dashed border-[#C59B27] rounded-sm bg-[#FAF5EE] text-center text-xs">
                                <label className="cursor-pointer font-bold text-[#704214] hover:underline flex items-center justify-center gap-1.5">
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
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <h3 className="font-sans text-base font-bold text-slate-900">
                        3. Four Value Props / Trust Badges
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {[0, 1, 2, 3].map((idx) => (
                          <div key={idx} className="p-3 rounded-sm bg-[#FAF5EE] border border-slate-200 space-y-2">
                            <span className="font-bold text-[11px] text-[#704214]">Badge {idx + 1}</span>
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
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section D: Dual Promo Banners (Fashion & Smart Home) */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <h3 className="font-sans text-base font-bold text-slate-900">
                        4. Dual Promotional Banners (Offer Banners)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Promo 1 */}
                        <div className="p-4 rounded-sm bg-[#FAF5EE] border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#704214]">Promo Card 1 (Fashion Sale)</span>
                            {cmsConfig.promoBanners?.banner1?.imageUrl && (
                              <img src={cmsConfig.promoBanners.banner1.imageUrl} alt="Promo 1 Preview" className="w-12 h-8 rounded object-cover border border-slate-200" />
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
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <div className="p-2 border border-dashed border-[#C59B27] rounded-lg bg-white text-center text-[11px]">
                            <label className="cursor-pointer font-bold text-[#704214] hover:underline flex items-center justify-center gap-1">
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
                        <div className="p-4 rounded-sm bg-[#FAF5EE] border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#704214]">Promo Card 2 (Smart Home)</span>
                            {cmsConfig.promoBanners?.banner2?.imageUrl && (
                              <img src={cmsConfig.promoBanners.banner2.imageUrl} alt="Promo 2 Preview" className="w-12 h-8 rounded object-cover border border-slate-200" />
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
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
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
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <div className="p-2 border border-dashed border-[#C59B27] rounded-lg bg-white text-center text-[11px]">
                            <label className="cursor-pointer font-bold text-[#704214] hover:underline flex items-center justify-center gap-1">
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
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-3">
                      <h3 className="font-sans text-base font-bold text-slate-900">
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
                          className="px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Subtitle"
                          value={cmsConfig.newsletter?.subtitle || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            newsletter: { ...cmsConfig.newsletter, subtitle: e.target.value }
                          })}
                          className="px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Button Text"
                          value={cmsConfig.newsletter?.buttonText || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            newsletter: { ...cmsConfig.newsletter, buttonText: e.target.value }
                          })}
                          className="px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. OUR BRAND PAGE TAB */}
                {editorTab === 'brand' && (
                  <div className="space-y-5">
                    {/* Hero Banner Controls */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <h3 className="font-sans text-base font-bold text-slate-900">
                        1. Top Hero Banner (Our Brand)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Hero Title</label>
                          <input
                            type="text"
                            value={cmsConfig.ourBrand?.heroTitle || cmsConfig.ourBrand?.title || 'Our Brand'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, heroTitle: e.target.value, title: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Tagline</label>
                          <input
                            type="text"
                            value={cmsConfig.ourBrand?.heroTagline || cmsConfig.ourBrand?.tagline || 'More Than a Brand —'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, heroTagline: e.target.value, tagline: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Subtitle</label>
                          <input
                            type="text"
                            value={cmsConfig.ourBrand?.heroSubtitle || cmsConfig.ourBrand?.subtitle || 'A Lifestyle of Elegance'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, heroSubtitle: e.target.value, subtitle: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                      </div>
                      {renderBannerUploader(
                        "Hero Banner Background Image (Our Brand)",
                        cmsConfig.ourBrand?.heroBg || '/images/ourbrand.png',
                        '/images/ourbrand.png',
                        (newUrl) => setCmsConfig({ ...cmsConfig, ourBrand: { ...cmsConfig.ourBrand, heroBg: newUrl } }),
                        "Full-width hero background (e.g. /images/ourbrand.png or upload high-res image)"
                      )}
                    </div>

                    {/* About Section Controls */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <h3 className="font-sans text-base font-bold text-slate-900">
                        2. About ANNSHA GLOBAL (3-Column Story)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">About Heading</label>
                          <input
                            type="text"
                            value={cmsConfig.ourBrand?.aboutTitle || 'About ANNSHA GLOBAL'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, aboutTitle: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Button Text</label>
                          <input
                            type="text"
                            value={cmsConfig.ourBrand?.aboutButtonText || 'Discover Our Story →'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, aboutButtonText: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Paragraph 1 (Belief & Mission)</label>
                        <textarea
                          rows="2"
                          value={cmsConfig.ourBrand?.aboutP1 || 'At ANNSHA GLOBAL, we believe in more than just shopping — we believe in expressing yourself. Our brand is founded on the principles of elegance, quality, and trust, offering a curated selection of fashion, home, beauty, and lifestyle products that bring joy to your everyday life.'}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            ourBrand: { ...cmsConfig.ourBrand, aboutP1: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Paragraph 2 (Commitment & Destination)</label>
                        <textarea
                          rows="2"
                          value={cmsConfig.ourBrand?.aboutP2 || 'With a commitment to premium quality, exceptional service, and timeless style, ANNSHA GLOBAL is your destination for a more beautiful and inspired life.'}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            ourBrand: { ...cmsConfig.ourBrand, aboutP2: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Model Image URL (Left Card)</label>
                        <input
                          type="text"
                          value={cmsConfig.ourBrand?.aboutModelImage || '/images/sliderimage1.webp'}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            ourBrand: { ...cmsConfig.ourBrand, aboutModelImage: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Brand Values Controls */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-sans text-base font-bold text-slate-900">
                          3. Our Brand Values (4 Pillar Cards)
                        </h3>
                        <input
                          type="text"
                          placeholder="Section Title"
                          value={cmsConfig.ourBrand?.brandValuesTitle || 'Our Brand Values'}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            ourBrand: { ...cmsConfig.ourBrand, brandValuesTitle: e.target.value }
                          })}
                          className="px-3 py-1 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-[#FAF5EE] rounded border border-slate-200 space-y-2">
                          <span className="font-bold text-[#704214] block">Card 1 (Quality)</span>
                          <input
                            type="text"
                            placeholder="Title"
                            value={cmsConfig.ourBrand?.brandValues?.[0]?.title || 'Premium Quality'}
                            onChange={(e) => {
                              const vals = [...(cmsConfig.ourBrand?.brandValues || [
                                { id: 1, title: 'Premium Quality', subtitle: 'Only the finest, for you.', icon: 'gem' },
                                { id: 2, title: 'Trusted Brand', subtitle: 'Shop with confidence.', icon: 'shield' },
                                { id: 3, title: 'Customer First', subtitle: 'Always here for you.', icon: 'support' },
                                { id: 4, title: 'Timeless Style', subtitle: 'Because you deserve more.', icon: 'style' }
                              ])];
                              vals[0].title = e.target.value;
                              setCmsConfig({ ...cmsConfig, ourBrand: { ...cmsConfig.ourBrand, brandValues: vals } });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Subtitle"
                            value={cmsConfig.ourBrand?.brandValues?.[0]?.subtitle || 'Only the finest, for you.'}
                            onChange={(e) => {
                              const vals = [...(cmsConfig.ourBrand?.brandValues || [
                                { id: 1, title: 'Premium Quality', subtitle: 'Only the finest, for you.', icon: 'gem' },
                                { id: 2, title: 'Trusted Brand', subtitle: 'Shop with confidence.', icon: 'shield' },
                                { id: 3, title: 'Customer First', subtitle: 'Always here for you.', icon: 'support' },
                                { id: 4, title: 'Timeless Style', subtitle: 'Because you deserve more.', icon: 'style' }
                              ])];
                              vals[0].subtitle = e.target.value;
                              setCmsConfig({ ...cmsConfig, ourBrand: { ...cmsConfig.ourBrand, brandValues: vals } });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>

                        <div className="p-3 bg-[#FAF5EE] rounded border border-slate-200 space-y-2">
                          <span className="font-bold text-[#704214] block">Card 2 (Trust)</span>
                          <input
                            type="text"
                            placeholder="Title"
                            value={cmsConfig.ourBrand?.brandValues?.[1]?.title || 'Trusted Brand'}
                            onChange={(e) => {
                              const vals = [...(cmsConfig.ourBrand?.brandValues || [
                                { id: 1, title: 'Premium Quality', subtitle: 'Only the finest, for you.', icon: 'gem' },
                                { id: 2, title: 'Trusted Brand', subtitle: 'Shop with confidence.', icon: 'shield' },
                                { id: 3, title: 'Customer First', subtitle: 'Always here for you.', icon: 'support' },
                                { id: 4, title: 'Timeless Style', subtitle: 'Because you deserve more.', icon: 'style' }
                              ])];
                              vals[1].title = e.target.value;
                              setCmsConfig({ ...cmsConfig, ourBrand: { ...cmsConfig.ourBrand, brandValues: vals } });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Subtitle"
                            value={cmsConfig.ourBrand?.brandValues?.[1]?.subtitle || 'Shop with confidence.'}
                            onChange={(e) => {
                              const vals = [...(cmsConfig.ourBrand?.brandValues || [
                                { id: 1, title: 'Premium Quality', subtitle: 'Only the finest, for you.', icon: 'gem' },
                                { id: 2, title: 'Trusted Brand', subtitle: 'Shop with confidence.', icon: 'shield' },
                                { id: 3, title: 'Customer First', subtitle: 'Always here for you.', icon: 'support' },
                                { id: 4, title: 'Timeless Style', subtitle: 'Because you deserve more.', icon: 'style' }
                              ])];
                              vals[1].subtitle = e.target.value;
                              setCmsConfig({ ...cmsConfig, ourBrand: { ...cmsConfig.ourBrand, brandValues: vals } });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>

                        <div className="p-3 bg-[#FAF5EE] rounded border border-slate-200 space-y-2">
                          <span className="font-bold text-[#704214] block">Card 3 (Service)</span>
                          <input
                            type="text"
                            placeholder="Title"
                            value={cmsConfig.ourBrand?.brandValues?.[2]?.title || 'Customer First'}
                            onChange={(e) => {
                              const vals = [...(cmsConfig.ourBrand?.brandValues || [
                                { id: 1, title: 'Premium Quality', subtitle: 'Only the finest, for you.', icon: 'gem' },
                                { id: 2, title: 'Trusted Brand', subtitle: 'Shop with confidence.', icon: 'shield' },
                                { id: 3, title: 'Customer First', subtitle: 'Always here for you.', icon: 'support' },
                                { id: 4, title: 'Timeless Style', subtitle: 'Because you deserve more.', icon: 'style' }
                              ])];
                              vals[2].title = e.target.value;
                              setCmsConfig({ ...cmsConfig, ourBrand: { ...cmsConfig.ourBrand, brandValues: vals } });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Subtitle"
                            value={cmsConfig.ourBrand?.brandValues?.[2]?.subtitle || 'Always here for you.'}
                            onChange={(e) => {
                              const vals = [...(cmsConfig.ourBrand?.brandValues || [
                                { id: 1, title: 'Premium Quality', subtitle: 'Only the finest, for you.', icon: 'gem' },
                                { id: 2, title: 'Trusted Brand', subtitle: 'Shop with confidence.', icon: 'shield' },
                                { id: 3, title: 'Customer First', subtitle: 'Always here for you.', icon: 'support' },
                                { id: 4, title: 'Timeless Style', subtitle: 'Because you deserve more.', icon: 'style' }
                              ])];
                              vals[2].subtitle = e.target.value;
                              setCmsConfig({ ...cmsConfig, ourBrand: { ...cmsConfig.ourBrand, brandValues: vals } });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>

                        <div className="p-3 bg-[#FAF5EE] rounded border border-slate-200 space-y-2">
                          <span className="font-bold text-[#704214] block">Card 4 (Style)</span>
                          <input
                            type="text"
                            placeholder="Title"
                            value={cmsConfig.ourBrand?.brandValues?.[3]?.title || 'Timeless Style'}
                            onChange={(e) => {
                              const vals = [...(cmsConfig.ourBrand?.brandValues || [
                                { id: 1, title: 'Premium Quality', subtitle: 'Only the finest, for you.', icon: 'gem' },
                                { id: 2, title: 'Trusted Brand', subtitle: 'Shop with confidence.', icon: 'shield' },
                                { id: 3, title: 'Customer First', subtitle: 'Always here for you.', icon: 'support' },
                                { id: 4, title: 'Timeless Style', subtitle: 'Because you deserve more.', icon: 'style' }
                              ])];
                              vals[3].title = e.target.value;
                              setCmsConfig({ ...cmsConfig, ourBrand: { ...cmsConfig.ourBrand, brandValues: vals } });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Subtitle"
                            value={cmsConfig.ourBrand?.brandValues?.[3]?.subtitle || 'Because you deserve more.'}
                            onChange={(e) => {
                              const vals = [...(cmsConfig.ourBrand?.brandValues || [
                                { id: 1, title: 'Premium Quality', subtitle: 'Only the finest, for you.', icon: 'gem' },
                                { id: 2, title: 'Trusted Brand', subtitle: 'Shop with confidence.', icon: 'shield' },
                                { id: 3, title: 'Customer First', subtitle: 'Always here for you.', icon: 'support' },
                                { id: 4, title: 'Timeless Style', subtitle: 'Because you deserve more.', icon: 'style' }
                              ])];
                              vals[3].subtitle = e.target.value;
                              setCmsConfig({ ...cmsConfig, ourBrand: { ...cmsConfig.ourBrand, brandValues: vals } });
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Experience Collection Section */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Experience Title</label>
                          <input
                            type="text"
                            value={cmsConfig.ourBrand?.experienceTitle || 'The ANNSHA GLOBAL Experience'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, experienceTitle: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Experience Subtitle</label>
                          <input
                            type="text"
                            value={cmsConfig.ourBrand?.experienceSubtitle || 'Shop smarter. Live more beautifully.'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              ourBrand: { ...cmsConfig.ourBrand, experienceSubtitle: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. BLOGS JOURNAL TAB */}
                {editorTab === 'blogs' && (
                  <div className="space-y-5">
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-sans text-base font-bold text-slate-900">
                          Blog Header & Articles Manager
                        </h3>
                        <button
                          onClick={() => setShowAddBlog(!showAddBlog)}
                          className="px-4 py-1.5 bg-[#704214] text-white rounded text-xs font-semibold hover:bg-[#59330E] flex items-center gap-1.5"
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
                          className="px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Header Title"
                          value={cmsConfig.blogsHeader?.title || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            blogsHeader: { ...cmsConfig.blogsHeader, title: e.target.value }
                          })}
                          className="px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                      {renderBannerUploader(
                        "Blogs Journal Hero Banner Background Image",
                        cmsConfig.blogsHeader?.heroBg || '/images/ourbrand.png',
                        '/images/ourbrand.png',
                        (newUrl) => setCmsConfig({ ...cmsConfig, blogsHeader: { ...cmsConfig.blogsHeader, heroBg: newUrl } }),
                        "Full-width hero background for /blogs"
                      )}

                      {/* Add Blog Form Card */}
                      {showAddBlog && (
                        <div className="p-4 rounded-sm bg-[#FAF5EE] border border-slate-200 space-y-3">
                          <h4 className="font-bold text-xs text-[#704214]">Create New Blog Article</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <input
                              type="text"
                              placeholder="Article Title *"
                              value={newBlog.title}
                              onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                              className="px-3 py-2 bg-white border border-slate-200 rounded-sm"
                            />
                            <input
                              type="text"
                              placeholder="Category (e.g. Luxury Watches)"
                              value={newBlog.category}
                              onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                              className="px-3 py-2 bg-white border border-slate-200 rounded-sm"
                            />
                            <input
                              type="text"
                              placeholder="Author Name"
                              value={newBlog.author}
                              onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                              className="px-3 py-2 bg-white border border-slate-200 rounded-sm"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Featured Image URL"
                            value={newBlog.image}
                            onChange={(e) => setNewBlog({ ...newBlog, image: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-sm text-xs"
                          />
                          <textarea
                            rows="2"
                            placeholder="Summary (short excerpt)"
                            value={newBlog.summary}
                            onChange={(e) => setNewBlog({ ...newBlog, summary: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-sm text-xs"
                          />
                          <textarea
                            rows="3"
                            placeholder="Full Article Content"
                            value={newBlog.content}
                            onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-sm text-xs"
                          />
                          <button
                            onClick={handleAddBlog}
                            className="px-5 py-2 bg-[#704214] text-white rounded text-xs font-bold hover:bg-[#59330E]"
                          >
                            Publish Article to Draft
                          </button>
                        </div>
                      )}

                      {/* Existing Articles List */}
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-slate-700">Current Published Articles ({(cmsConfig.blogs || []).length}):</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(cmsConfig.blogs || []).map((art) => (
                            <div key={art.id} className="p-3 rounded-sm bg-white border border-slate-200 shadow-sm flex items-start justify-between gap-3">
                              <img src={art.image} alt={art.title} className="w-16 h-16 rounded-sm object-cover shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-[#704214] uppercase">{art.category}</span>
                                <h4 className="font-sans font-bold text-xs text-slate-900 truncate">{art.title}</h4>
                                <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{art.summary}</p>
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
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-sans text-base font-bold text-slate-900">
                          Frequently Asked Questions (FAQ) Manager
                        </h3>
                        <button
                          onClick={() => setShowAddFaq(!showAddFaq)}
                          className="px-4 py-1.5 bg-[#704214] text-white rounded text-xs font-semibold hover:bg-[#59330E] flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{showAddFaq ? 'Cancel' : 'Add New FAQ Item'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Header Title</label>
                          <input
                            type="text"
                            placeholder="Frequently Asked Questions"
                            value={cmsConfig.faqHeader?.title || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              faqHeader: { ...cmsConfig.faqHeader, title: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Header Subtitle</label>
                          <input
                            type="text"
                            placeholder="Find quick answers to your questions"
                            value={cmsConfig.faqHeader?.subtitle || ''}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              faqHeader: { ...cmsConfig.faqHeader, subtitle: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          {renderBannerUploader(
                            "FAQ Concierge Hero Banner Background Image",
                            cmsConfig.faqHeader?.heroBg || '/images/faqherobaner.png',
                            '/images/faqherobaner.png',
                            (newUrl) => setCmsConfig({ ...cmsConfig, faqHeader: { ...cmsConfig.faqHeader, heroBg: newUrl } }),
                            "Full-width hero background for /faq (e.g. /images/faqherobaner.png)"
                          )}
                        </div>
                      </div>

                      {/* Add FAQ Form Card */}
                      {showAddFaq && (
                        <div className="p-4 rounded-sm bg-[#FAF5EE] border border-slate-200 space-y-3 text-xs">
                          <h4 className="font-bold text-[#704214]">Create New FAQ</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <select
                              value={newFaq.category}
                              onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                              className="px-3 py-2 bg-white border border-slate-200 rounded-sm"
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
                              className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-sm"
                            />
                          </div>
                          <textarea
                            rows="3"
                            placeholder="Detailed Answer *"
                            value={newFaq.answer}
                            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-sm"
                          />
                          <button
                            onClick={handleAddFaq}
                            className="px-5 py-2 bg-[#704214] text-white rounded font-bold hover:bg-[#59330E]"
                          >
                            Add FAQ to Draft
                          </button>
                        </div>
                      )}

                      {/* Existing FAQs List */}
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-slate-700">Current FAQs ({(cmsConfig.faqs || []).length}):</span>
                        <div className="space-y-2">
                          {(cmsConfig.faqs || []).map((faq) => (
                            <div key={faq.id} className="p-3.5 rounded-sm bg-white border border-slate-200 shadow-sm flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF5EE] text-[#704214]">
                                  {faq.category}
                                </span>
                                <h4 className="font-sans font-bold text-xs text-slate-900">{faq.question}</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed">{faq.answer}</p>
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
                  <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-sans text-base font-bold text-slate-900">
                      Concierge & Contact Us Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Header Title</label>
                        <input
                          type="text"
                          value={cmsConfig.contactUs?.title || 'Contact Us'}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            contactUs: { ...cmsConfig.contactUs, title: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Header Subtitle</label>
                        <input
                          type="text"
                          value={cmsConfig.contactUs?.subtitle || "We'd Love to Hear from You"}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            contactUs: { ...cmsConfig.contactUs, subtitle: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        {renderBannerUploader(
                          "Contact Us Hero Banner Background Image",
                          cmsConfig.contactUs?.heroBg || '/images/contactus_herobanner.png',
                          '/images/contactus_herobanner.png',
                          (newUrl) => setCmsConfig({ ...cmsConfig, contactUs: { ...cmsConfig.contactUs, heroBg: newUrl } }),
                          "Full-width hero background for /contact (e.g. /images/contactus_herobanner.png)"
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Telephone Concierge</label>
                        <input
                          type="text"
                          value={cmsConfig.contactUs?.phone || '+1 (555) 123 - 4567'}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            contactUs: { ...cmsConfig.contactUs, phone: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Client Support Email</label>
                        <input
                          type="email"
                          value={cmsConfig.contactUs?.email || 'support@annshaglobal.com'}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            contactUs: { ...cmsConfig.contactUs, email: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Flagship Global Office</label>
                        <input
                          type="text"
                          value={cmsConfig.contactUs?.address || '123 Fashion Street, New York, NY 10001'}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            contactUs: { ...cmsConfig.contactUs, address: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Weekday Operating Hours</label>
                        <input
                          type="text"
                          value={cmsConfig.contactUs?.hoursWeekday || 'Mon - Sat: 9:00 AM - 8:00 PM'}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            contactUs: { ...cmsConfig.contactUs, hoursWeekday: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Weekend Operating Hours</label>
                        <input
                          type="text"
                          value={cmsConfig.contactUs?.hoursWeekend || 'Sun: 10:00 AM - 6:00 PM'}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            contactUs: { ...cmsConfig.contactUs, hoursWeekend: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. FOOTER & GLOBAL TAB */}
                {editorTab === 'footer' && (
                  <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-sans text-base font-bold text-slate-900">
                      Footer & Global Store Configuration
                    </h3>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Footer About Description</label>
                      <textarea
                        rows="2"
                        value={cmsConfig.footer?.aboutText || ''}
                        onChange={(e) => setCmsConfig({
                          ...cmsConfig,
                          footer: { ...cmsConfig.footer, aboutText: e.target.value }
                        })}
                        className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Copyright Line</label>
                        <input
                          type="text"
                          value={cmsConfig.footer?.copyrightText || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            footer: { ...cmsConfig.footer, copyrightText: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Google Play Link</label>
                        <input
                          type="text"
                          value={cmsConfig.footer?.playStoreLink || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            footer: { ...cmsConfig.footer, playStoreLink: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Apple App Store Link</label>
                        <input
                          type="text"
                          value={cmsConfig.footer?.appStoreLink || ''}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            footer: { ...cmsConfig.footer, appStoreLink: e.target.value }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. PRODUCT DETAIL PAGE (PDP) & CONVERSION SETTINGS (Task 1) */}
                {editorTab === 'pdp' && (
                  <div className="space-y-6">
                    {/* Urgency & Rating Row */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <h3 className="font-sans text-base font-bold text-slate-900">
                        ⚡ Urgency Indicators &amp; Social Proof
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Live Viewers Count</label>
                          <input
                            type="number"
                            value={cmsConfig.pdpSettings?.urgency?.viewingCount ?? 65}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              pdpSettings: {
                                ...cmsConfig.pdpSettings,
                                urgency: {
                                  ...(cmsConfig.pdpSettings?.urgency || {}),
                                  viewingCount: Number(e.target.value)
                                }
                              }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Sale Timer (Hours)</label>
                          <input
                            type="number"
                            value={cmsConfig.pdpSettings?.urgency?.saleEndsHours ?? 12}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              pdpSettings: {
                                ...cmsConfig.pdpSettings,
                                urgency: {
                                  ...(cmsConfig.pdpSettings?.urgency || {}),
                                  saleEndsHours: Number(e.target.value)
                                }
                              }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Sale Timer (Minutes)</label>
                          <input
                            type="number"
                            value={cmsConfig.pdpSettings?.urgency?.saleEndsMinutes ?? 42}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              pdpSettings: {
                                ...cmsConfig.pdpSettings,
                                urgency: {
                                  ...(cmsConfig.pdpSettings?.urgency || {}),
                                  saleEndsMinutes: Number(e.target.value)
                                }
                              }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>

                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                            <input
                              type="checkbox"
                              checked={cmsConfig.pdpSettings?.urgency?.bestsellerBadge !== false}
                              onChange={(e) => setCmsConfig({
                                ...cmsConfig,
                                pdpSettings: {
                                  ...cmsConfig.pdpSettings,
                                  urgency: {
                                    ...(cmsConfig.pdpSettings?.urgency || {}),
                                    bestsellerBadge: e.target.checked
                                  }
                                }
                              })}
                              className="w-4 h-4 text-[#704214] rounded"
                            />
                            <span>Show "Bestseller" Tag</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Rating Social Proof Text</label>
                        <input
                          type="text"
                          value={cmsConfig.pdpSettings?.urgency?.ratingText || '4.87/5 Rated by 119 Verified Customers'}
                          onChange={(e) => setCmsConfig({
                            ...cmsConfig,
                            pdpSettings: {
                              ...cmsConfig.pdpSettings,
                              urgency: {
                                ...(cmsConfig.pdpSettings?.urgency || {}),
                                ratingText: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                        />
                      </div>
                    </div>

                    {/* Welcome Offer Banner */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <h3 className="font-sans text-base font-bold text-slate-900">
                        🎁 Welcome Offer Strip
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Badge Text</label>
                          <input
                            type="text"
                            value={cmsConfig.pdpSettings?.welcomeOffer?.badgeText || 'WELCOME OFFER'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              pdpSettings: {
                                ...cmsConfig.pdpSettings,
                                welcomeOffer: {
                                  ...(cmsConfig.pdpSettings?.welcomeOffer || {}),
                                  badgeText: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Offer Description Text</label>
                          <input
                            type="text"
                            value={cmsConfig.pdpSettings?.welcomeOffer?.offerText || 'Flat ₹100 OFF on 1st prepaid order'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              pdpSettings: {
                                ...cmsConfig.pdpSettings,
                                welcomeOffer: {
                                  ...(cmsConfig.pdpSettings?.welcomeOffer || {}),
                                  offerText: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Interactive Coupons Manager */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div>
                          <h3 className="font-sans text-base font-bold text-slate-900">
                            🎟️ "Tap to Copy" Coupons Manager
                          </h3>
                          <p className="text-xs text-slate-500">
                            Manage voucher coupons shown to customers on Product Detail Pages and applicable at Checkout.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const current = cmsConfig.pdpSettings?.coupons || [
                              { code: 'DIWALI200', title: 'Flat ₹200 OFF', subtitle: 'On Orders Above ₹1499', discount: 200, discountType: 'fixed' },
                              { code: 'SAVE100', title: 'Flat ₹100 OFF', subtitle: 'On Orders Above ₹999', discount: 100, discountType: 'fixed' }
                            ];
                            setCmsConfig({
                              ...cmsConfig,
                              pdpSettings: {
                                ...cmsConfig.pdpSettings,
                                coupons: [
                                  ...current,
                                  { code: `NEW${Math.floor(10 + Math.random() * 90)}`, title: 'Special Discount', subtitle: 'On All Orders', discount: 50, discountType: 'fixed' }
                                ]
                              }
                            });
                          }}
                          className="px-3 py-1.5 bg-[#704214] text-white rounded text-xs font-semibold hover:bg-[#59330E] flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Coupon</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(cmsConfig.pdpSettings?.coupons || [
                          { code: 'DIWALI200', title: 'Flat ₹200 OFF', subtitle: 'On Orders Above ₹1499', discount: 200 },
                          { code: 'SAVE100', title: 'Flat ₹100 OFF', subtitle: 'On Orders Above ₹999', discount: 100 },
                          { code: 'WELCOME10', title: '10% OFF', subtitle: 'On All First Orders', discount: 10 }
                        ]).map((cp, idx) => (
                          <div key={idx} className="p-3.5 rounded-lg bg-[#FAF5EE] border border-slate-200 space-y-2 relative">
                            <button
                              type="button"
                              onClick={() => {
                                const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                current.splice(idx, 1);
                                setCmsConfig({
                                  ...cmsConfig,
                                  pdpSettings: { ...cmsConfig.pdpSettings, coupons: current }
                                });
                              }}
                              className="absolute top-2 right-2 text-[#b32d2e] hover:bg-white p-1 rounded"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block">Coupon Code</label>
                              <input
                                type="text"
                                value={cp.code}
                                onChange={(e) => {
                                  const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                  current[idx] = { ...current[idx], code: e.target.value.toUpperCase() };
                                  setCmsConfig({
                                    ...cmsConfig,
                                    pdpSettings: { ...cmsConfig.pdpSettings, coupons: current }
                                  });
                                }}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono font-bold"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block">Title Tag</label>
                              <input
                                type="text"
                                value={cp.title}
                                onChange={(e) => {
                                  const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                  current[idx] = { ...current[idx], title: e.target.value };
                                  setCmsConfig({
                                    ...cmsConfig,
                                    pdpSettings: { ...cmsConfig.pdpSettings, coupons: current }
                                  });
                                }}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block">Discount Amount (₹)</label>
                              <input
                                type="number"
                                value={cp.discount || 50}
                                onChange={(e) => {
                                  const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                  current[idx] = { ...current[idx], discount: Number(e.target.value) };
                                  setCmsConfig({
                                    ...cmsConfig,
                                    pdpSettings: { ...cmsConfig.pdpSettings, coupons: current }
                                  });
                                }}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Location Pincode Delivery Estimator Settings */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <h3 className="font-sans text-base font-bold text-slate-900">
                        📍 Pincode Delivery Estimator Box
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Header Title</label>
                          <input
                            type="text"
                            value={cmsConfig.pdpSettings?.deliveryEstimator?.title || 'Get estimated delivery date'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              pdpSettings: {
                                ...cmsConfig.pdpSettings,
                                deliveryEstimator: {
                                  ...(cmsConfig.pdpSettings?.deliveryEstimator || {}),
                                  title: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Subtitle</label>
                          <input
                            type="text"
                            value={cmsConfig.pdpSettings?.deliveryEstimator?.subtitle || 'Prepaid orders are delivered on priority'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              pdpSettings: {
                                ...cmsConfig.pdpSettings,
                                deliveryEstimator: {
                                  ...(cmsConfig.pdpSettings?.deliveryEstimator || {}),
                                  subtitle: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Perk 1 Text</label>
                          <input
                            type="text"
                            value={cmsConfig.pdpSettings?.deliveryEstimator?.perk1 || '10% Off Every Prepaid Order'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              pdpSettings: {
                                ...cmsConfig.pdpSettings,
                                deliveryEstimator: {
                                  ...(cmsConfig.pdpSettings?.deliveryEstimator || {}),
                                  perk1: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Perk 2 Text</label>
                          <input
                            type="text"
                            value={cmsConfig.pdpSettings?.deliveryEstimator?.perk2 || 'FREE Shipping on all orders'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              pdpSettings: {
                                ...cmsConfig.pdpSettings,
                                deliveryEstimator: {
                                  ...(cmsConfig.pdpSettings?.deliveryEstimator || {}),
                                  perk2: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4 Value / Trust Containers */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <h3 className="font-sans text-base font-bold text-slate-900">
                        🛡️ 4 Trust / Value Containers Grid
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(cmsConfig.pdpSettings?.trustBoxes || [
                          { title: '100% Cashback', subtitle: 'up to ₹500 via UPI' },
                          { title: '6-Month', subtitle: 'Free replacement' },
                          { title: 'Lab Certified', subtitle: '100% authentic' },
                          { title: 'Free Shipping', subtitle: 'on orders ₹499+' }
                        ]).map((box, idx) => (
                          <div key={idx} className="p-3.5 rounded-lg bg-[#FAF5EE] border border-slate-200 space-y-2">
                            <span className="text-[10px] font-bold text-[#704214] uppercase">Container {idx + 1}</span>
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Title</label>
                              <input
                                type="text"
                                value={box.title}
                                onChange={(e) => {
                                  const current = [...(cmsConfig.pdpSettings?.trustBoxes || [])];
                                  current[idx] = { ...current[idx], title: e.target.value };
                                  setCmsConfig({
                                    ...cmsConfig,
                                    pdpSettings: { ...cmsConfig.pdpSettings, trustBoxes: current }
                                  });
                                }}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-slate-700 block mb-1">Subtitle</label>
                              <input
                                type="text"
                                value={box.subtitle}
                                onChange={(e) => {
                                  const current = [...(cmsConfig.pdpSettings?.trustBoxes || [])];
                                  current[idx] = { ...current[idx], subtitle: e.target.value };
                                  setCmsConfig({
                                    ...cmsConfig,
                                    pdpSettings: { ...cmsConfig.pdpSettings, trustBoxes: current }
                                  });
                                }}
                                className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* COUPONS & VOUCHERS DEDICATED VIEW (Task 1 - Image 8 & 9)   */}
            {/* ======================================================== */}
            {currentView === 'coupons' && (
              <div className="space-y-6">
                {/* Header with Title and Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                  <div>
                    <h1 className="font-sans text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Tag className="w-6 h-6 text-[#704214]" />
                      <span>Coupons &amp; Promotional Vouchers</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure high-converting ticket discount vouchers shown on the storefront Product Detail Page and applied at checkout.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const current = cmsConfig?.pdpSettings?.coupons || [
                          { code: 'NEW100', badge: 'WELCOME', offerText: 'Offer 🎁', title: 'Flat ₹100 OFF', subtitle: 'For New Customers Only', discount: 100, minOrder: 0 },
                          { code: 'DIWALI200', badge: 'DIWALI', offerText: 'Offer 💥', title: 'Flat 200Rs OFF', subtitle: 'For All Prepaid Orders', discount: 200, minOrder: 999 },
                          { code: 'SAVE100', badge: 'SPECIAL', offerText: 'Offer ⚡', title: 'Flat ₹100 OFF', subtitle: 'On Orders Above ₹999', discount: 100, minOrder: 999 }
                        ];
                        const randomNum = Math.floor(10 + Math.random() * 90);
                        const updated = [
                          ...current,
                          {
                            code: `OFFER${randomNum}`,
                            badge: 'SPECIAL',
                            offerText: 'Offer 🔥',
                            title: `Flat ₹${randomNum * 2} OFF`,
                            subtitle: 'Limited Period Deal',
                            discount: randomNum * 2,
                            minOrder: 499
                          }
                        ];
                        setCmsConfig({
                          ...(cmsConfig || {}),
                          pdpSettings: {
                            ...(cmsConfig?.pdpSettings || {}),
                            coupons: updated
                          }
                        });
                        showNotification('New coupon voucher added to draft!');
                      }}
                      className="px-3.5 py-2 bg-[#704214] hover:bg-[#59330E] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Coupon</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveCoupons}
                      disabled={loading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{loading ? 'Publishing...' : 'Save & Publish Coupons'}</span>
                    </button>
                  </div>
                </div>

                {!cmsConfig ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#704214] mb-2" />
                    <p className="text-xs font-semibold">Loading Coupons Configuration...</p>
                  </div>
                ) : (
                  <>
                    {/* Coupons Header with List / Grid View Switcher (Task 6) */}
                    <div className="p-4 sm:p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0f0f1] pb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-sans text-base font-bold text-slate-900 flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-[#704214]" />
                            <span>Active Storefront Coupons ({(cmsConfig.pdpSettings?.coupons || []).length})</span>
                          </h3>
                        </div>

                        {/* View Switcher: List View vs Grid View */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-500">View:</span>
                          <div className="inline-flex rounded border border-slate-200 p-0.5 bg-slate-100">
                            <button
                              type="button"
                              onClick={() => { setCouponViewMode('list'); setEditingCouponIdx(null); }}
                              className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
                                couponViewMode === 'list' 
                                  ? 'bg-white text-[#704214] shadow-xs' 
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              <List className="w-3.5 h-3.5" />
                              <span>List View</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCouponViewMode('grid')}
                              className={`px-3 py-1 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${
                                couponViewMode === 'grid' 
                                  ? 'bg-white text-[#704214] shadow-xs' 
                                  : 'text-slate-500 hover:text-slate-900'
                              }`}
                            >
                              <Grid className="w-3.5 h-3.5" />
                              <span>Grid View</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* LIST VIEW (Table with Edit Icon & Delete) */}
                      {couponViewMode === 'list' && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border border-slate-200">
                            <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                              <tr>
                                <th className="p-3">#</th>
                                <th className="p-3">Code</th>
                                <th className="p-3">Badge / Pill</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Discount</th>
                                <th className="p-3">Min Order</th>
                                <th className="p-3">Date Range</th>
                                <th className="p-3">1st Order</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#f0f0f1] bg-white">
                              {(cmsConfig.pdpSettings?.coupons || []).map((cp, idx) => (
                                <tr key={idx} className={`hover:bg-slate-50 transition-colors ${editingCouponIdx === idx ? 'bg-[#f0f6fc]' : ''}`}>
                                  <td className="p-3 font-semibold text-slate-500">{idx + 1}</td>
                                  <td className="p-3 font-mono font-bold text-[#704214]">{cp.code || 'NO_CODE'}</td>
                                  <td className="p-3">
                                    <span className="inline-flex items-center gap-1">
                                      <span className="px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1E3A8A] font-bold text-[10px]">
                                        {cp.badge || 'SPECIAL'}
                                      </span>
                                      <span className="px-2 py-0.5 rounded bg-[#EA580C] text-white font-bold text-[10px]">
                                        {cp.offerText || 'Offer 🔥'}
                                      </span>
                                    </span>
                                  </td>
                                  <td className="p-3 font-semibold text-slate-900">{cp.title || 'Flat Discount'}</td>
                                  <td className="p-3 font-bold text-emerald-700">₹{cp.discount || 0}</td>
                                  <td className="p-3 font-semibold text-slate-500">₹{cp.minPurchaseAmount || cp.minOrder || 0}</td>
                                  <td className="p-3 text-[11px] text-slate-500">
                                    {cp.startDate ? String(cp.startDate).slice(0, 10) : 'Always'} → {cp.endDate ? String(cp.endDate).slice(0, 10) : 'No Expire'}
                                  </td>
                                  <td className="p-3">
                                    {cp.firstOrderOnly ? (
                                      <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#92400E] rounded text-[10px] font-bold">1st Order</span>
                                    ) : (
                                      <span className="text-slate-500 text-[10px]">All Users</span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    {cp.isActive !== false ? (
                                      <span className="px-2 py-0.5 bg-[#E7F6EA] text-emerald-700 rounded text-[10px] font-bold">Active</span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-[#FDF0EE] text-[#b32d2e] rounded text-[10px] font-bold">Disabled</span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Edit Icon (Pencil) */}
                                      <button
                                        type="button"
                                        onClick={() => setEditingCouponIdx(editingCouponIdx === idx ? null : idx)}
                                        className="p-1.5 rounded hover:bg-[#e2e4e7] text-[#704214] transition-colors"
                                        title="Edit this coupon"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      {/* Delete Icon */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                          current.splice(idx, 1);
                                          setCmsConfig({
                                            ...cmsConfig,
                                            pdpSettings: { ...(cmsConfig.pdpSettings || {}), coupons: current }
                                          });
                                          showNotification('Coupon removed from draft.');
                                        }}
                                        className="p-1.5 rounded hover:bg-[#FDF0EE] text-[#b32d2e] transition-colors"
                                        title="Delete this coupon"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Quick Inline Editor when Edit icon is clicked in List View */}
                          {editingCouponIdx !== null && cmsConfig.pdpSettings?.coupons?.[editingCouponIdx] && (
                            <div className="mt-4 p-4 rounded-lg bg-[#FAF5EE] border-2 border-[#704214] shadow-sm space-y-3">
                              <div className="flex items-center justify-between border-b border-[#EADBCC] pb-2">
                                <h4 className="font-bold text-xs text-[#704214] flex items-center gap-1.5">
                                  <Edit className="w-4 h-4" />
                                  <span>Editing Coupon #{editingCouponIdx + 1}: {cmsConfig.pdpSettings?.coupons[editingCouponIdx]?.code}</span>
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => setEditingCouponIdx(null)}
                                  className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                                >
                                  ✕ Close Edit Mode
                                </button>
                              </div>

                              {/* Form fields for the active coupon */}
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <label className="font-bold text-slate-500 block mb-1">Coupon Code</label>
                                  <input
                                    type="text"
                                    value={cmsConfig.pdpSettings.coupons[editingCouponIdx].code || ''}
                                    onChange={(e) => {
                                      const current = [...cmsConfig.pdpSettings.coupons];
                                      current[editingCouponIdx] = { ...current[editingCouponIdx], code: e.target.value.toUpperCase().replace(/\s+/g, '') };
                                      setCmsConfig({ ...cmsConfig, pdpSettings: { ...cmsConfig.pdpSettings, coupons: current } });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-mono font-bold"
                                  />
                                </div>

                                <div>
                                  <label className="font-bold text-slate-500 block mb-1">Badge Text</label>
                                  <input
                                    type="text"
                                    value={cmsConfig.pdpSettings.coupons[editingCouponIdx].badge || ''}
                                    onChange={(e) => {
                                      const current = [...cmsConfig.pdpSettings.coupons];
                                      current[editingCouponIdx] = { ...current[editingCouponIdx], badge: e.target.value.toUpperCase() };
                                      setCmsConfig({ ...cmsConfig, pdpSettings: { ...cmsConfig.pdpSettings, coupons: current } });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                                  />
                                </div>

                                <div>
                                  <label className="font-bold text-slate-500 block mb-1">Offer Pill Text</label>
                                  <input
                                    type="text"
                                    value={cmsConfig.pdpSettings.coupons[editingCouponIdx].offerText || ''}
                                    onChange={(e) => {
                                      const current = [...cmsConfig.pdpSettings.coupons];
                                      current[editingCouponIdx] = { ...current[editingCouponIdx], offerText: e.target.value };
                                      setCmsConfig({ ...cmsConfig, pdpSettings: { ...cmsConfig.pdpSettings, coupons: current } });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                                  />
                                </div>

                                <div>
                                  <label className="font-bold text-slate-500 block mb-1">Discount (₹)</label>
                                  <input
                                    type="number"
                                    value={cmsConfig.pdpSettings.coupons[editingCouponIdx].discount ?? 100}
                                    onChange={(e) => {
                                      const current = [...cmsConfig.pdpSettings.coupons];
                                      current[editingCouponIdx] = { ...current[editingCouponIdx], discount: Number(e.target.value) };
                                      setCmsConfig({ ...cmsConfig, pdpSettings: { ...cmsConfig.pdpSettings, coupons: current } });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-bold text-emerald-700"
                                  />
                                </div>

                                <div>
                                  <label className="font-bold text-slate-500 block mb-1">Coupon Title</label>
                                  <input
                                    type="text"
                                    value={cmsConfig.pdpSettings.coupons[editingCouponIdx].title || ''}
                                    onChange={(e) => {
                                      const current = [...cmsConfig.pdpSettings.coupons];
                                      current[editingCouponIdx] = { ...current[editingCouponIdx], title: e.target.value };
                                      setCmsConfig({ ...cmsConfig, pdpSettings: { ...cmsConfig.pdpSettings, coupons: current } });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-bold"
                                  />
                                </div>

                                <div>
                                  <label className="font-bold text-slate-500 block mb-1">Min Order (₹)</label>
                                  <input
                                    type="number"
                                    value={cmsConfig.pdpSettings.coupons[editingCouponIdx].minPurchaseAmount ?? 0}
                                    onChange={(e) => {
                                      const current = [...cmsConfig.pdpSettings.coupons];
                                      current[editingCouponIdx] = { ...current[editingCouponIdx], minPurchaseAmount: Number(e.target.value) };
                                      setCmsConfig({ ...cmsConfig, pdpSettings: { ...cmsConfig.pdpSettings, coupons: current } });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-bold"
                                  />
                                </div>

                                <div>
                                  <label className="font-bold text-slate-500 block mb-1">Start Date</label>
                                  <input
                                    type="date"
                                    value={cmsConfig.pdpSettings.coupons[editingCouponIdx].startDate ? String(cmsConfig.pdpSettings.coupons[editingCouponIdx].startDate).slice(0, 10) : ''}
                                    onChange={(e) => {
                                      const current = [...cmsConfig.pdpSettings.coupons];
                                      current[editingCouponIdx] = { ...current[editingCouponIdx], startDate: e.target.value };
                                      setCmsConfig({ ...cmsConfig, pdpSettings: { ...cmsConfig.pdpSettings, coupons: current } });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded"
                                  />
                                </div>

                                <div>
                                  <label className="font-bold text-slate-500 block mb-1">End Date (Auto-Hide)</label>
                                  <input
                                    type="date"
                                    value={cmsConfig.pdpSettings.coupons[editingCouponIdx].endDate ? String(cmsConfig.pdpSettings.coupons[editingCouponIdx].endDate).slice(0, 10) : ''}
                                    onChange={(e) => {
                                      const current = [...cmsConfig.pdpSettings.coupons];
                                      current[editingCouponIdx] = { ...current[editingCouponIdx], endDate: e.target.value };
                                      setCmsConfig({ ...cmsConfig, pdpSettings: { ...cmsConfig.pdpSettings, coupons: current } });
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-[#b32d2e]"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center gap-4 pt-1">
                                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-xs text-slate-900">
                                  <input
                                    type="checkbox"
                                    checked={!!cmsConfig.pdpSettings.coupons[editingCouponIdx].firstOrderOnly}
                                    onChange={(e) => {
                                      const current = [...cmsConfig.pdpSettings.coupons];
                                      current[editingCouponIdx] = { ...current[editingCouponIdx], firstOrderOnly: e.target.checked };
                                      setCmsConfig({ ...cmsConfig, pdpSettings: { ...cmsConfig.pdpSettings, coupons: current } });
                                    }}
                                    className="rounded text-[#704214]"
                                  />
                                  <span>1st Order Only</span>
                                </label>

                                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-xs text-slate-900">
                                  <input
                                    type="checkbox"
                                    checked={cmsConfig.pdpSettings.coupons[editingCouponIdx].isActive !== false}
                                    onChange={(e) => {
                                      const current = [...cmsConfig.pdpSettings.coupons];
                                      current[editingCouponIdx] = { ...current[editingCouponIdx], isActive: e.target.checked };
                                      setCmsConfig({ ...cmsConfig, pdpSettings: { ...cmsConfig.pdpSettings, coupons: current } });
                                    }}
                                    className="rounded text-emerald-700"
                                  />
                                  <span>Active / Enabled</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* GRID VIEW (Interactive Card Editors) */}
                      {couponViewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(cmsConfig.pdpSettings?.coupons || [
                          { code: 'NEW100', badge: 'WELCOME', offerText: 'Offer 🎁', title: 'Flat ₹100 OFF', subtitle: 'For New Customers Only', discount: 100, minOrder: 0 },
                          { code: 'DIWALI200', badge: 'DIWALI', offerText: 'Offer 💥', title: 'Flat 200Rs OFF', subtitle: 'For All Prepaid Orders', discount: 200, minOrder: 999 },
                          { code: 'SAVE100', badge: 'SPECIAL', offerText: 'Offer ⚡', title: 'Flat ₹100 OFF', subtitle: 'On Orders Above ₹999', discount: 100, minOrder: 999 }
                        ]).map((cp, idx) => (
                          <div key={idx} className="p-4 rounded-lg bg-[#FAF5EE] border border-slate-200 space-y-3 relative group shadow-2xs">
                            {/* Card Header & Delete Button */}
                            <div className="flex items-center justify-between border-b border-[#EADBCC] pb-2">
                              <span className="text-[11px] font-bold text-[#704214] uppercase">
                                Coupon #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                  current.splice(idx, 1);
                                  setCmsConfig({
                                    ...cmsConfig,
                                    pdpSettings: { ...(cmsConfig.pdpSettings || {}), coupons: current }
                                  });
                                  showNotification('Coupon removed from draft.');
                                }}
                                className="text-[#b32d2e] hover:bg-white p-1 rounded transition-colors"
                                title="Delete this coupon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Row 1: Code & Badge */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Coupon Code</label>
                                <input
                                  type="text"
                                  value={cp.code || ''}
                                  placeholder="e.g. NEW100"
                                  onChange={(e) => {
                                    const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                    current[idx] = { ...current[idx], code: e.target.value.toUpperCase().replace(/\s+/g, '') };
                                    setCmsConfig({
                                      ...cmsConfig,
                                      pdpSettings: { ...(cmsConfig.pdpSettings || {}), coupons: current }
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-slate-900"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Badge Text</label>
                                <input
                                  type="text"
                                  value={cp.badge || ''}
                                  placeholder="e.g. WELCOME"
                                  onChange={(e) => {
                                    const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                    current[idx] = { ...current[idx], badge: e.target.value.toUpperCase() };
                                    setCmsConfig({
                                      ...cmsConfig,
                                      pdpSettings: { ...(cmsConfig.pdpSettings || {}), coupons: current }
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-900"
                                />
                              </div>
                            </div>

                            {/* Row 2: Offer Text & Discount */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Offer Pill Text</label>
                                <input
                                  type="text"
                                  value={cp.offerText || ''}
                                  placeholder="e.g. Offer 🎁"
                                  onChange={(e) => {
                                    const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                    current[idx] = { ...current[idx], offerText: e.target.value };
                                    setCmsConfig({
                                      ...cmsConfig,
                                      pdpSettings: { ...(cmsConfig.pdpSettings || {}), coupons: current }
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Discount (₹)</label>
                                <input
                                  type="number"
                                  value={cp.discount ?? 100}
                                  placeholder="100"
                                  onChange={(e) => {
                                    const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                    current[idx] = { ...current[idx], discount: Number(e.target.value) };
                                    setCmsConfig({
                                      ...cmsConfig,
                                      pdpSettings: { ...(cmsConfig.pdpSettings || {}), coupons: current }
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-emerald-700"
                                />
                              </div>
                            </div>

                            {/* Row 3: Main Title */}
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Coupon Title</label>
                              <input
                                type="text"
                                value={cp.title || ''}
                                placeholder="e.g. Flat ₹100 OFF"
                                onChange={(e) => {
                                  const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                  current[idx] = { ...current[idx], title: e.target.value };
                                  setCmsConfig({
                                    ...cmsConfig,
                                    pdpSettings: { ...(cmsConfig.pdpSettings || {}), coupons: current }
                                  });
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-slate-900"
                              />
                            </div>

                            {/* Row 4: Subtitle */}
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Subtitle / Condition</label>
                              <input
                                type="text"
                                value={cp.subtitle || ''}
                                placeholder="e.g. For New Customers Only"
                                onChange={(e) => {
                                  const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                  current[idx] = { ...current[idx], subtitle: e.target.value };
                                  setCmsConfig({
                                    ...cmsConfig,
                                    pdpSettings: { ...(cmsConfig.pdpSettings || {}), coupons: current }
                                  });
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-[#64748B]"
                              />
                            </div>

                            {/* Row 5: Min Order, Start Date & End Date (Task 1) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-[#EADBCC]">
                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Min Order (₹)</label>
                                <input
                                  type="number"
                                  value={cp.minPurchaseAmount ?? 0}
                                  placeholder="0"
                                  onChange={(e) => {
                                    const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                    current[idx] = { ...current[idx], minPurchaseAmount: Number(e.target.value) };
                                    setCmsConfig({
                                      ...cmsConfig,
                                      pdpSettings: { ...(cmsConfig.pdpSettings || {}), coupons: current }
                                    });
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-900"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Start Date</label>
                                <input
                                  type="date"
                                  value={cp.startDate ? String(cp.startDate).slice(0, 10) : ''}
                                  onChange={(e) => {
                                    const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                    current[idx] = { ...current[idx], startDate: e.target.value };
                                    setCmsConfig({
                                      ...cmsConfig,
                                      pdpSettings: { ...(cmsConfig.pdpSettings || {}), coupons: current }
                                    });
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">End Date (Auto-Hide)</label>
                                <input
                                  type="date"
                                  value={cp.endDate ? String(cp.endDate).slice(0, 10) : ''}
                                  onChange={(e) => {
                                    const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                    current[idx] = { ...current[idx], endDate: e.target.value };
                                    setCmsConfig({
                                      ...cmsConfig,
                                      pdpSettings: { ...(cmsConfig.pdpSettings || {}), coupons: current }
                                    });
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-[#b32d2e]"
                                />
                              </div>
                            </div>

                            {/* Row 6: Toggles & Status Pill */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#EADBCC] text-xs">
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-900">
                                  <input
                                    type="checkbox"
                                    checked={!!cp.firstOrderOnly}
                                    onChange={(e) => {
                                      const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                      current[idx] = { ...current[idx], firstOrderOnly: e.target.checked };
                                      setCmsConfig({
                                        ...cmsConfig,
                                        pdpSettings: { ...(cmsConfig.pdpSettings || {}), coupons: current }
                                      });
                                    }}
                                    className="rounded text-[#704214]"
                                  />
                                  <span>1st Order Only</span>
                                </label>

                                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-900">
                                  <input
                                    type="checkbox"
                                    checked={cp.isActive !== false}
                                    onChange={(e) => {
                                      const current = [...(cmsConfig.pdpSettings?.coupons || [])];
                                      current[idx] = { ...current[idx], isActive: e.target.checked };
                                      setCmsConfig({
                                        ...cmsConfig,
                                        pdpSettings: { ...(cmsConfig.pdpSettings || {}), coupons: current }
                                      });
                                    }}
                                    className="rounded text-emerald-700"
                                  />
                                  <span>Active / Enabled</span>
                                </label>
                              </div>

                              {/* Real-Time Live Status Pill */}
                              <div>
                                {(() => {
                                  const isExpired = cp.endDate && new Date(cp.endDate) < new Date();
                                  if (isExpired) {
                                    return <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">Expired (Hidden from Store)</span>;
                                  }
                                  if (cp.isActive === false) {
                                    return <span className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">Disabled</span>;
                                  }
                                  return <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-bold">✓ Active &amp; Claimable</span>;
                                })()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                      {/* Bottom action bar */}
                      <div className="pt-4 border-t border-[#f0f0f1] flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={handleSaveCoupons}
                          disabled={loading}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{loading ? 'Publishing...' : 'Save & Publish Live Coupons'}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* DELIVERY & SHIPPING LOCATION COVERAGE VIEW (Task 2)      */}
            {/* ======================================================== */}
            {currentView === 'delivery' && (
              <div className="space-y-6">
                {/* Header with Title and Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                  <div>
                    <h1 className="font-sans text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Truck className="w-6 h-6 text-[#704214]" />
                      <span>Delivery &amp; Shipping Location Coverage</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure dynamic country, city, and postal code rules (e.g. Australia all cities covered via 4 digits, India pan-India via 6 digits) and live timelines.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const current = cmsConfig?.pdpSettings?.deliveryEstimator?.coverageRules || [
                          { country: 'Australia', code: 'AU', coverageType: 'all', pinLength: 4, citiesLabel: 'All Australian Cities (Sydney, Melbourne, Brisbane, Perth, Adelaide, Hobart)', estimatedDays: 4, isFree: true, notes: 'Australia-wide Express Priority' },
                          { country: 'India', code: 'IN', coverageType: 'all', pinLength: 6, citiesLabel: 'Pan-India (Delhi, Mumbai, Bengaluru, Chennai, All Cities)', estimatedDays: 3, isFree: true, notes: 'Priority Dispatch' },
                          { country: 'United States', code: 'US', coverageType: 'all', pinLength: 5, citiesLabel: 'All US States & Cities', estimatedDays: 5, isFree: true, notes: 'USPS Priority' }
                        ];
                        const updated = [
                          ...current,
                          {
                            country: 'United Kingdom',
                            code: 'UK',
                            coverageType: 'all',
                            pinLength: 0,
                            citiesLabel: 'London & UK Nationwide Coverage',
                            estimatedDays: 5,
                            isFree: true,
                            notes: 'Royal Mail International'
                          }
                        ];
                        setCmsConfig({
                          ...(cmsConfig || {}),
                          pdpSettings: {
                            ...(cmsConfig?.pdpSettings || {}),
                            deliveryEstimator: {
                              ...(cmsConfig?.pdpSettings?.deliveryEstimator || {}),
                              coverageRules: updated
                            }
                          }
                        });
                        showNotification('New Delivery Coverage Zone added!');
                      }}
                      className="px-3.5 py-2 bg-[#704214] hover:bg-[#59330E] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Coverage Zone</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveCoupons}
                      disabled={loading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{loading ? 'Publishing...' : 'Save & Publish Delivery Settings'}</span>
                    </button>
                  </div>
                </div>

                {!cmsConfig ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#704214] mb-2" />
                    <p className="text-xs font-semibold">Loading Delivery Settings...</p>
                  </div>
                ) : (
                  <>
                    {/* General Delivery Defaults */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <h3 className="font-sans text-base font-bold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#704214]" />
                        <span>General Delivery &amp; Shipping Rules</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Header Title on PDP</label>
                          <input
                            type="text"
                            value={cmsConfig.pdpSettings?.deliveryEstimator?.title || 'Get estimated delivery date'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              pdpSettings: {
                                ...(cmsConfig.pdpSettings || {}),
                                deliveryEstimator: {
                                  ...(cmsConfig.pdpSettings?.deliveryEstimator || {}),
                                  title: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Default Estimated Days</label>
                          <input
                            type="number"
                            value={cmsConfig.pdpSettings?.deliveryEstimator?.defaultDays ?? 3}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              pdpSettings: {
                                ...(cmsConfig.pdpSettings || {}),
                                deliveryEstimator: {
                                  ...(cmsConfig.pdpSettings?.deliveryEstimator || {}),
                                  defaultDays: Number(e.target.value)
                                }
                              }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs font-semibold"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Prepaid Priority Dispatch Note</label>
                          <input
                            type="text"
                            value={cmsConfig.pdpSettings?.deliveryEstimator?.subtitle || 'Prepaid orders are delivered on priority'}
                            onChange={(e) => setCmsConfig({
                              ...cmsConfig,
                              pdpSettings: {
                                ...(cmsConfig.pdpSettings || {}),
                                deliveryEstimator: {
                                  ...(cmsConfig.pdpSettings?.deliveryEstimator || {}),
                                  subtitle: e.target.value
                                }
                              }
                            })}
                            className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Coverage Zones Manager */}
                    <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-sans text-base font-bold text-slate-900 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-[#704214]" />
                            <span>Covered Countries &amp; Pincode Rules ({(cmsConfig.pdpSettings?.deliveryEstimator?.coverageRules || []).length})</span>
                          </h3>
                          <p className="text-xs text-slate-500">
                            When customers enter their pincode on the storefront, it matches against these dynamic rules.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(cmsConfig.pdpSettings?.deliveryEstimator?.coverageRules || [
                          { country: 'Australia', code: 'AU', coverageType: 'all', pinLength: 4, citiesLabel: 'All Australian Cities (Sydney, Melbourne, Brisbane, Perth, Adelaide, Hobart)', estimatedDays: 4, isFree: true, notes: 'Australia-wide Express Priority' },
                          { country: 'India', code: 'IN', coverageType: 'all', pinLength: 6, citiesLabel: 'Pan-India (Delhi, Mumbai, Bengaluru, Chennai, All Cities)', estimatedDays: 3, isFree: true, notes: 'Priority Dispatch' },
                          { country: 'United States', code: 'US', coverageType: 'all', pinLength: 5, citiesLabel: 'All US States & Cities', estimatedDays: 5, isFree: true, notes: 'USPS Priority' }
                        ]).map((rule, idx) => (
                          <div key={idx} className="p-4 rounded-lg bg-[#FAF5EE] border border-slate-200 space-y-3 relative">
                            <div className="flex items-center justify-between border-b border-[#EADBCC] pb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#704214] text-white flex items-center justify-center text-[10px] font-bold">
                                  {idx + 1}
                                </span>
                                <span className="font-bold text-sm text-slate-900">
                                  {rule.country} ({rule.code || 'ZONE'})
                                </span>
                                <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-bold">
                                  {rule.coverageType === 'all' ? 'All Cities Covered' : 'Specific Pincodes'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const current = [...(cmsConfig.pdpSettings?.deliveryEstimator?.coverageRules || [])];
                                  current.splice(idx, 1);
                                  setCmsConfig({
                                    ...cmsConfig,
                                    pdpSettings: {
                                      ...(cmsConfig.pdpSettings || {}),
                                      deliveryEstimator: {
                                        ...(cmsConfig.pdpSettings?.deliveryEstimator || {}),
                                        coverageRules: current
                                      }
                                    }
                                  });
                                  showNotification('Coverage rule removed from draft.');
                                }}
                                className="text-[#b32d2e] hover:bg-white p-1 rounded"
                                title="Delete Rule"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                              <div>
                                <label className="font-bold text-slate-500 block mb-1">Country Name</label>
                                <input
                                  type="text"
                                  value={rule.country}
                                  onChange={(e) => {
                                    const current = [...(cmsConfig.pdpSettings?.deliveryEstimator?.coverageRules || [])];
                                    current[idx] = { ...current[idx], country: e.target.value };
                                    setCmsConfig({
                                      ...cmsConfig,
                                      pdpSettings: {
                                        ...(cmsConfig.pdpSettings || {}),
                                        deliveryEstimator: {
                                          ...(cmsConfig.pdpSettings?.deliveryEstimator || {}),
                                          coverageRules: current
                                        }
                                      }
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-semibold"
                                />
                              </div>

                              <div>
                                <label className="font-bold text-slate-500 block mb-1">Pincode Digits Length</label>
                                <input
                                  type="number"
                                  placeholder="e.g. 4 for AU, 6 for IN"
                                  value={rule.pinLength || 4}
                                  onChange={(e) => {
                                    const current = [...(cmsConfig.pdpSettings?.deliveryEstimator?.coverageRules || [])];
                                    current[idx] = { ...current[idx], pinLength: Number(e.target.value) };
                                    setCmsConfig({
                                      ...cmsConfig,
                                      pdpSettings: {
                                        ...(cmsConfig.pdpSettings || {}),
                                        deliveryEstimator: {
                                          ...(cmsConfig.pdpSettings?.deliveryEstimator || {}),
                                          coverageRules: current
                                        }
                                      }
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-semibold"
                                />
                              </div>

                              <div>
                                <label className="font-bold text-slate-500 block mb-1">Estimated Days</label>
                                <input
                                  type="number"
                                  value={rule.estimatedDays || 3}
                                  onChange={(e) => {
                                    const current = [...(cmsConfig.pdpSettings?.deliveryEstimator?.coverageRules || [])];
                                    current[idx] = { ...current[idx], estimatedDays: Number(e.target.value) };
                                    setCmsConfig({
                                      ...cmsConfig,
                                      pdpSettings: {
                                        ...(cmsConfig.pdpSettings || {}),
                                        deliveryEstimator: {
                                          ...(cmsConfig.pdpSettings?.deliveryEstimator || {}),
                                          coverageRules: current
                                        }
                                      }
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-semibold text-emerald-700"
                                />
                              </div>

                              <div>
                                <label className="font-bold text-slate-500 block mb-1">Coverage Scope</label>
                                <select
                                  value={rule.coverageType || 'all'}
                                  onChange={(e) => {
                                    const current = [...(cmsConfig.pdpSettings?.deliveryEstimator?.coverageRules || [])];
                                    current[idx] = { ...current[idx], coverageType: e.target.value };
                                    setCmsConfig({
                                      ...cmsConfig,
                                      pdpSettings: {
                                        ...(cmsConfig.pdpSettings || {}),
                                        deliveryEstimator: {
                                          ...(cmsConfig.pdpSettings?.deliveryEstimator || {}),
                                          coverageRules: current
                                        }
                                      }
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded font-semibold"
                                >
                                  <option value="all">Cover All Cities / Nationwide</option>
                                  <option value="metro">Metro Hubs Only</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="font-bold text-[10px] text-slate-500 uppercase block mb-1">Covered Cities / Label Shown on PDP</label>
                              <input
                                type="text"
                                value={rule.citiesLabel || ''}
                                placeholder="e.g. All Australian Cities (Sydney, Melbourne, Brisbane, Perth)"
                                onChange={(e) => {
                                  const current = [...(cmsConfig.pdpSettings?.deliveryEstimator?.coverageRules || [])];
                                  current[idx] = { ...current[idx], citiesLabel: e.target.value };
                                  setCmsConfig({
                                    ...cmsConfig,
                                    pdpSettings: {
                                      ...(cmsConfig.pdpSettings || {}),
                                      deliveryEstimator: {
                                        ...(cmsConfig.pdpSettings?.deliveryEstimator || {}),
                                        coverageRules: current
                                      }
                                    }
                                  });
                                }}
                                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Bottom action bar */}
                      <div className="pt-4 border-t border-[#f0f0f1] flex items-center justify-end">
                        <button
                          type="button"
                          onClick={handleSaveCMS}
                          disabled={loading}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>{loading ? 'Publishing...' : 'Save & Publish Delivery Settings'}</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Policy Pages (Legal & Storefront Policies) - Task 3 */}
            {currentView === 'policies' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    {/* Parent Category Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
                      <span>Website Editor</span>
                      <span>›</span>
                      <span>Policy Pages</span>
                      <span>›</span>
                      <span className="font-bold text-[#704214]">
                        {(() => {
                          const tabLabels = {
                            privacy: 'Privacy Policy',
                            terms: 'Terms & Conditions',
                            refund: 'Refund & Cancellation Policy',
                            shipping: 'Shipping & Delivery Policy',
                            contact: 'Contact Us',
                            about: 'About Us'
                          };
                          return tabLabels[activePolicyTab] || 'Privacy Policy';
                        })()}
                      </span>
                    </div>

                    <h1 className="font-sans text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                      <FileText className="w-6 h-6 text-[#704214]" />
                      <span>Legal &amp; Policy Pages</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure official merchant policies, disclosures, and customer support information.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Fast Policy Switcher Selector (No cluttered horizontal tabs) */}
                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Policy:</span>
                      <select
                        value={activePolicyTab}
                        onChange={(e) => {
                          setActivePolicyTab(e.target.value);
                          handleNavigate(`/admin/policies/${e.target.value}`);
                        }}
                        className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        <option value="privacy">🔒 Privacy Policy</option>
                        <option value="terms">📄 Terms &amp; Conditions</option>
                        <option value="refund">🔄 Refund &amp; Cancellation</option>
                        <option value="shipping">🚚 Shipping &amp; Delivery</option>
                        <option value="contact">📞 Contact Us</option>
                        <option value="about">🏛️ About Us</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveCMS}
                      disabled={loading}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{loading ? 'Publishing...' : 'Save & Publish Policy Pages'}</span>
                    </button>
                  </div>
                </div>

                {!cmsConfig ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <RefreshCw className="w-8 h-8 animate-spin text-[#704214] mb-2" />
                    <p className="text-xs font-semibold">Loading Policy Pages...</p>
                  </div>
                ) : (
                  <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
                    {/* Active Policy Form */}
                    {(() => {
                      const policies = cmsConfig.policies || {};
                      const currentPolicy = policies[activePolicyTab] || {};

                      const defaultTemplates = {
                        terms: {
                          title: 'Terms & Conditions',
                          lastUpdated: 'November 24, 2026',
                          content: `Welcome to Annsha Global (annshagifts.nooryak.com). By accessing or purchasing from our platform, you agree to comply with and be bound by the following Terms & Conditions.\n\n1. Use of Website: You must be at least 18 years of age or accessing under the supervision of a parent or guardian. All products listed are subject to availability.\n\n2. Pricing & Payments: All prices are displayed in Indian Rupees (₹) and US Dollars ($). Payments are processed securely via encrypted gateways (Razorpay, Stripe, UPI, Netbanking, Credit/Debit cards). We reserve the right to correct any typographical pricing errors.\n\n3. Order Acceptance: Upon order placement, you will receive an electronic confirmation email. We reserve the right to limit order quantities or cancel orders if fraud or violation of policy is suspected.\n\n4. Intellectual Property: All trademarks, imagery, brand graphics, and logos displayed on this site are the property of Annsha Global.`
                        },
                        privacy: {
                          title: 'Privacy Policy',
                          lastUpdated: 'November 24, 2026',
                          content: `At Annsha Global, we take your privacy and data security with the utmost seriousness.\n\n1. Information Collection: We collect personal details you provide during account registration and checkout, including full name, billing/shipping address, email address, and phone number.\n\n2. Payment Security: We never store your full payment card details or banking passwords on our servers. All financial transactions are tokenized and processed through PCI-DSS Level 1 certified gateways (Razorpay and Stripe).\n\n3. Use of Information: Your data is solely used to fulfill orders, provide order tracking updates, calculate delivery timelines, and offer 24/7 client concierge support.\n\n4. Third-Party Sharing: We never sell or rent your personal information to third parties. Data is shared exclusively with verified shipping couriers to execute physical package delivery.`
                        },
                        refund: {
                          title: 'Refund & Cancellation Policy',
                          lastUpdated: 'November 24, 2026',
                          content: `We offer a transparent and hassle-free 7-Day Return and Refund Guarantee on all eligible luxury items.\n\n1. Cancellation Period: You may request order cancellation within 2 hours of placement before priority dispatch. Once shipped, the standard return policy applies.\n\n2. 7-Day Easy Returns: If you are not satisfied with your purchase, you may initiate a return within 7 calendar days of delivery. Items must be unworn, undamaged, with original tags and luxury gift packaging intact.\n\n3. Refund Processing: Upon receipt and inspection at our boutique fulfillment center, approved refunds are initiated within 48 business hours to your original payment method (Credit Card, Netbanking, UPI, or Razorpay wallet). Funds typically reflect within 3-5 banking business days.\n\n4. Defective or Damaged Products: In the unlikely event an item arrives damaged, report it within 48 hours for immediate complimentary replacement.`
                        },
                        shipping: {
                          title: 'Shipping & Delivery Policy',
                          lastUpdated: 'November 24, 2026',
                          content: `Annsha Global operates worldwide priority shipping to over 45+ countries.\n\n1. Complimentary Shipping: Free standard shipping is automatically applied on all orders above ₹499 (or $50 USD).\n\n2. Estimated Delivery Timelines:\n• Pan-India Priority Dispatch: 2 to 4 business days.\n• Australia Express: 3 to 5 business days across all cities (Sydney, Melbourne, Brisbane, Perth).\n• United States & International: 4 to 7 business days via air courier.\n\n3. Live Tracking: You will receive an SMS and email notification with your live courier tracking link as soon as your package departs our boutique.\n\n4. Insured Transit: All shipments are 100% insured against loss or damage in transit.`
                        },
                        contact: {
                          title: 'Contact Us & Client Concierge',
                          email: 'concierge@annshaglobal.com',
                          phone: '+91 (800) 892-4452',
                          address: 'Annsha Global Luxury Retailers Pvt Ltd, Suite 402, Signature Tower, Gurugram, Haryana 122001, India',
                          hours: 'Monday – Sunday: 24/7 Live Customer Concierge Support',
                          content: 'Our international client advisors are available around the clock to assist you with order inquiries, product sizing, delivery tracking, or bespoke luxury gifting recommendations.'
                        },
                        about: {
                          title: 'About Annsha Global',
                          content: 'Founded with a commitment to elevate everyday living, Annsha Global connects connoisseurs of fine design with certified luxury goods, artisanal home appointments, and timeless essentials across the world.'
                        }
                      };

                      const activeData = {
                        ...defaultTemplates[activePolicyTab],
                        ...currentPolicy
                      };

                      return (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                                Policy Title
                              </label>
                              <input
                                type="text"
                                value={activeData.title || ''}
                                onChange={(e) => {
                                  const updatedPolicies = { ...(cmsConfig.policies || {}) };
                                  updatedPolicies[activePolicyTab] = {
                                    ...(updatedPolicies[activePolicyTab] || activeData),
                                    title: e.target.value
                                  };
                                  setCmsConfig({ ...cmsConfig, policies: updatedPolicies });
                                }}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#704214]/20 focus:border-[#704214]"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                                Last Updated Date
                              </label>
                              <input
                                type="text"
                                value={activeData.lastUpdated || 'November 24, 2026'}
                                onChange={(e) => {
                                  const updatedPolicies = { ...(cmsConfig.policies || {}) };
                                  updatedPolicies[activePolicyTab] = {
                                    ...(updatedPolicies[activePolicyTab] || activeData),
                                    lastUpdated: e.target.value
                                  };
                                  setCmsConfig({ ...cmsConfig, policies: updatedPolicies });
                                }}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#704214]/20 focus:border-[#704214]"
                              />
                            </div>
                          </div>

                          {activePolicyTab === 'contact' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Support Email</label>
                                <input
                                  type="email"
                                  value={activeData.email || 'concierge@annshaglobal.com'}
                                  onChange={(e) => {
                                    const updatedPolicies = { ...(cmsConfig.policies || {}) };
                                    updatedPolicies.contact = {
                                      ...(updatedPolicies.contact || activeData),
                                      email: e.target.value
                                    };
                                    setCmsConfig({ ...cmsConfig, policies: updatedPolicies });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Support Phone</label>
                                <input
                                  type="text"
                                  value={activeData.phone || '+91 800 892 4452'}
                                  onChange={(e) => {
                                    const updatedPolicies = { ...(cmsConfig.policies || {}) };
                                    updatedPolicies.contact = {
                                      ...(updatedPolicies.contact || activeData),
                                      phone: e.target.value
                                    };
                                    setCmsConfig({ ...cmsConfig, policies: updatedPolicies });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Operating Hours</label>
                                <input
                                  type="text"
                                  value={activeData.hours || '24/7 Client Concierge'}
                                  onChange={(e) => {
                                    const updatedPolicies = { ...(cmsConfig.policies || {}) };
                                    updatedPolicies.contact = {
                                      ...(updatedPolicies.contact || activeData),
                                      hours: e.target.value
                                    };
                                    setCmsConfig({ ...cmsConfig, policies: updatedPolicies });
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
                                />
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                              Full Policy Legal Content (Markdown / Text)
                            </label>
                            <textarea
                              rows="12"
                              value={activeData.content || ''}
                              onChange={(e) => {
                                const updatedPolicies = { ...(cmsConfig.policies || {}) };
                                updatedPolicies[activePolicyTab] = {
                                  ...(updatedPolicies[activePolicyTab] || activeData),
                                  content: e.target.value
                                };
                                setCmsConfig({ ...cmsConfig, policies: updatedPolicies });
                              }}
                              className="w-full p-4 font-mono text-xs bg-slate-50/50 border border-slate-200 rounded-xl leading-relaxed text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#704214]/20 focus:border-[#704214] transition-all"
                            />
                          </div>

                          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Storefront Policy Disclosures Active &amp; Verified</span>
                            </span>
                            <button
                              type="button"
                              onClick={handleSaveCMS}
                              disabled={loading}
                              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>{loading ? 'Publishing...' : 'Save & Publish Policy Pages'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* 7. REVENUE MENU */}
            {activeMenu === 'revenue' && revenueData && (
              <div className="space-y-6">
                <h1 className="font-sans text-2xl font-bold text-slate-900">
                  Revenue & Financial Analytics
                </h1>

                {/* Revenue stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-sm bg-white border border-slate-200">
                    <span className="text-xs text-slate-500">Lifetime Revenue</span>
                    <h2 className="font-sans text-2xl font-bold text-[#704214] mt-1">
                      ${revenueData.stats?.totalRevenue?.toFixed(2) || '0.00'}
                    </h2>
                  </div>
                  <div className="p-4 rounded-sm bg-white border border-slate-200">
                    <span className="text-xs text-slate-500">Today's Revenue</span>
                    <h2 className="font-sans text-2xl font-bold text-[#2E7D32] mt-1">
                      ${revenueData.stats?.todayRevenue?.toFixed(2) || '0.00'}
                    </h2>
                  </div>
                  <div className="p-4 rounded-sm bg-white border border-slate-200">
                    <span className="text-xs text-slate-500">Yesterday's Revenue</span>
                    <h2 className="font-sans text-2xl font-bold text-slate-900 mt-1">
                      ${revenueData.stats?.yesterdayRevenue?.toFixed(2) || '0.00'}
                    </h2>
                  </div>
                  <div className="p-4 rounded-sm bg-white border border-slate-200">
                    <span className="text-xs text-slate-500">Average Order Value (AOV)</span>
                    <h2 className="font-sans text-2xl font-bold text-slate-900 mt-1">
                      ${revenueData.stats?.avgOrderValue?.toFixed(2) || '0.00'}
                    </h2>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="p-5 rounded-sm bg-white border border-slate-200">
                  <h3 className="font-sans text-base font-bold text-slate-900 mb-3">
                    Revenue Breakdown by Payment Gateway
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {revenueData.paymentBreakdown?.map((pb) => (
                      <div key={pb._id} className="p-4 rounded-sm bg-[#FAF5EE] border border-slate-200">
                        <span className="text-xs uppercase font-bold text-[#704214] block">
                          {pb._id}
                        </span>
                        <span className="text-lg font-bold text-slate-900 block mt-1">
                          ${pb.total?.toFixed(2) || 0}
                        </span>
                        <span className="text-[11px] text-slate-500">{pb.count} Orders processed</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 8. PAYMENT GATEWAY MENU (Real Stripe, Razorpay & COD - Task 3) */}
            {activeMenu === 'payments' && paymentSettings && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-sans text-2xl font-bold text-slate-900">
                      Real Payment Gateways &amp; Currency
                    </h1>
                    <p className="text-xs text-slate-500">
                      Configure real Test &amp; Live API credentials for Stripe, Razorpay, Cash on Delivery, and currency.
                    </p>
                  </div>
                  <button
                    onClick={handleSavePaymentSettings}
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#704214] hover:bg-[#59330E] text-white rounded text-xs font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-[#C59B27]" />
                    <span>{loading ? 'Saving Settings...' : 'Save Payment Settings'}</span>
                  </button>
                </div>

                {/* Store Currency Banner */}
                <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Default Store Currency</h3>
                    <p className="text-xs text-slate-500">All storefront prices and gateway charges will convert to this currency.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={paymentSettings.currency || 'INR'}
                      onChange={(e) => {
                        const cur = e.target.value;
                        const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'د.إ' };
                        setPaymentSettings({
                          ...paymentSettings,
                          currency: cur,
                          currencySymbol: symbols[cur] || '$'
                        });
                      }}
                      className="px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded text-xs font-bold text-slate-900"
                    >
                      <option value="INR">INR (₹) - Indian Rupee (Default)</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="AED">AED (د.إ) - UAE Dirham</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Stripe Payment Gateway */}
                  <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#635BFF]" />
                        <h3 className="font-bold text-sm text-slate-900">Stripe Payment Gateway</h3>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentSettings.stripe?.enabled}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            stripe: { ...paymentSettings.stripe, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-[#704214] rounded"
                        />
                        <span className="text-xs font-semibold">{paymentSettings.stripe?.enabled ? 'Active' : 'Disabled'}</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="text-slate-500">Gateway Mode:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="stripeMode"
                          checked={!paymentSettings.stripe?.isLive}
                          onChange={() => setPaymentSettings({
                            ...paymentSettings,
                            stripe: { ...paymentSettings.stripe, isLive: false }
                          })}
                        />
                        <span className="px-2 py-0.5 rounded bg-[#FAF5EE] text-[#704214] font-bold text-[11px]">Test Mode</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="stripeMode"
                          checked={paymentSettings.stripe?.isLive}
                          onChange={() => setPaymentSettings({
                            ...paymentSettings,
                            stripe: { ...paymentSettings.stripe, isLive: true }
                          })}
                        />
                        <span className="px-2 py-0.5 rounded bg-[#EBF7EE] text-[#1E7E34] font-bold text-[11px]">Live Production</span>
                      </label>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Stripe Publishable Key (pk_test_... or pk_live_...)</label>
                      <input
                        type="text"
                        value={paymentSettings.stripe?.publishableKey || ''}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          stripe: { ...paymentSettings.stripe, publishableKey: e.target.value }
                        })}
                        placeholder="pk_test_..."
                        className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Stripe Secret Key (sk_test_... or sk_live_...)</label>
                      <input
                        type="password"
                        value={paymentSettings.stripe?.secretKey || ''}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          stripe: { ...paymentSettings.stripe, secretKey: e.target.value }
                        })}
                        placeholder="sk_test_..."
                        className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded text-xs font-mono"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Stored securely on your server. Used for creating official PaymentIntents.</p>
                    </div>
                  </div>

                  {/* Razorpay Payment Gateway */}
                  <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-[#0C2340] text-white text-[10px] font-extrabold flex items-center justify-center">R</span>
                        <h3 className="font-bold text-sm text-slate-900">Razorpay (UPI / Netbanking)</h3>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentSettings.razorpay?.enabled !== false}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            razorpay: { ...(paymentSettings.razorpay || {}), enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-[#704214] rounded"
                        />
                        <span className="text-xs font-semibold">{paymentSettings.razorpay?.enabled !== false ? 'Active' : 'Disabled'}</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <span className="text-slate-500">Gateway Mode:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="razorpayMode"
                          checked={!paymentSettings.razorpay?.isLive}
                          onChange={() => setPaymentSettings({
                            ...paymentSettings,
                            razorpay: { ...(paymentSettings.razorpay || {}), isLive: false }
                          })}
                        />
                        <span className="px-2 py-0.5 rounded bg-[#FAF5EE] text-[#704214] font-bold text-[11px]">Test Mode</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="razorpayMode"
                          checked={paymentSettings.razorpay?.isLive}
                          onChange={() => setPaymentSettings({
                            ...paymentSettings,
                            razorpay: { ...(paymentSettings.razorpay || {}), isLive: true }
                          })}
                        />
                        <span className="px-2 py-0.5 rounded bg-[#EBF7EE] text-[#1E7E34] font-bold text-[11px]">Live Production</span>
                      </label>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Razorpay Key ID (rzp_test_... or rzp_live_...)</label>
                      <input
                        type="text"
                        value={paymentSettings.razorpay?.keyId || ''}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          razorpay: { ...(paymentSettings.razorpay || {}), keyId: e.target.value }
                        })}
                        placeholder="rzp_test_..."
                        className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Razorpay Key Secret</label>
                      <input
                        type="password"
                        value={paymentSettings.razorpay?.keySecret || ''}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          razorpay: { ...(paymentSettings.razorpay || {}), keySecret: e.target.value }
                        })}
                        placeholder="Enter razorpay key secret"
                        className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded text-xs font-mono"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Allows real automated order generation with official Razorpay API.</p>
                    </div>
                  </div>

                  {/* Cash on Delivery (COD) */}
                  <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-[#28583B]" />
                        <h3 className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</h3>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentSettings.cod?.enabled}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            cod: { ...paymentSettings.cod, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-[#704214] rounded"
                        />
                        <span className="text-xs font-semibold">{paymentSettings.cod?.enabled ? 'Active' : 'Disabled'}</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Extra COD Handling Fee (₹)</label>
                        <input
                          type="number"
                          value={paymentSettings.cod?.extraFee || 0}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            cod: { ...paymentSettings.cod, extraFee: Number(e.target.value) }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Max Order Limit for COD (₹)</label>
                        <input
                          type="number"
                          value={paymentSettings.cod?.maxOrderAmount || 50000}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            cod: { ...paymentSettings.cod, maxOrderAmount: Number(e.target.value) }
                          })}
                          className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PayPal (Optional) */}
                  <div className="p-5 rounded-sm bg-white border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <h3 className="font-bold text-sm text-slate-900">PayPal Express (International)</h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentSettings.paypal?.enabled}
                          onChange={(e) => setPaymentSettings({
                            ...paymentSettings,
                            paypal: { ...paymentSettings.paypal, enabled: e.target.checked }
                          })}
                          className="w-4 h-4 text-[#704214] rounded"
                        />
                        <span className="text-xs font-semibold">{paymentSettings.paypal?.enabled ? 'Active' : 'Disabled'}</span>
                      </label>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">PayPal Client ID</label>
                      <input
                        type="text"
                        value={paymentSettings.paypal?.clientId || ''}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          paypal: { ...paymentSettings.paypal, clientId: e.target.value }
                        })}
                        placeholder="sb-..."
                        className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                </div>
              </div>
            )}
          </main>
        </div>

      {/* ===== OLD PRODUCT MODAL REMOVED - Now uses dedicated /admin/product/:id pages ===== */}
      {false && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded p-6 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-sans text-lg font-bold text-slate-900">
                  {editingProduct ? 'Edit Product (Full Variants & Specs)' : 'Add New Product (Full Variants & Specs)'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Configure product details, variants, sort order, weight, dimensions, and images.
                </p>
              </div>
              <button onClick={() => setIsProductModalOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
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
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Subtitle / Short Summary</label>
                  <input
                    type="text"
                    value={productForm.subtitle}
                    onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                    placeholder="e.g. Elegant, stylish and spacious handbag for every occasion."
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
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
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
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
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm font-bold text-[#704214]"
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
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Compare Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.comparePrice}
                    onChange={(e) => setProductForm({ ...productForm, comparePrice: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Badge Filter</label>
                  <select
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
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
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Dimensions / Length x Width x Height</label>
                  <input
                    type="text"
                    value={productForm.dimensions}
                    onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                    placeholder="28 x 14 x 20 cm"
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Material</label>
                  <input
                    type="text"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    placeholder="100% Genuine Italian Leather"
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
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
                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
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
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm font-mono text-[11px]"
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
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm mb-2"
                  />
                  <label className="font-semibold block mb-1">
                    Additional Image URLs (Comma-separated)
                  </label>
                  <textarea
                    rows="2"
                    value={productForm.imagesText}
                    onChange={(e) => setProductForm({ ...productForm, imagesText: e.target.value })}
                    placeholder="/images/sliderimage2.webp, /images/sliderimage1.webp"
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm font-mono text-[11px]"
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
                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
                />
              </div>

              {/* WebP Auto-Conversion File Dropzone */}
              <div className="p-4 border-2 border-dashed border-[#704214] rounded-sm bg-[#FAF5EE] text-center space-y-1">
                <Upload className="w-6 h-6 text-[#704214] mx-auto" />
                <p className="font-bold text-slate-900">Upload Images (PNG / JPG / WebP)</p>
                <p className="text-[10px] text-slate-500">
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
                className="w-full py-3 bg-[#704214] text-white rounded font-semibold hover:bg-[#59330E] border border-[#704214] shadow-sm text-xs"
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
          <div className="bg-white rounded p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-sans text-lg font-bold text-slate-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <p className="text-[11px] text-slate-500">Set category name, slug, and sort order.</p>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)}>
                <X className="w-5 h-5 text-slate-500" />
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
                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
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
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm font-mono text-[11px]"
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
                    className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm font-bold text-[#704214]"
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
                  className="w-full px-3 py-2 bg-[#FAF5EE] border border-slate-200 rounded-sm"
                />
              </div>

              <div className="p-4 border-2 border-dashed border-[#704214] rounded-sm bg-[#FAF5EE] text-center space-y-1">
                <Upload className="w-6 h-6 text-[#704214] mx-auto" />
                <p className="font-bold text-slate-900">Category Banner (Auto WebP)</p>
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
                className="w-full py-2.5 bg-[#704214] text-white rounded font-semibold hover:bg-[#59330E] border border-[#704214] shadow-sm text-xs"
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

