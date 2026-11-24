import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Mock Seed Data matching the Reference Image
const initialCategories = [
  {
    _id: 'cat_1',
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    description: 'Luxury skincare, fragrances and personal care essentials',
    image: '/images/categories/beauty-care.webp',
    orderIndex: 1,
    productCount: 2,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'cat_2',
    name: 'Electronics & Gadgets',
    slug: 'electronics-gadgets',
    description: 'Smart watches, wireless headphones and modern tech',
    image: '/images/categories/electronics.webp',
    orderIndex: 2,
    productCount: 3,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'cat_3',
    name: 'Jewellery & Accessories',
    slug: 'jewellery-accessories',
    description: 'Elegantly crafted gold, silver and gemstone accessories',
    image: '/images/categories/jewellery.webp',
    orderIndex: 3,
    productCount: 2,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'cat_4',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Refined decor, premium seating and cozy accents',
    image: '/images/categories/home-living.webp',
    orderIndex: 4,
    productCount: 1,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'cat_5',
    name: 'Books & Media',
    slug: 'books-media',
    description: 'Bestselling titles, stationery and premium journals',
    image: '/images/categories/books-media.webp',
    orderIndex: 5,
    productCount: 1,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'cat_6',
    name: 'Gifts & More',
    slug: 'gifts-more',
    description: 'Thoughtful luxury gift sets and celebration boxes',
    image: '/images/categories/gifts-more.webp',
    orderIndex: 6,
    productCount: 1,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const initialProducts = [
  {
    _id: 'prod_1',
    title: 'Nike Air Force 1 Sneakers',
    slug: 'nike-air-force-1-sneakers',
    sku: 'AG-NK-101',
    description: 'Timeless style with premium leather construction and lightweight Air cushioning for all-day luxury comfort.',
    category: 'cat_2',
    price: 69.99,
    comparePrice: 89.99,
    stock: 45,
    rating: 4.5,
    numReviews: 128,
    badge: 'todays_deals',
    images: ['/images/products/nike-air-force-1.webp'],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_2',
    title: 'Smart Watch Series 7',
    slug: 'smart-watch-series-7',
    sku: 'AG-SW-202',
    description: 'Cutting-edge OLED retina display, ECG monitor, fitness tracking, and waterproof titanium chassis.',
    category: 'cat_2',
    price: 99.99,
    comparePrice: 129.99,
    stock: 30,
    rating: 4.5,
    numReviews: 104,
    badge: 'todays_deals',
    images: ['/images/products/smart-watch-series-7.webp'],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_3',
    title: 'Stylish Handbag',
    slug: 'stylish-handbag',
    sku: 'AG-HB-303',
    description: 'Handcrafted genuine calfskin leather with polished gold hardware and versatile shoulder strap.',
    category: 'cat_3',
    price: 49.99,
    comparePrice: 79.99,
    stock: 22,
    rating: 4.5,
    numReviews: 77,
    badge: 'todays_deals',
    images: ['/images/products/stylish-handbag.webp', '/images/sliderimage1.webp'],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_4',
    title: 'Luxury Perfume',
    slug: 'luxury-perfume',
    sku: 'AG-PF-404',
    description: 'An enchanting blend of warm amber, blooming jasmine, and delicate Madagascar vanilla.',
    category: 'cat_1',
    price: 79.99,
    comparePrice: 99.99,
    stock: 60,
    rating: 4.5,
    numReviews: 57,
    badge: 'todays_deals',
    images: ['/images/products/luxury-perfume.webp'],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_5',
    title: 'Running Shoes',
    slug: 'running-shoes',
    sku: 'AG-RS-505',
    description: 'Engineered mesh upper with responsive foam midsole designed for distance performance.',
    category: 'cat_2',
    price: 59.99,
    comparePrice: 89.99,
    stock: 18,
    rating: 4.5,
    numReviews: 68,
    badge: 'todays_deals',
    images: ['/images/products/running-shoes.webp'],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_6',
    title: 'Noise Cancelling Headphones',
    slug: 'noise-cancelling-headphones',
    sku: 'AG-HP-606',
    description: 'Industry-leading active noise cancellation with 40-hour battery life and spatial audio immersion.',
    category: 'cat_2',
    price: 89.99,
    comparePrice: 129.99,
    stock: 35,
    rating: 4.5,
    numReviews: 71,
    badge: 'todays_deals',
    images: ['/images/products/noise-cancelling-headphones.webp'],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_7',
    title: 'Gold Pendant Necklace',
    slug: 'gold-pendant-necklace',
    sku: 'AG-GP-707',
    description: '18k gold plated handcrafted delicate chain with solitaire cubic zirconia.',
    category: 'cat_3',
    price: 34.99,
    comparePrice: 49.99,
    stock: 25,
    rating: 4.8,
    numReviews: 89,
    badge: 'top_rated',
    images: ['/images/products/gold-pendant-necklace.webp'],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_8',
    title: 'Ceramic Table Lamp',
    slug: 'ceramic-table-lamp',
    sku: 'AG-CL-808',
    description: 'Minimalist beige textured ceramic body with warm linen fabric shade.',
    category: 'cat_4',
    price: 64.00,
    comparePrice: 85.00,
    stock: 15,
    rating: 4.9,
    numReviews: 42,
    badge: 'new_arrivals',
    images: ['/images/products/ceramic-table-lamp.webp'],
    isFeatured: true,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const initialUsers = [
  {
    _id: 'usr_admin',
    name: 'Annsha Administrator',
    email: 'admin@annshaglobal.com',
    password: '$2a$12$e6y5Q48XqEeg3yF6y98sP.Kz52Vv7xK8yL9z8y7v6x5u4t3s2r1q.', // adminPassword123!
    role: 'admin',
    phone: '+1 234 567 8900',
    country: 'United States',
    countryCode: 'US',
    city: 'New York',
    totalOrders: 0,
    totalSpent: 0,
    isBlocked: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr_1',
    name: 'Sophia Laurent',
    email: 'sophia@example.com',
    password: '$2a$12$e6y5Q48XqEeg3yF6y98sP.Kz52Vv7xK8yL9z8y7v6x5u4t3s2r1q.',
    role: 'customer',
    phone: '+33 6 12 34 56 78',
    country: 'France',
    countryCode: 'FR',
    city: 'Paris',
    totalOrders: 3,
    totalSpent: 429.50,
    isBlocked: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'usr_2',
    name: 'Alexander Wright',
    email: 'alex@example.com',
    password: '$2a$12$e6y5Q48XqEeg3yF6y98sP.Kz52Vv7xK8yL9z8y7v6x5u4t3s2r1q.',
    role: 'customer',
    phone: '+44 7911 123456',
    country: 'United Kingdom',
    countryCode: 'GB',
    city: 'London',
    totalOrders: 2,
    totalSpent: 189.98,
    isBlocked: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
  },
  {
    _id: 'usr_3',
    name: 'Elena Rostova',
    email: 'elena@example.com',
    password: '$2a$12$e6y5Q48XqEeg3yF6y98sP.Kz52Vv7xK8yL9z8y7v6x5u4t3s2r1q.',
    role: 'customer',
    phone: '+49 151 23456789',
    country: 'Germany',
    countryCode: 'DE',
    city: 'Berlin',
    totalOrders: 4,
    totalSpent: 620.00,
    isBlocked: false,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'usr_4',
    name: 'Tariq Al-Mansoor',
    email: 'tariq@example.com',
    password: '$2a$12$e6y5Q48XqEeg3yF6y98sP.Kz52Vv7xK8yL9z8y7v6x5u4t3s2r1q.',
    role: 'customer',
    phone: '+971 50 123 4567',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    city: 'Dubai',
    totalOrders: 5,
    totalSpent: 1250.00,
    isBlocked: false,
    createdAt: new Date().toISOString()
  }
];

const initialCMS = {
  key: 'homepage_config',
  announcementBar: {
    enabled: true,
    shippingText: 'Free Shipping on Orders Above $50',
    returnsText: 'Easy Returns Within 7 Days',
    supportText: '24/7 Customer Support',
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com',
      pinterest: 'https://pinterest.com'
    }
  },
  heroBanners: [
    {
      tagline: 'PREMIUM COLLECTION',
      title: 'Care, Style and Home,\nAll in One Place.',
      subtitle: 'Discover Premium Products with Unbeatable Deals.',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      imageUrl: '/images/sliderimage2.webp',
      badgeText: 'Live Beautifully'
    },
    {
      tagline: 'EXCLUSIVE ARRIVALS',
      title: 'Elegance & Grace,\nCrafted for You.',
      subtitle: 'Explore handcrafted accessories and bespoke perfumes.',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      imageUrl: '/images/sliderimage1.webp',
      badgeText: 'Live Beautifully'
    }
  ],
  valueProps: [
    { title: 'Premium Quality', subtitle: 'Always', icon: 'gem' },
    { title: 'Free Shipping', subtitle: 'On Orders Above $50', icon: 'truck' },
    { title: 'Secure Payments', subtitle: '100% Secure', icon: 'shield-check' }
  ],
  promoBanners: {
    banner1: {
      title: 'Fashion Sale Up to 70% OFF',
      subtitle: 'Step into style',
      buttonText: 'Shop the Sale',
      buttonLink: '/shop',
      imageUrl: '/images/offerbanner1.webp'
    },
    banner2: {
      title: 'Smart Home Smarter Living Up to 50% OFF',
      subtitle: 'Modern comfort',
      buttonText: 'Shop Smart',
      buttonLink: '/shop',
      imageUrl: '/images/offerbanner2.webp'
    }
  },
  brands: [
    { name: 'Nike', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
    { name: 'Adidas', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
    { name: 'Samsung', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
    { name: 'Apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Puma', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Puma_logo.svg' },
    { name: 'Levi\'s', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Levi%27s_logo.svg' },
    { name: 'Zara', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg' },
    { name: 'H&M', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg' },
    { name: 'IKEA', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg' },
    { name: 'Flipkart', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg' }
  ],
  footer: {
    aboutText: 'Your one-stop destination for premium products and unique finds.',
    playStoreLink: 'https://play.google.com',
    appStoreLink: 'https://apple.com/app-store',
    copyrightText: '© 2025 Annsha Global. All rights reserved.'
  }
};

const initialOrders = [
  {
    _id: 'ord_1',
    orderNumber: 'AG-2026-10481',
    customer: 'usr_1',
    customerName: 'Sophia Laurent',
    customerEmail: 'sophia@example.com',
    items: [
      { product: 'prod_1', title: 'Nike Air Force 1 Sneakers', image: initialProducts[0].images[0], price: 69.99, quantity: 1, total: 69.99 },
      { product: 'prod_4', title: 'Luxury Perfume', image: initialProducts[3].images[0], price: 79.99, quantity: 1, total: 79.99 }
    ],
    shippingAddress: {
      fullName: 'Sophia Laurent',
      phone: '+33 6 12 34 56 78',
      addressLine: '14 Rue de la Paix',
      city: 'Paris',
      state: 'Île-de-France',
      postalCode: '75001',
      country: 'France'
    },
    subtotal: 149.98,
    shippingFee: 0,
    tax: 7.50,
    grandTotal: 157.48,
    paymentMethod: 'stripe',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'ord_2',
    orderNumber: 'AG-2026-10482',
    customer: 'usr_2',
    customerName: 'Alexander Wright',
    customerEmail: 'alex@example.com',
    items: [
      { product: 'prod_2', title: 'Smart Watch Series 7', image: initialProducts[1].images[0], price: 99.99, quantity: 1, total: 99.99 }
    ],
    shippingAddress: {
      fullName: 'Alexander Wright',
      phone: '+44 7911 123456',
      addressLine: '42 Baker Street',
      city: 'London',
      state: 'Greater London',
      postalCode: 'NW1 6XE',
      country: 'United Kingdom'
    },
    subtotal: 99.99,
    shippingFee: 0,
    tax: 5.00,
    grandTotal: 104.99,
    paymentMethod: 'paypal',
    paymentStatus: 'paid',
    orderStatus: 'processing',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'ord_3',
    orderNumber: 'AG-2026-10483',
    customer: 'usr_4',
    customerName: 'Tariq Al-Mansoor',
    customerEmail: 'tariq@example.com',
    items: [
      { product: 'prod_6', title: 'Noise Cancelling Headphones', image: initialProducts[5].images[0], price: 89.99, quantity: 2, total: 179.98 }
    ],
    shippingAddress: {
      fullName: 'Tariq Al-Mansoor',
      phone: '+971 50 123 4567',
      addressLine: 'Villa 12, Jumeirah Beach Road',
      city: 'Dubai',
      state: 'Dubai',
      postalCode: '00000',
      country: 'United Arab Emirates'
    },
    subtotal: 179.98,
    shippingFee: 0,
    tax: 9.00,
    grandTotal: 188.98,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    createdAt: new Date().toISOString()
  }
];

const initialPayment = {
  key: 'global_payment_settings',
  stripe: { enabled: true, publishableKey: 'pk_test_sample', secretKey: 'sk_test_sample', isLive: false },
  paypal: { enabled: true, clientId: 'sb-client-id', secretKey: 'sb-secret', isLive: false },
  cod: { enabled: true, extraFee: 0, maxOrderAmount: 1000 },
  currency: 'USD',
  currencySymbol: '$'
};

class LocalDataStore {
  constructor() {
    this.files = {
      categories: path.join(DATA_DIR, 'categories.json'),
      products: path.join(DATA_DIR, 'products.json'),
      users: path.join(DATA_DIR, 'users.json'),
      orders: path.join(DATA_DIR, 'orders.json'),
      cms: path.join(DATA_DIR, 'cms.json'),
      payments: path.join(DATA_DIR, 'payments.json'),
      variations: path.join(DATA_DIR, 'variations.json')
    };
    this.init();
  }

  init() {
    if (!fs.existsSync(this.files.categories)) fs.writeFileSync(this.files.categories, JSON.stringify(initialCategories, null, 2));
    if (!fs.existsSync(this.files.products)) fs.writeFileSync(this.files.products, JSON.stringify(initialProducts, null, 2));
    if (!fs.existsSync(this.files.users)) fs.writeFileSync(this.files.users, JSON.stringify(initialUsers, null, 2));
    if (!fs.existsSync(this.files.orders)) fs.writeFileSync(this.files.orders, JSON.stringify(initialOrders, null, 2));
    if (!fs.existsSync(this.files.cms)) fs.writeFileSync(this.files.cms, JSON.stringify(initialCMS, null, 2));
    if (!fs.existsSync(this.files.payments)) fs.writeFileSync(this.files.payments, JSON.stringify(initialPayment, null, 2));
    if (!fs.existsSync(this.files.variations)) fs.writeFileSync(this.files.variations, JSON.stringify([], null, 2));
  }

  read(collection) {
    try {
      const data = fs.readFileSync(this.files[collection], 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  write(collection, data) {
    fs.writeFileSync(this.files[collection], JSON.stringify(data, null, 2));
  }
}

export const dbStore = new LocalDataStore();
export const isMongoConnected = () => mongoose.connection.readyState === 1;

