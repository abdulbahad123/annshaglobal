import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import CMSContent from './models/CMSContent.js';
import PaymentSetting from './models/PaymentSetting.js';

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seeding] Connected to database. Clearing existing records...');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await CMSContent.deleteMany({});
    await PaymentSetting.deleteMany({});

    console.log('[Seeding] Creating Admin and Customers with Geolocation...');

    // 1. Admin Account
    const admin = await User.create({
      name: 'Annsha Administrator',
      email: 'admin@annshaglobal.com',
      password: 'adminPassword123!',
      role: 'admin',
      phone: '+1 234 567 8900',
      country: 'United States',
      countryCode: 'US',
      city: 'New York'
    });

    // 2. Demo Customers from different countries (as requested in Dashboard Geolocation)
    const customers = await User.create([
      {
        name: 'Sophia Laurent',
        email: 'sophia@example.com',
        password: 'customerPass123!',
        role: 'customer',
        phone: '+33 6 12 34 56 78',
        country: 'France',
        countryCode: 'FR',
        city: 'Paris',
        totalOrders: 3,
        totalSpent: 429.50,
        createdAt: new Date()
      },
      {
        name: 'Alexander Wright',
        email: 'alex@example.com',
        password: 'customerPass123!',
        role: 'customer',
        phone: '+44 7911 123456',
        country: 'United Kingdom',
        countryCode: 'GB',
        city: 'London',
        totalOrders: 2,
        totalSpent: 189.98,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
      },
      {
        name: 'Elena Rostova',
        email: 'elena@example.com',
        password: 'customerPass123!',
        role: 'customer',
        phone: '+49 151 23456789',
        country: 'Germany',
        countryCode: 'DE',
        city: 'Berlin',
        totalOrders: 4,
        totalSpent: 620.00,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
      },
      {
        name: 'Tariq Al-Mansoor',
        email: 'tariq@example.com',
        password: 'customerPass123!',
        role: 'customer',
        phone: '+971 50 123 4567',
        country: 'United Arab Emirates',
        countryCode: 'AE',
        city: 'Dubai',
        totalOrders: 5,
        totalSpent: 1250.00,
        createdAt: new Date()
      },
      {
        name: 'Mei Ling Chen',
        email: 'meiling@example.com',
        password: 'customerPass123!',
        role: 'customer',
        phone: '+65 9123 4567',
        country: 'Singapore',
        countryCode: 'SG',
        city: 'Singapore',
        totalOrders: 1,
        totalSpent: 79.99,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('[Seeding] Creating Categories matching reference design...');

    // 3. Categories from Reference Image
    const categories = await Category.create([
      {
        name: 'Beauty & Personal Care',
        slug: 'beauty-personal-care',
        description: 'Luxury skincare, fragrances and personal care essentials',
        image: '/images/categories/beauty-care.webp',
        orderIndex: 1
      },
      {
        name: 'Electronics & Gadgets',
        slug: 'electronics-gadgets',
        description: 'Smart watches, wireless headphones and modern tech',
        image: '/images/categories/electronics.webp',
        orderIndex: 2
      },
      {
        name: 'Jewellery & Accessories',
        slug: 'jewellery-accessories',
        description: 'Elegantly crafted gold, silver and gemstone accessories',
        image: '/images/categories/jewellery.webp',
        orderIndex: 3
      },
      {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Refined decor, premium seating and cozy accents',
        image: '/images/categories/home-living.webp',
        orderIndex: 4
      },
      {
        name: 'Books & Media',
        slug: 'books-media',
        description: 'Bestselling titles, stationery and premium journals',
        image: '/images/categories/books-media.webp',
        orderIndex: 5
      },
      {
        name: 'Gifts & More',
        slug: 'gifts-more',
        description: 'Thoughtful luxury gift sets and celebration boxes',
        image: '/images/categories/gifts-more.webp',
        orderIndex: 6
      }
    ]);

    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c._id; });

    console.log('[Seeding] Creating Products matching reference image...');

    // 4. Products directly from the design mockup
    const products = await Product.create([
      {
        title: 'Nike Air Force 1 Sneakers',
        slug: 'nike-air-force-1-sneakers',
        sku: 'AG-NK-101',
        description: 'Timeless style with premium leather construction and lightweight Air cushioning for all-day luxury comfort.',
        subtitle: 'Timeless style with premium leather construction and lightweight Air cushioning',
        category: catMap['electronics-gadgets'],
        price: 69.99,
        comparePrice: 89.99,
        stock: 45,
        rating: 4.5,
        numReviews: 128,
        badge: 'todays_deals',
        images: ['/images/products/nike-air-force-1.webp'],
        orderIndex: 1,
        weight: '0.75 kg',
        dimensions: '25 x 15 x 10 cm',
        material: 'Premium Leather',
        features: [
          'Premium high-grade materials & craftsmanship',
          'Engineered for long-lasting luxury & durability',
          'Comfortable, ergonomic & timeless design'
        ],
        variants: [
          { name: 'Beige', color: 'Beige', hex: '#E4CFBA', image: '/images/products/nike-air-force-1.webp' },
          { name: 'Purple', color: 'Purple', hex: '#C2A5D8', image: '/images/products/nike-air-force-1.webp' },
          { name: 'Black', color: 'Black', hex: '#2B2B2B', image: '/images/products/nike-air-force-1.webp' },
          { name: 'Pink', color: 'Pink', hex: '#F3A7BD', image: '/images/products/nike-air-force-1.webp' }
        ],
        sizes: ['Standard', 'Medium', 'Large'],
        isFeatured: true
      },
      {
        title: 'Smart Watch Series 7',
        slug: 'smart-watch-series-7',
        sku: 'AG-SW-202',
        description: 'Cutting-edge OLED retina display, ECG monitor, fitness tracking, and waterproof titanium chassis.',
        subtitle: 'Cutting-edge OLED retina display, ECG monitor and fitness tracking',
        category: catMap['electronics-gadgets'],
        price: 99.99,
        comparePrice: 129.99,
        stock: 30,
        rating: 4.5,
        numReviews: 104,
        badge: 'todays_deals',
        images: ['/images/products/smart-watch-series-7.webp'],
        orderIndex: 2,
        weight: '0.15 kg',
        dimensions: '44 x 38 x 10.7 mm',
        material: 'Titanium & Sapphire Glass',
        features: [
          'Always-On Retina OLED display with 1000 nits',
          'Blood Oxygen and ECG app with irregular rhythm notification',
          'Fast USB-C magnetic wireless charging'
        ],
        variants: [
          { name: 'Midnight Black', color: 'Black', hex: '#1C1C1E', image: '/images/products/smart-watch-series-7.webp' },
          { name: 'Gold Stainless', color: 'Gold', hex: '#D4AF37', image: '/images/products/smart-watch-series-7.webp' },
          { name: 'Silver Aluminum', color: 'Silver', hex: '#E5E5EA', image: '/images/products/smart-watch-series-7.webp' }
        ],
        sizes: ['41mm', '45mm'],
        isFeatured: true
      },
      {
        title: 'Premium Leather Handbag',
        slug: 'stylish-handbag',
        sku: 'AG-HB-303',
        description: 'Handcrafted genuine calfskin leather with polished gold hardware and versatile shoulder strap.',
        subtitle: 'Handcrafted genuine calfskin leather with polished gold hardware',
        category: catMap['jewellery-accessories'],
        price: 49.99,
        comparePrice: 79.99,
        stock: 22,
        rating: 4.5,
        numReviews: 77,
        badge: 'todays_deals',
        images: ['/images/products/stylish-handbag.webp', '/images/sliderimage1.webp'],
        orderIndex: 3,
        weight: '0.68 kg',
        dimensions: '28 x 20 x 12 cm',
        material: '100% Genuine Italian Calfskin',
        features: [
          'Hand-stitched full grain calfskin leather',
          '24k gold-plated brass lock mechanism and key fob',
          'Detachable cross-body shoulder strap'
        ],
        variants: [
          { name: 'Warm Beige', color: 'Beige', hex: '#D5BA98', image: '/images/products/stylish-handbag.webp' },
          { name: 'Lavender Purple', color: 'Purple', hex: '#B8A1D1', image: '/images/products/stylish-handbag.webp' },
          { name: 'Noir Black', color: 'Black', hex: '#1E1E1E', image: '/images/products/stylish-handbag.webp' },
          { name: 'Blush Pink', color: 'Pink', hex: '#F0B7CD', image: '/images/products/stylish-handbag.webp' }
        ],
        sizes: ['Mini', 'Medium', 'Grande'],
        isFeatured: true
      },
      {
        title: 'Luxury Perfume',
        slug: 'luxury-perfume',
        sku: 'AG-PF-404',
        description: 'An enchanting blend of warm amber, blooming jasmine, and delicate Madagascar vanilla.',
        subtitle: 'An enchanting blend of warm amber, blooming jasmine, and delicate Madagascar vanilla',
        category: catMap['beauty-personal-care'],
        price: 79.99,
        comparePrice: 99.99,
        stock: 60,
        rating: 4.5,
        numReviews: 57,
        badge: 'todays_deals',
        images: ['/images/products/luxury-perfume.webp'],
        orderIndex: 4,
        weight: '0.35 kg',
        dimensions: '15 x 8 x 8 cm',
        material: 'French Crystal Bottle with Gold Cap',
        features: [
          'Eau de Parfum concentration with 14+ hours longevity',
          'Sustainably harvested Grasse rose and vanilla notes',
          'Heavy crystal flacon with magnetic atomizer'
        ],
        variants: [
          { name: 'Rose Prestige', color: 'Rose', hex: '#E8A598', image: '/images/products/luxury-perfume.webp' },
          { name: 'Amber Royal', color: 'Amber', hex: '#C68B59', image: '/images/products/luxury-perfume.webp' }
        ],
        sizes: ['50ml', '100ml'],
        isFeatured: true
      },
      {
        title: 'Running Shoes',
        slug: 'running-shoes',
        sku: 'AG-RS-505',
        description: 'Engineered mesh upper with responsive foam midsole designed for distance performance.',
        subtitle: 'Engineered mesh upper with responsive foam midsole',
        category: catMap['electronics-gadgets'],
        price: 59.99,
        comparePrice: 89.99,
        stock: 18,
        rating: 4.5,
        numReviews: 68,
        badge: 'todays_deals',
        images: ['/images/products/running-shoes.webp'],
        orderIndex: 5,
        weight: '0.52 kg',
        dimensions: '30 x 18 x 12 cm',
        material: 'Breathable Flyknit & Zoom Foam',
        features: [
          'Ultra-lightweight aerodynamic silhouette',
          'Shock-absorbing high-rebound midsole',
          'Anti-slip waffle rubber outsole'
        ],
        variants: [
          { name: 'Ocean Blue', color: 'Blue', hex: '#2A52BE', image: '/images/products/running-shoes.webp' },
          { name: 'Volt Black', color: 'Black', hex: '#111111', image: '/images/products/running-shoes.webp' }
        ],
        sizes: ['US 8', 'US 9', 'US 10', 'US 11'],
        isFeatured: true
      },
      {
        title: 'Noise Cancelling Headphones',
        slug: 'noise-cancelling-headphones',
        sku: 'AG-HP-606',
        description: 'Industry-leading active noise cancellation with 40-hour battery life and spatial audio immersion.',
        subtitle: 'Industry-leading active noise cancellation with 40-hour battery life',
        category: catMap['electronics-gadgets'],
        price: 89.99,
        comparePrice: 129.99,
        stock: 35,
        rating: 4.5,
        numReviews: 71,
        badge: 'todays_deals',
        images: ['/images/products/noise-cancelling-headphones.webp'],
        orderIndex: 6,
        weight: '0.25 kg',
        dimensions: '20 x 18 x 8 cm',
        material: 'Anodized Aluminum & Memory Foam',
        features: [
          'Hybrid active noise cancellation with 6 microphones',
          'Hi-Res Audio Certified with 40mm beryllium drivers',
          'Multipoint Bluetooth 5.3 connection'
        ],
        variants: [
          { name: 'Midnight Navy', color: 'Navy', hex: '#1E293B', image: '/images/products/noise-cancelling-headphones.webp' },
          { name: 'Matte Silver', color: 'Silver', hex: '#94A3B8', image: '/images/products/noise-cancelling-headphones.webp' }
        ],
        sizes: ['Over-Ear'],
        isFeatured: true
      },
      // Additional items for other tabs
      {
        title: 'Gold Pendant Necklace',
        slug: 'gold-pendant-necklace',
        sku: 'AG-GP-707',
        description: '18k gold plated handcrafted delicate chain with solitaire cubic zirconia.',
        subtitle: '18k gold plated handcrafted delicate chain with solitaire pendant',
        category: catMap['jewellery-accessories'],
        price: 34.99,
        comparePrice: 49.99,
        stock: 25,
        rating: 4.8,
        numReviews: 89,
        badge: 'top_rated',
        images: ['/images/products/gold-pendant-necklace.webp'],
        orderIndex: 7,
        weight: '0.04 kg',
        dimensions: '45 cm chain length',
        material: '18K Yellow Gold Vermeil on Sterling Silver',
        features: [
          'Triple micro-plated in 18k yellow gold for lifetime luster',
          'Hypoallergenic, nickel-free & lead-free',
          'Secure lobster claw clasp with 5cm extension'
        ],
        variants: [
          { name: '18k Yellow Gold', color: 'Gold', hex: '#E5B842', image: '/images/products/gold-pendant-necklace.webp' },
          { name: 'Rose Gold', color: 'Rose Gold', hex: '#B76E79', image: '/images/products/gold-pendant-necklace.webp' }
        ],
        sizes: ['45cm', '50cm'],
        isFeatured: true
      },
      {
        title: 'Ceramic Table Lamp',
        slug: 'ceramic-table-lamp',
        sku: 'AG-CL-808',
        description: 'Minimalist beige textured ceramic body with warm linen fabric shade.',
        subtitle: 'Minimalist beige textured ceramic body with warm linen fabric shade',
        category: catMap['home-living'],
        price: 64.00,
        comparePrice: 85.00,
        stock: 15,
        rating: 4.9,
        numReviews: 42,
        badge: 'new_arrivals',
        images: ['/images/products/ceramic-table-lamp.webp'],
        orderIndex: 8,
        weight: '1.8 kg',
        dimensions: '35 x 20 x 20 cm',
        material: 'Hand-thrown Ceramic & Natural Linen',
        features: [
          'Handmade artisanal ceramic base with matte sand glaze',
          '3-way dimmable touch switch with warm LED included',
          'Braided cloth cord with gold accents'
        ],
        variants: [
          { name: 'Sand Beige', color: 'Beige', hex: '#D7C4B7', image: '/images/products/ceramic-table-lamp.webp' },
          { name: 'Terracotta', color: 'Terracotta', hex: '#E07A5F', image: '/images/products/ceramic-table-lamp.webp' }
        ],
        sizes: ['Small (35cm)', 'Large (48cm)'],
        isFeatured: true
      }
    ]);

    // Update product counts on categories
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat._id });
      cat.productCount = count;
      await cat.save();
    }

    console.log('[Seeding] Creating CMS Configuration...');

    // 5. Dynamic Website Editor Config matching design
    await CMSContent.create({
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
    });

    console.log('[Seeding] Creating Orders for Dashboard & Revenue Analytics...');

    // 6. Orders
    await Order.create([
      {
        orderNumber: 'AG-2026-10481',
        customer: customers[0]._id,
        customerName: customers[0].name,
        customerEmail: customers[0].email,
        items: [
          {
            product: products[0]._id,
            title: products[0].title,
            image: products[0].images[0],
            price: products[0].price,
            quantity: 1,
            total: products[0].price
          },
          {
            product: products[3]._id,
            title: products[3].title,
            image: products[3].images[0],
            price: products[3].price,
            quantity: 1,
            total: products[3].price
          }
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
        createdAt: new Date()
      },
      {
        orderNumber: 'AG-2026-10482',
        customer: customers[1]._id,
        customerName: customers[1].name,
        customerEmail: customers[1].email,
        items: [
          {
            product: products[1]._id,
            title: products[1].title,
            image: products[1].images[0],
            price: products[1].price,
            quantity: 1,
            total: products[1].price
          }
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
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        orderNumber: 'AG-2026-10483',
        customer: customers[3]._id,
        customerName: customers[3].name,
        customerEmail: customers[3].email,
        items: [
          {
            product: products[5]._id,
            title: products[5].title,
            image: products[5].images[0],
            price: products[5].price,
            quantity: 2,
            total: 179.98
          }
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
        createdAt: new Date()
      }
    ]);

    // 7. Payment Settings
    await PaymentSetting.create({
      key: 'global_payment_settings',
      stripe: { enabled: true, publishableKey: 'pk_test_sample', secretKey: 'sk_test_sample', isLive: false },
      paypal: { enabled: true, clientId: 'sb-client-id', secretKey: 'sb-secret', isLive: false },
      cod: { enabled: true, extraFee: 0, maxOrderAmount: 1000 },
      currency: 'USD',
      currencySymbol: '$'
    });

    console.log('====================================================');
    console.log(' SEEDING COMPLETE SUCCESSFULLY!');
    console.log(' Admin credentials:');
    console.log('   Email: admin@annshaglobal.com');
    console.log('   Password: adminPassword123!');
    console.log('====================================================');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedData();

