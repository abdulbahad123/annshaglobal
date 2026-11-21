# ANNSHA GLOBAL — Complete Architecture, Security & Implementation Roadmap
**Pixel-Perfect MERN E-Commerce Platform & Responsive Admin CMS**

---

## 1. Executive Summary & Project Understanding

Based on your prompt and the reference designs (`desktop` and `mobile` mockups for **ANNSHA GLOBAL — Your World Your Choice**), this document defines the complete end-to-end architecture, database schema, security blueprint, and step-by-step implementation roadmap for building:

1. **Pixel-Perfect Customer Frontend (Web & Mobile Responsive)**:
   - Luxury ivory/beige aesthetic with deep chocolate brown accents (`#FBF7F0`, `#704214`).
   - Top announcement bar, luxury branding with monogram `AG`, live search, account/wishlist/cart counters.
   - Hero banner carousel with CTA, trust badges (Free Shipping, Secure Payments, Easy Returns, Exclusive Offers).
   - Category showcase cards with custom rounded pedestals and circular action buttons.
   - Product deals tabs (*Today's Deals, Top Rated, Trending, New Arrivals*) with product cards, rating stars, dual pricing, and "Add to Cart".
   - Dual promotional marketing banners (*Fashion Sale up to 70% OFF* and *Smart Home Smarter Living up to 50% OFF*).
   - Brand partners slider, newsletter subscription box, and luxury dark footer with legal and app download badges.
   - Dedicated Mobile UI with hamburger navigation, bottom sticky navigation bar (Home, Shop, Wishlist, Cart, Account), and touch-optimized controls.

2. **Full-Featured, Fully Responsive Admin Panel**:
   - **Dashboard**: High-level KPIs (Revenue, Orders, Products, Customers), real-time recent order feed, and recent customers with **automatic IP-to-Country geolocation tracking**.
   - **Customers Menu**: Full customer directory, registration timestamp, total spend, order count, server-side pagination, quick date filters (*Today*, *Yesterday*, *Custom Date Range*), and search.
   - **Products & Categories Management**: Nested category tree, full CRUD, SKU, inventory management, price/compare price, and an **automatic WebP image processing pipeline** using `sharp` (converts uploaded PNG/JPG to optimized WebP at multiple resolutions).
   - **Website Editor (CMS Menu)**: Full control over the storefront without code changes: Announcement bar, Header nav links, Hero slider slides, Promotional banners, Brand logos, and Footer sections.
   - **Orders Menu**: Comprehensive order management with date filters (*Today*, *Yesterday*, *Custom Range*), order status workflow (*Pending -> Processing -> Shipped -> Delivered -> Cancelled*), payment status tracking, and invoice printing.
   - **Revenue & Analytics Menu**: Detailed revenue breakdowns (Daily, Weekly, Monthly, Yearly), category-wise earnings, payment gateway distributions, and average order value (AOV).
   - **Dynamic Payment Gateway Menu**: Toggle and configure payment processors (Stripe, PayPal, Razorpay, Cash on Delivery) with API keys and sandbox/live switching.

3. **Military-Grade Security & Anti-Hacking Architecture**:
   - Zero-trust security model.
   - Double-token authentication: Short-lived access token in memory/httpOnly cookie + encrypted refresh token with rotation.
   - Strict NoSQL injection prevention (`express-mongo-sanitize`), XSS protection (`helmet`, `xss-clean`), and HTTP Parameter Pollution (`hpp`) defense.
   - API rate limiting (strict on auth routes: 5 attempts per 15 min; standard API limits: 100 requests per 15 min).
   - File upload sandbox: Magic byte MIME verification (preventing malicious executables disguised as images), size limits (5MB max), and buffer re-encoding via `sharp` which strips out malicious EXIF metadata and polyglot payloads.
   - Granular Role-Based Access Control (RBAC) ensuring only validated Admin tokens can access administrative endpoints.

---

## 2. Design System & Style Guide (Pixel-Perfect Match)

### 2.1 Color Palette
| Token | Hex Code | Usage |
|---|---|---|
| `--bg-main` | `#FBF7F0` | Warm luxury cream background for page body |
| `--card-bg` | `#FFFDF9` | Soft ivory for category & product cards |
| `--card-border` | `#F0E7DB` | Subtle border for cards and dividers |
| `--primary-brown` | `#704214` | Primary brand brown (buttons, active tabs, header bar) |
| `--primary-brown-hover` | `#59330E` | Darker brown hover state for buttons |
| `--dark-footer` | `#231710` | Deep espresso brown for footer background |
| `--text-heading` | `#2B1E16` | Deep rich charcoal brown for headings and titles |
| `--text-body` | `#605248` | Muted brown-gray for secondary text and descriptions |
| `--gold-accent` | `#C59B27` | Gold star ratings, badge borders, and luxury icons |
| `--badge-bg` | `#F5EBE1` | Category pill background and subtle badge tints |
| `--sale-red` | `#B93822` | Discount badges, strike-through text, urgent alerts |

### 2.2 Typography
- **Headings (Display / Luxury)**: `Cormorant Garamond` or `Playfair Display` (Serif, weights 600, 700).
- **Body & Controls (Clean UI)**: `Plus Jakarta Sans` or `Inter` (Sans-serif, weights 400, 500, 600, 700).

### 2.3 UI Geometry & Shadows
- **Border Radius**:
  - Cards: `rounded-2xl` (`16px`)
  - Buttons & Pills: `rounded-full` (`9999px`)
  - Hero container: `rounded-3xl` (`24px`)
- **Box Shadows**:
  - Soft Card Glow: `0 8px 30px rgba(112, 66, 20, 0.06)`
  - Elevated Popups & Drawers: `0 20px 40px rgba(35, 23, 16, 0.15)`

---

## 3. System Architecture & Tech Stack

```
                              +---------------------------------------+
                              |         CLIENT APPLICATIONS           |
                              +---------------------------------------+
                              |  1. Storefront (Customer UI)          |
                              |     - Desktop & Mobile Pixel-Perfect  |
                              |  2. Admin Panel (Backoffice CMS)      |
                              |     - Dashboard, Products, Orders,    |
                              |       Customers, CMS, Revenue, Payment|
                              +-------------------+-------------------+
                                                  |
                                                  | HTTPS / REST / WebSockets
                                                  v
                              +---------------------------------------+
                              |            API GATEWAY                |
                              +---------------------------------------+
                              |  - Rate Limiting (express-rate-limit) |
                              |  - Security Headers (Helmet, CORS)    |
                              |  - Input Validation (Zod Middleware)  |
                              |  - JWT Authentication (httpOnly)      |
                              +-------------------+-------------------+
                                                  |
                         +------------------------+------------------------+
                         |                                                 |
                         v                                                 v
         +-------------------------------+                 +-------------------------------+
         |       BUSINESS SERVICES       |                 |     MEDIA PROCESSING ENGINE   |
         +-------------------------------+                 +-------------------------------+
         |  - Auth & RBAC Service        |                 |  - Multer Memory Storage      |
         |  - Product & Category Service |                 |  - Magic-Byte MIME Validation |
         |  - Order & Cart Service       |                 |  - Sharp Engine (PNG/JPG ->   |
         |  - CMS & Website Editor Svc   |                 |    WebP Conversion, Multi-Res)|
         |  - Customer & Geolocation Svc |                 +---------------+---------------+
         |  - Revenue & Analytics Svc    |                                 |
         |  - Payment Integration Svc    |                                 v
         +---------------+---------------+                 +-------------------------------+
                         |                                 |   LOCAL / CLOUD STORAGE       |
                         v                                 |   /uploads/products/*.webp    |
         +-------------------------------+                 |   /uploads/banners/*.webp     |
         |       MONGODB DATABASE        |                 +-------------------------------+
         +-------------------------------+
         |  - Collections: Users,        |
         |    Products, Categories,      |
         |    Orders, CMS_Content,       |
         |    Revenue_Logs, Audit_Logs   |
         +-------------------------------+
```

### 3.1 Technology Selection
- **Frontend & Admin**: React 18, Vite, Tailwind CSS, Lucide React (Icons), Framer Motion (Smooth animations), Swiper.js (Touch carousel for products & hero), Chart.js / Recharts (Revenue & Analytics).
- **Backend**: Node.js (v20+ LTS), Express.js (REST API framework).
- **Database**: MongoDB with Mongoose ODM (Indexes, Schemas, Aggregation pipelines).
- **Image Pipeline**: `multer` (in-memory file upload) + `sharp` (high-performance WebP transcoding and metadata stripping).
- **Geolocation**: `geoip-lite` / `ip-api` for capturing country and city on customer registration/login.
- **Security Utilities**: `bcryptjs` (salt 12), `jsonwebtoken`, `helmet`, `cors`, `express-mongo-sanitize`, `hpp`, `zod`.

---

## 4. Complete Folder & File Structure

A clean, production-grade monorepo structure:

```
annshaglobal/
├── package.json                   # Root package script to orchestrate client & server
├── .gitignore
├── README.md
├── PROJECT_ROADMAP.md             # This comprehensive architecture document
│
├── server/                        # Express.js REST API & Business Logic
│   ├── package.json
│   ├── .env.example
│   ├── server.js                  # Entry point: Server instantiation & Graceful shutdown
│   ├── app.js                     # Express app setup, security middlewares, route mounting
│   │
│   ├── config/
│   │   ├── db.js                  # MongoDB Mongoose connection with retry logic
│   │   ├── security.js            # Helmet, CORS, and rate-limiting configs
│   │   └── payment.js             # Stripe / PayPal client initializations
│   │
│   ├── models/                    # Mongoose Data Models
│   │   ├── User.js                # Customer & Admin accounts, roles, geolocation
│   │   ├── Category.js            # Nested categories, slugs, banner image
│   │   ├── Product.js             # Products, inventory, pricing, WebP images, ratings
│   │   ├── Order.js               # Orders, items, shipping, payment status, timeline
│   │   ├── CMSContent.js          # Dynamic website editor content (Hero, Banners, Footer)
│   │   ├── PaymentSetting.js      # Enabled gateways, keys (encrypted), COD settings
│   │   └── AuditLog.js            # System security logs for admin actions
│   │
│   ├── controllers/               # Request Handlers
│   │   ├── authController.js      # Register, Login, Refresh Token, Logout
│   │   ├── customerController.js  # Customer listing, filters, geolocation stats
│   │   ├── productController.js   # CRUD operations, stock updates, filtering
│   │   ├── categoryController.js  # Category CRUD, hierarchy tree
│   │   ├── orderController.js     # Checkout, order listing, status transitions, invoice
│   │   ├── cmsController.js       # Website Editor GET/PUT for hero, header, banners
│   │   ├── revenueController.js   # Revenue analytics, date grouping aggregations
│   │   ├── paymentController.js   # Payment gateway settings & webhooks
│   │   └── uploadController.js    # Image upload & WebP conversion endpoint
│   │
│   ├── middlewares/               # Security & Utility Middlewares
│   │   ├── authMiddleware.js      # JWT verification (Access token validation)
│   │   ├── roleMiddleware.js      # RBAC verification (Admin gatekeeper)
│   │   ├── validateMiddleware.js  # Zod schema validation
│   │   ├── uploadMiddleware.js    # Multer configuration + memory storage
│   │   ├── imageProcessor.js      # Sharp WebP conversion & resizing middleware
│   │   ├── rateLimiter.js         # Endpoint specific rate limiters
│   │   └── errorHandler.js        # Global safe error handler (no stack trace leak)
│   │
│   ├── routes/                    # API Route Definitions
│   │   ├── authRoutes.js          # /api/v1/auth
│   │   ├── customerRoutes.js      # /api/v1/customers
│   │   ├── productRoutes.js       # /api/v1/products
│   │   ├── categoryRoutes.js      # /api/v1/categories
│   │   ├── orderRoutes.js         # /api/v1/orders
│   │   ├── cmsRoutes.js           # /api/v1/cms
│   │   ├── revenueRoutes.js       # /api/v1/revenue
│   │   ├── paymentRoutes.js       # /api/v1/payments
│   │   └── uploadRoutes.js        # /api/v1/upload
│   │
│   ├── services/                  # Business logic & helper utilities
│   │   ├── geoService.js          # Extract IP & resolve Country/City
│   │   └── tokenService.js        # Sign/verify access & refresh tokens
│   │
│   └── uploads/                   # Auto-generated WebP processed images directory
│       ├── products/
│       ├── categories/
│       └── banners/
│
├── client/                        # Customer Frontend (Vite + React)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css              # Custom font imports, Tailwind base & utility styles
│       ├── api/                   # Axios client with interceptors for token refresh
│       │   └── axiosClient.js
│       ├── context/               # Global state management
│       │   ├── AuthContext.jsx
│       │   ├── CartContext.jsx
│       │   └── WishlistContext.jsx
│       ├── components/            # Reusable Pixel-Perfect UI Components
│       │   ├── layout/
│       │   │   ├── AnnouncementBar.jsx # Top bar with shipping info & social links
│       │   │   ├── Header.jsx          # Luxury header, search, counters
│       │   │   ├── Navbar.jsx          # Categories dropdown, menu navigation
│       │   │   ├── MobileNav.jsx       # Hamburger menu & slide-out drawer
│       │   │   ├── MobileBottomBar.jsx # Fixed bottom app bar (5 tabs)
│       │   │   └── Footer.jsx          # Dark brown luxury footer & legal
│       │   ├── home/
│       │   │   ├── HeroBanner.jsx      # Luxury banner slider with CTA
│       │   │   ├── TrustBadges.jsx     # Free shipping, Secure payments, Returns
│       │   │   ├── CategoryCards.jsx   # Shop by Category pedestals with round arrows
│       │   │   ├── ProductTabs.jsx     # Deals, Top Rated, Trending, New Arrivals
│       │   │   ├── ProductCard.jsx     # Pixel-perfect card (wishlist, star ratings, CTA)
│       │   │   ├── PromoBanners.jsx    # Dual Fashion & Smart Home promo cards
│       │   │   ├── BrandSlider.jsx     # Brand logos carousel
│       │   │   └── Newsletter.jsx      # Newsletter subscription card
│       │   └── common/
│       │       ├── RatingStars.jsx
│       │       └── Modal.jsx
│       └── pages/
│           ├── HomePage.jsx
│           ├── ShopPage.jsx
│           ├── ProductDetailPage.jsx
│           ├── CartPage.jsx
│           ├── CheckoutPage.jsx
│           ├── OrderSuccessPage.jsx
│           ├── LoginPage.jsx
│           └── RegisterPage.jsx
│
└── admin/                         # Dedicated Responsive Admin Panel (Vite + React)
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── AdminLayout.jsx    # Collapsible sidebar + mobile drawer + header
    │   │   ├── Sidebar.jsx        # Navigation links with active indicators
    │   │   ├── AdminHeader.jsx    # Profile, notifications, quick actions
    │   │   ├── StatCard.jsx       # Metric cards with percentage change
    │   │   ├── DataTable.jsx      # Reusable table with pagination & date filters
    │   │   └── DateFilterBar.jsx  # [Today] [Yesterday] [Custom Date] buttons + Search
    │   └── pages/
    │       ├── DashboardPage.jsx  # Orders, products, revenue, recent customer geolocation
    │       ├── CustomersPage.jsx  # Customer list, account created, order history
    │       ├── ProductsPage.jsx   # Product table, Add/Edit modal, WebP image upload
    │       ├── CategoriesPage.jsx # Category tree, Add/Edit modal, image banner
    │       ├── OrdersPage.jsx     # Orders listing, status dropdown, invoice viewer
    │       ├── WebsiteEditor.jsx  # Visual CMS: Hero, Banners, Header, Footer
    │       ├── RevenuePage.jsx    # Revenue analytics, graphs, payment gateway shares
    │       ├── PaymentSettings.jsx# Dynamic Payment configuration (Stripe, COD, PayPal)
    │       └── AdminLoginPage.jsx # Secure admin login with MFA/Rate limit safeguard
```

---

## 5. Database Schemas (Mongoose)

### 5.1 User Schema (`server/models/User.js`)
```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin', 'manager'], default: 'customer', index: true },
  phone: { type: String, trim: true },
  avatar: { type: String, default: '' },
  
  // Geolocation & Security Tracking
  registrationIp: { type: String },
  country: { type: String, default: 'Unknown', index: true },
  countryCode: { type: String, default: 'UN' },
  city: { type: String, default: 'Unknown' },
  lastLoginIp: { type: String },
  lastLoginAt: { type: Date },

  // E-commerce customer metrics
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },

  refreshTokenHash: { type: String, select: false }
}, { timestamps: true });

// Compound index for fast filtering by date & role
userSchema.index({ createdAt: -1, role: 1 });

export default mongoose.model('User', userSchema);
```

### 5.2 Category Schema (`server/models/Category.js`)
```javascript
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  description: { type: String, trim: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  image: { type: String, required: true }, // WebP image path
  orderIndex: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true, index: true },
  productCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
```

### 5.3 Product Schema (`server/models/Product.js`)
```javascript
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  sku: { type: String, required: true, unique: true, uppercase: true, index: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 200 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, min: 0 }, // Discounted strikethrough price
  stock: { type: Number, required: true, default: 0, min: 0 },
  
  // High-performance WebP images
  images: [{
    original: { type: String, required: true },
    thumbnail: { type: String },
    alt: { type: String }
  }],
  
  // Filter badges matching frontend UI
  badge: { 
    type: String, 
    enum: ['none', 'todays_deals', 'top_rated', 'trending', 'new_arrivals'], 
    default: 'none',
    index: true 
  },
  
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

productSchema.index({ createdAt: -1, badge: 1, price: 1 });

export default mongoose.model('Product', productSchema);
```

### 5.4 Order Schema (`server/models/Order.js`)
```javascript
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true, index: true }, // e.g., AG-2026-10023
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [orderItemSchema],
  
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },

  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },

  paymentMethod: { type: String, enum: ['stripe', 'paypal', 'cod', 'razorpay'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending', index: true },
  paymentTransactionId: { type: String },

  orderStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending',
    index: true 
  },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason: { type: String }
}, { timestamps: true });

// Filter indexes for orders dashboard
orderSchema.index({ createdAt: -1, orderStatus: 1, paymentStatus: 1 });

export default mongoose.model('Order', orderSchema);
```

### 5.5 Website Editor CMS Schema (`server/models/CMSContent.js`)
```javascript
import mongoose from 'mongoose';

const cmsContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'homepage_config' },

  // Top Announcement Bar
  announcementBar: {
    enabled: { type: Boolean, default: true },
    shippingText: { type: String, default: 'Free Shipping on Orders Above $50' },
    returnsText: { type: String, default: 'Easy Returns Within 7 Days' },
    supportText: { type: String, default: '24/7 Customer Support' },
    socials: {
      facebook: String,
      instagram: String,
      youtube: String,
      pinterest: String
    }
  },

  // Hero Banners Carousel
  heroBanners: [{
    tagline: { type: String, default: 'PREMIUM COLLECTION' },
    title: { type: String, default: 'Care, Style and Home, All in One Place.' },
    subtitle: { type: String, default: 'Discover Premium Products with Unbeatable Deals.' },
    buttonText: { type: String, default: 'Shop Now' },
    buttonLink: { type: String, default: '/shop' },
    imageUrl: { type: String, required: true }, // WebP image
    badgeText: { type: String, default: 'Live Beautifully' },
    orderIndex: { type: Number, default: 0 }
  }],

  // Value Proposition Badges
  valueProps: [{
    icon: { type: String, default: 'truck' },
    title: { type: String, default: 'Free Shipping' },
    subtitle: { type: String, default: 'On All Orders' }
  }],

  // Dual Promo Banners
  promoBanners: {
    banner1: {
      title: { type: String, default: 'Fashion Sale Up to 70% OFF' },
      subtitle: { type: String, default: 'Step into style' },
      buttonText: { type: String, default: 'Shop the Sale' },
      buttonLink: { type: String, default: '/shop?category=fashion' },
      imageUrl: { type: String, required: true }
    },
    banner2: {
      title: { type: String, default: 'Smart Home Smarter Living Up to 50% OFF' },
      subtitle: { type: String, default: 'Modern comfort' },
      buttonText: { type: String, default: 'Shop Smart' },
      buttonLink: { type: String, default: '/shop?category=home' },
      imageUrl: { type: String, required: true }
    }
  },

  // Brand Logos
  brands: [{
    name: { type: String, required: true },
    logoUrl: { type: String, required: true },
    link: { type: String, default: '#' }
  }],

  // Footer Settings
  footer: {
    aboutText: { type: String, default: 'Your one-stop destination for premium products and unique finds.' },
    playStoreLink: { type: String, default: '#' },
    appStoreLink: { type: String, default: '#' },
    copyrightText: { type: String, default: '© 2025 Annsha Global. All rights reserved.' }
  }
}, { timestamps: true });

export default mongoose.model('CMSContent', cmsContentSchema);
```

---

## 6. Automatic Image Optimization Pipeline (PNG/JPG -> WebP)

Whenever an image is uploaded through the Admin Panel (Product, Banner, Category), it is intercepted in memory, stripped of EXIF metadata (security), and converted to optimized WebP.

### 6.1 Upload & Conversion Middleware (`server/middlewares/imageProcessor.js`)
```javascript
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const processImageToWebP = (subfolder = 'products') => {
  return async (req, res, next) => {
    if (!req.file && !req.files) return next();

    const uploadDir = path.join(process.cwd(), 'uploads', subfolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const processSingleBuffer = async (fileBuffer) => {
      const fileName = `${uuidv4()}-${Date.now()}.webp`;
      const fullPath = path.join(uploadDir, fileName);

      // Re-encode to clean, compressed WebP (Quality 82% gives optimal size/visual ratio)
      await sharp(fileBuffer)
        .rotate() // auto-orient based on EXIF before stripping
        .webp({ quality: 82, effort: 4 })
        .toFile(fullPath);

      // Also create a 300px thumbnail for fast card loading
      const thumbName = `thumb-${fileName}`;
      const thumbPath = path.join(uploadDir, thumbName);
      await sharp(fileBuffer)
        .resize(320, 320, { fit: 'cover' })
        .webp({ quality: 75 })
        .toFile(thumbPath);

      return {
        url: `/uploads/${subfolder}/${fileName}`,
        thumbnailUrl: `/uploads/${subfolder}/${thumbName}`
      };
    };

    try {
      if (req.file) {
        req.processedImage = await processSingleBuffer(req.file.buffer);
      } else if (req.files && Array.isArray(req.files)) {
        req.processedImages = await Promise.all(
          req.files.map(file => processSingleBuffer(file.buffer))
        );
      }
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Image processing failed. File may be corrupted or unsupported.',
        error: error.message
      });
    }
  };
};
```

---

## 7. Customer Geolocation Tracking Engine

When any customer creates an account or logs in, their IP address is inspected to determine country and city for the Admin Dashboard.

### 7.1 Geolocation Service (`server/services/geoService.js`)
```javascript
import geoip from 'geoip-lite';

export const getClientLocation = (req) => {
  // Capture client IP behind proxy or direct
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Handle localhost fallback for local testing
  if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.')) {
    return {
      ip,
      country: 'Localhost / Dev',
      countryCode: 'DEV',
      city: 'Local Machine'
    };
  }

  const geo = geoip.lookup(ip);
  if (!geo) {
    return { ip, country: 'Unknown', countryCode: 'UN', city: 'Unknown' };
  }

  return {
    ip,
    country: geo.country || 'Unknown',
    countryCode: geo.country || 'UN',
    city: geo.city || 'Unknown'
  };
};
```

---

## 8. Date Filtering Engine (Today, Yesterday, Custom Date)

Used across **Customers**, **Orders**, and **Revenue** menus in the Admin Panel.

### 8.1 Reusable Date Range Builder
```javascript
export const buildDateFilter = (rangeType, startDate, endDate) => {
  const now = new Date();
  let filter = {};

  if (rangeType === 'today') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    filter = { $gte: startOfToday, $lte: endOfToday };
  } else if (rangeType === 'yesterday') {
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    filter = { $gte: startOfYesterday, $lte: endOfYesterday };
  } else if (rangeType === 'custom' && startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filter = { $gte: start, $lte: end };
  }

  return Object.keys(filter).length > 0 ? filter : null;
};
```

---

## 9. Military-Grade Security Architecture ("Anti-Hacking Blueprint")

To satisfy the explicit requirement that **"no hacker should able to hack the website"**, the following defenses are implemented across every tier:

### 9.1 Authentication & Token Defense
1. **Double Cookie Strategy**:
   - Access token (15-minute lifespan) is delivered in a `httpOnly`, `Secure`, `SameSite=Strict` cookie, completely inaccessible to JavaScript (`document.cookie` is blind to it, neutralizing XSS credential theft).
   - Refresh token (7-day lifespan) is stored hashed in MongoDB (`refreshTokenHash`). On token refresh, the database verifies the hash and rotates both tokens immediately (Refresh Token Rotation).
2. **Brute Force Protection**:
   - Rate limiting on `/api/v1/auth/login`: Maximum 5 failed attempts per IP per 15 minutes before temporary lockout.
   - Password hashing with `bcryptjs` using a cost factor of `12` with unique cryptographically secure salts.

### 9.2 Injection & Data Sanitization Defense
1. **NoSQL Injection**:
   - `express-mongo-sanitize` strips any key starting with `$` or containing `.` from `req.body`, `req.query`, and `req.params`. Attackers cannot inject `{ $gt: '' }` to bypass login.
2. **Cross-Site Scripting (XSS)**:
   - Output encoding on all rendered inputs.
   - Dynamic HTML in CMS editor is sanitized with `DOMPurify` before saving and before rendering.
3. **HTTP Parameter Pollution (HPP)**:
   - `hpp()` prevents query string duplication attacks (e.g. `?role=admin&role=customer`).
4. **Strict Schema Validation (Zod)**:
   - Every route validates incoming payloads against rigid schemas. Unexpected fields are stripped.

### 9.3 File Upload Security
1. **Magic Bytes Validation**:
   - Instead of trusting the user-provided file extension (e.g. `shell.php.png`), the server inspects the initial byte headers using `file-type`.
2. **Buffer Re-Encoding**:
   - Every uploaded image is decoded and re-encoded using `sharp`. Any malicious shell scripts, polyglot payloads, or hidden PHP strings embedded within image binaries are destroyed during transcoding to WebP.
3. **Restricted Storage**:
   - Files are stored in a non-executable static directory where `.php`, `.sh`, `.exe`, or `.js` execution is disabled.

### 9.4 Role-Based Access Control (RBAC) & Audit Logging
1. **Strict Admin Guard Middleware**:
   - Every administrative route requires `verifyToken` followed by `verifyRole('admin')`. If a regular customer accesses `/api/v1/orders/all` or `/api/v1/cms`, a `403 Forbidden` is returned, and an security incident is logged in `AuditLog`.
2. **Immutable Audit Logs**:
   - Any price change, product deletion, banner change, or customer status modification writes a record containing Admin User ID, IP Address, Timestamp, Action, and Diff.

---

## 10. Complete REST API Specification

### Auth & Security Routes (`/api/v1/auth`)
- `POST /register`: Create customer account, capture IP and resolve country/city.
- `POST /login`: Validate credentials, issue access & refresh tokens in httpOnly cookies.
- `POST /refresh-token`: Rotate refresh token and issue new access token.
- `POST /logout`: Invalidate token in DB and clear cookies.
- `GET /me`: Return current user profile with role & permissions.

### Customer Management (`/api/v1/customers`) [Admin Only]
- `GET /`: Get paginated customer list. Query params: `page`, `limit`, `search`, `rangeType` (`today` | `yesterday` | `custom`), `startDate`, `endDate`.
- `GET /stats`: Get customer metrics: Total, New today, Country distribution breakdown.
- `GET /:id`: Get specific customer details, address book, and complete order history.
- `PATCH /:id/block`: Toggle user block status.

### Products & Categories (`/api/v1/products`, `/api/v1/categories`)
- `GET /categories`: Public category listing with subcategories and product counts.
- `POST /categories`: [Admin] Create category with WebP banner.
- `PUT /categories/:id`: [Admin] Update category details or order.
- `DELETE /categories/:id`: [Admin] Delete category (with safety check on attached products).
- `GET /products`: Public product search & filters (`category`, `badge`, `minPrice`, `maxPrice`, `search`, `sort`).
- `POST /products`: [Admin] Create product with multiple WebP uploaded images.
- `PUT /products/:id`: [Admin] Update product, stock, or price.
- `DELETE /products/:id`: [Admin] Soft or hard delete product.

### Website Editor CMS (`/api/v1/cms`)
- `GET /config`: Public endpoint to fetch active announcement bar, hero banners, promo banners, and footer.
- `PUT /config`: [Admin] Update any section of the storefront CMS.
- `POST /upload-banner`: [Admin] Upload banner image, convert to WebP, and return URL.

### Orders & Checkout (`/api/v1/orders`)
- `POST /checkout`: Customer place order, recalculates pricing on backend to prevent tampering.
- `GET /my-orders`: Logged-in customer order history.
- `GET /admin/all`: [Admin] All orders with filters (`today`, `yesterday`, `custom`, `status`, `paymentStatus`, `search`).
- `PATCH /admin/:id/status`: [Admin] Transition order status (`pending` -> `processing` -> `shipped` -> `delivered`).
- `GET /:id/invoice`: Generate PDF invoice data.

### Revenue & Analytics (`/api/v1/revenue`) [Admin Only]
- `GET /overview`: Total revenue, monthly growth %, average order value (AOV).
- `GET /charts`: Daily/Weekly/Monthly revenue chart data.
- `GET /by-category`: Revenue distribution by category.
- `GET /by-payment-method`: Breakdown (Stripe vs PayPal vs COD).

### Payment Gateway Settings (`/api/v1/payments`) [Admin Only]
- `GET /settings`: Current active payment gateways.
- `PUT /settings`: Enable/Disable Stripe, PayPal, COD, and save API keys safely.

---

## 11. Step-by-Step Implementation Roadmap

```
Phase 1: Project Setup & Security Core
  └── Monorepo setup, Express configuration, MongoDB schemas, Security middlewares

Phase 2: Authentication & Geolocation System
  └── Double-cookie JWT, login/register, geoip tracking, RBAC guards

Phase 3: Media Processing Pipeline (Sharp WebP)
  └── Multer memory storage, WebP transcoding, thumbnail generation

Phase 4: Storefront Development (Pixel-Perfect Customer UI)
  └── Theme setup, Header, Hero, Category Cards, Product Tabs, Promo Banners, Footer, Mobile View

Phase 5: Responsive Admin Panel Construction
  └── Dashboard (Geo Analytics), Customers (Date filters), Products CRUD, Orders Workflow

Phase 6: Website Editor (CMS) & Dynamic Payments
  └── CMS state persistence, Live homepage editing, Gateway toggles

Phase 7: End-to-End Testing, Hardening & Launch
  └── Penetration testing, performance audit, WebP caching, local deployment
```

### Phase 1: Environment & Core Setup
1. Initialize root workspace with `server`, `client`, and `admin` packages.
2. Configure MongoDB connection with connection pooling.
3. Install and wire security middlewares: `helmet`, `cors`, `express-mongo-sanitize`, `hpp`, `rate-limit`.

### Phase 2: Auth, Customer Geolocation & Security
1. Implement `User` model with geolocation fields (`country`, `city`, `ip`).
2. Build `geoService` using `geoip-lite`.
3. Create double-cookie JWT authentication (`httpOnly` cookies).
4. Implement Customer Management endpoints with date filters (`today`, `yesterday`, `custom`).

### Phase 3: Media Pipeline & Catalog Backend
1. Set up `sharp` image processing middleware.
2. Build Category and Product models with indexes.
3. Implement Product CRUD with automated PNG/JPG -> WebP conversion.

### Phase 4: Pixel-Perfect Storefront Frontend
1. Set up Tailwind CSS with Annsha Global luxury theme variables (`#FBF7F0`, `#704214`, Cormorant Garamond font).
2. Build Announcement Bar and Header with search, wishlist, and cart drawer.
3. Implement Hero Banner with Swiper slider matching reference slide layout.
4. Construct Category Cards with circular navigation buttons.
5. Build Product Tabs with deal badges, rating stars, dual pricing, and Add to Cart.
6. Create Dual Promo Banners (*Fashion Sale* & *Smart Home*).
7. Implement mobile-responsive bottom navigation bar and touch drawers.

### Phase 5: Responsive Admin Panel
1. Build responsive Admin Layout with collapsible sidebar and mobile drawer.
2. Develop Dashboard with KPI metric cards, revenue graphs, and Recent Customers list with country flags.
3. Build Customer Management with date filter buttons (`Today`, `Yesterday`, `Custom Date`) and search.
4. Build Product & Category management interfaces with image dropzones.
5. Build Order Management with status updating and date range filters.

### Phase 6: Website Editor (CMS) & Dynamic Payment Configuration
1. Build Website Editor page in Admin to update Hero slides, Announcement bar, Promo cards, and Footer.
2. Build Payment Settings page to toggle Stripe, PayPal, and COD with test/live mode switches.
3. Connect Frontend to consume `/api/v1/cms/config` so admin edits reflect immediately.

### Phase 7: Verification & Security Hardening
1. Verify WebP conversion for 100% of uploaded media.
2. Test responsive layouts on Desktop (1920px, 1440px), Tablet (768px), and Mobile (375px, 414px).
3. Conduct penetration test simulation: NoSQL injection tests, XSS script tags in CMS editor, and rate-limit triggers.

---

## 12. Local Environment Setup & Run Guide

### 12.1 Prerequisites
- **Node.js**: v18.x or v20.x LTS installed
- **MongoDB**: Local MongoDB Community instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 12.2 Environment Variables (`server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/annshaglobal
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_characters
JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_characters
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### 12.3 Running the Entire Project Locally
```bash
# Terminal 1: Backend Server
cd server
npm install
npm run dev

# Terminal 2: Customer Storefront (Port 5173)
cd client
npm install
npm run dev

# Terminal 3: Admin Panel (Port 5174)
cd admin
npm install
npm run dev
```

---
*Roadmap and architecture file generated for ANNSHA GLOBAL.*

