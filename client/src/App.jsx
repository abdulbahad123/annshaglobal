import React, { useState, useEffect } from 'react';
import AnnouncementBar from './components/layout/AnnouncementBar';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import MobileBottomBar from './components/layout/MobileBottomBar';
import Footer from './components/layout/Footer';

// Homepage Components
import HeroBanner from './components/home/HeroBanner';
import CategoryCards from './components/home/CategoryCards';
import ProductTabs from './components/home/ProductTabs';
import PromoBanners from './components/home/PromoBanners';
import BrandSlider from './components/home/BrandSlider';
import Newsletter from './components/home/Newsletter';

// Dedicated Full Pages
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import BlogsPage from './pages/BlogsPage';
import FlashDealsPage from './pages/FlashDealsPage';
import OurCollectionPage from './pages/OurCollectionPage';
import OurBrandPage from './pages/OurBrandPage';
import FAQPage from './pages/FAQPage';
import ContactUsPage from './pages/ContactUsPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthPage from './pages/AuthPage';

// Modals
import CartDrawer from './components/cart/CartDrawer';
import CheckoutModal from './components/cart/CheckoutModal';
import AuthModal from './components/auth/AuthModal';
import AdminPortal from './components/admin/AdminPortal';

import axiosClient from './api/axiosClient';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cmsConfig, setCmsConfig] = useState(null);

  // URL path routing (/admin, /product/:id, /category/:slug, /shop, etc.)
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Modals
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  // Fetch Storefront Data
  const loadData = async () => {
    try {
      const [catsRes, prodsRes, cmsRes] = await Promise.all([
        axiosClient.get('/categories'),
        axiosClient.get('/products?limit=24'),
        axiosClient.get('/cms/config')
      ]);

      if (catsRes.success) setCategories(catsRes.categories);
      if (prodsRes.success) setProducts(prodsRes.products);
      if (cmsRes.success) setCmsConfig(cmsRes.config);
    } catch (err) {
      console.error('Storefront load error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Dedicated Product Route Resolution: /product/:slugOrId
  const isProductRoute = currentPath.startsWith('/product/');
  const productParam = isProductRoute ? currentPath.replace('/product/', '').split('/')[0] : null;

  // Dedicated Category Route Resolution: /category/:slug
  const isCategoryRoute = currentPath.startsWith('/category/');
  const categoryParam = isCategoryRoute ? currentPath.replace('/category/', '').split('/')[0] : null;

  // Active product calculation
  const activeProduct = isProductRoute 
    ? (selectedProduct || products.find(p => p.slug === productParam || String(p._id) === String(productParam)))
    : selectedProduct;

  const [productLoading, setProductLoading] = useState(false);

  // Auto-fetch product if navigating directly to /product/:id or /product/:slug
  useEffect(() => {
    if (isProductRoute && productParam) {
      const match = products.find(p => p.slug === productParam || String(p._id) === String(productParam));
      if (match) {
        setSelectedProduct(match);
      } else {
        setProductLoading(true);
        axiosClient.get(`/products/detail/${productParam}`)
          .then(res => {
            if (res.success && res.product) setSelectedProduct(res.product);
          })
          .catch(() => {
            axiosClient.get(`/products/${productParam}`)
              .then(res => {
                if (res.success && res.product) setSelectedProduct(res.product);
              })
              .catch(err => console.error('Product fetch error:', err));
          })
          .finally(() => setProductLoading(false));
      }
    }
  }, [isProductRoute, productParam, products]);

  // Category selection handler (navigates to dedicated /category/:slug or /shop)
  const handleSelectCategory = async (slug) => {
    setSelectedCategory(slug);
    setSelectedProduct(null);
    navigate(slug ? `/category/${slug}` : '/shop');

    try {
      const query = slug ? `/products?category=${slug}` : '/products?limit=24';
      const res = await axiosClient.get(query);
      if (res.success) setProducts(res.products);
    } catch (err) {
      console.error(err);
    }
  };

  // Search handler (switches to shop page with search results)
  const handleSearch = async (searchTerm) => {
    setSelectedCategory(null);
    setSelectedProduct(null);
    navigate('/shop');

    try {
      const res = await axiosClient.get(`/products?search=${encodeURIComponent(searchTerm)}`);
      if (res.success) setProducts(res.products);
    } catch (err) {
      console.error(err);
    }
  };

  // Product selection handler (navigates to dedicated /product/:slug URL - No popup modal!)
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    navigate(`/product/${product.slug || product._id}`);
  };

  // Nav menu click handler
  const handleSelectNav = (navId) => {
    setSelectedProduct(null);
    if (navId === 'home') navigate('/');
    else if (navId === 'shop') navigate('/shop');
    else if (navId === 'blogs') navigate('/blogs');
    else if (navId === 'flash_deals') navigate('/flash-deals');
    else if (navId === 'our_collection') navigate('/our-collection');
    else if (navId === 'our_brand') navigate('/our-brand');
    else if (navId === 'faq') navigate('/faq');
    else if (navId === 'contact') navigate('/contact');
    else if (navId === 'wishlist') navigate('/wishlist');
    else navigate(`/${navId}`);
  };

  // Active navigation tab determination
  let currentNavTab = 'home';
  if (currentPath === '/' || currentPath === '') currentNavTab = 'home';
  else if (currentPath === '/shop' || isCategoryRoute || isProductRoute) currentNavTab = 'shop';
  else if (currentPath === '/blogs') currentNavTab = 'blogs';
  else if (currentPath === '/flash-deals') currentNavTab = 'flash_deals';
  else if (currentPath === '/our-collection') currentNavTab = 'our_collection';
  else if (currentPath === '/our-brand') currentNavTab = 'our_brand';
  else if (currentPath === '/faq') currentNavTab = 'faq';
  else if (currentPath === '/contact') currentNavTab = 'contact';
  else if (currentPath === '/wishlist') currentNavTab = 'wishlist';

  // Dedicated Full-Screen Admin Page Route: /admin
  if (currentPath === '/admin' || currentPath.startsWith('/admin')) {
    return (
      <AdminPortal
        currentPath={currentPath}
        navigate={navigate}
        onBackToStore={() => {
          navigate('/');
          loadData();
        }}
      />
    );
  }

  // Dedicated Full Customer Auth Page Route: /login, /signup, /register (Tasks 1 & 2 - Dedicated Page, No Popup Modal!)
  if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/register') {
    return (
      <AuthPage
        mode={currentPath === '/login' ? 'login' : 'signup'}
        onNavigate={navigate}
      />
    );
  }

  const logoUrl = cmsConfig?.header?.logoUrl || '/images/logo.webp';

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7F0] text-[#2B1E16] selection:bg-[#704214] selection:text-white pb-14 lg:pb-0">
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar config={cmsConfig} />

      {/* 2. Main Header with Annsha Gifts Graphic Logo (Task 1) & Action Counters */}
      <Header
        logoUrl={logoUrl}
        headerBg={cmsConfig?.header?.backgroundImage || '/images/Soft Ivory Wave Gradient.png'}
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
        onSearch={handleSearch}
        onOpenAuthModal={(mode) => navigate(mode === 'register' || mode === 'signup' ? '/signup' : '/login')}
        onOpenAdmin={() => navigate('/admin')}
        onLogoClick={() => handleSelectNav('home')}
        onOpenWishlist={() => handleSelectNav('wishlist')}
      />

      {/* 3. Navigation Bar (All Categories Dropdown + Menu Links) */}
      <Navbar
        categories={categories}
        headerBg={cmsConfig?.header?.backgroundImage || '/images/Soft Ivory Wave Gradient.png'}
        activeCategory={categoryParam || selectedCategory}
        onSelectCategory={handleSelectCategory}
        activeNav={currentNavTab}
        onSelectNav={handleSelectNav}
      />

      {/* 4. DYNAMIC URL PAGE CONTENT ROUTER */}
      <div className="flex-1">
        
        {/* A. DEDICATED PRODUCT DETAIL ROUTE: /product/:id (Task 3 & 4 - Real URL, No Popup!) */}
        {isProductRoute && activeProduct && (
          <ProductDetailPage
            product={activeProduct}
            allProducts={products}
            cmsConfig={cmsConfig}
            onBack={() => navigate('/shop')}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={handleSelectCategory}
            onShopBanner={() => navigate('/shop')}
            onBuyNow={() => navigate('/checkout')}
            onOpenAuthModal={(mode) => navigate(mode === 'register' || mode === 'signup' ? '/signup' : '/login')}
          />
        )}

        {/* DEDICATED FULL CHECKOUT PAGE ROUTE: /checkout (Task 2 - Dedicated Page, No Popup Modal!) */}
        {currentPath === '/checkout' && (
          <CheckoutPage
            navigate={navigate}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {isProductRoute && !activeProduct && (
          <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
            <div className="w-10 h-10 border-4 border-[#704214] border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-lg font-serif font-bold text-[#2B1E16]">
              {productLoading ? 'Loading Exclusive Product Details...' : 'Product Not Found'}
            </h2>
            <p className="text-xs text-[#7A6E65] mt-1 max-w-sm">
              {productLoading ? 'Fetching verified specifications, luxury imagery, and inventory status.' : 'The requested item could not be retrieved. Explore our signature collection below.'}
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-5 px-6 py-2.5 bg-[#704214] text-white rounded-full text-xs font-semibold hover:bg-[#59330E] transition-all shadow-sm"
            >
              Browse All Collections
            </button>
          </div>
        )}

        {/* B. DEDICATED CATEGORY ROUTE: /category/:slug OR /shop */}
        {(isCategoryRoute || currentPath === '/shop') && (
          <ShopPage
            products={products}
            categories={categories}
            selectedCategory={categoryParam || selectedCategory}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* C. BLOGS JOURNAL ROUTE: /blogs */}
        {currentPath === '/blogs' && (
          <BlogsPage
            articles={cmsConfig?.blogs}
            config={cmsConfig?.blogsHeader}
          />
        )}

        {/* D. FLASH DEALS ROUTE: /flash-deals */}
        {currentPath === '/flash-deals' && (
          <FlashDealsPage
            products={products}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* E. OUR COLLECTION ROUTE: /our-collection */}
        {currentPath === '/our-collection' && (
          <OurCollectionPage
            products={products}
            categories={categories}
            onSelectCategory={handleSelectCategory}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* F. OUR BRAND ROUTE: /our-brand */}
        {currentPath === '/our-brand' && (
          <OurBrandPage config={cmsConfig?.ourBrand} />
        )}

        {/* G. FAQ ROUTE: /faq */}
        {currentPath === '/faq' && (
          <FAQPage
            faqs={cmsConfig?.faqs}
            config={cmsConfig?.faqHeader}
          />
        )}

        {/* H. CONTACT ROUTE: /contact */}
        {currentPath === '/contact' && (
          <ContactUsPage config={cmsConfig?.contactUs} />
        )}

        {/* I. WISHLIST ROUTE: /wishlist */}
        {currentPath === '/wishlist' && (
          <WishlistPage
            onSelectProduct={handleSelectProduct}
            onShopNow={() => handleSelectNav('shop')}
          />
        )}

        {/* J. DEFAULT HOMEPAGE: / */}
        {!isProductRoute && !isCategoryRoute && (currentPath === '/' || currentPath === '') && (
          <>
            <HeroBanner
              banners={cmsConfig?.heroBanners}
              valueProps={cmsConfig?.valueProps}
              onShopNow={() => handleSelectNav('shop')}
            />
            <CategoryCards
              categories={categories}
              onSelectCategory={handleSelectCategory}
            />
            <ProductTabs
              products={products}
              onSelectProduct={handleSelectProduct}
              onViewAll={() => handleSelectNav('shop')}
            />
            <PromoBanners
              promoData={cmsConfig?.promoBanners}
              onShopBanner={() => handleSelectNav('shop')}
            />
            <BrandSlider brands={cmsConfig?.brands} />
            <Newsletter config={cmsConfig?.newsletter} />
          </>
        )}
      </div>

      {/* 5. Luxury Dark Footer */}
      <Footer
        config={cmsConfig}
        logoUrl={logoUrl}
        onSelectNav={handleSelectNav}
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={() => navigate('/admin')}
      />

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        logoUrl={logoUrl}
        categories={categories}
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={() => navigate('/admin')}
        onSelectNav={handleSelectNav}
      />

      {/* Mobile Bottom Fixed App Bar (Image 3) */}
      <MobileBottomBar
        activeTab={currentNavTab}
        onSelectTab={(tab) => {
          if (tab === 'account') {
            navigate('/login');
          } else {
            handleSelectNav(tab);
          }
        }}
        onOpenAuthModal={(mode) => navigate(mode === 'register' || mode === 'signup' ? '/signup' : '/login')}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer onCheckout={() => navigate('/checkout')} />

      {/* Customer / Admin Auth Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
      />
    </div>
  );
}
