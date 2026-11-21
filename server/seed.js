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
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80',
        orderIndex: 1
      },
      {
        name: 'Electronics & Gadgets',
        slug: 'electronics-gadgets',
        description: 'Smart watches, wireless headphones and modern tech',
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=80',
        orderIndex: 2
      },
      {
        name: 'Jewellery & Accessories',
        slug: 'jewellery-accessories',
        description: 'Elegantly crafted gold, silver and gemstone accessories',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
        orderIndex: 3
      },
      {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Refined decor, premium seating and cozy accents',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&auto=format&fit=crop&q=80',
        orderIndex: 4
      },
      {
        name: 'Books & Media',
        slug: 'books-media',
        description: 'Bestselling titles, stationery and premium journals',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
        orderIndex: 5
      },
      {
        name: 'Gifts & More',
        slug: 'gifts-more',
        description: 'Thoughtful luxury gift sets and celebration boxes',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=80',
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
        category: catMap['electronics-gadgets'],
        price: 69.99,
        comparePrice: 89.99,
        stock: 45,
        rating: 4.5,
        numReviews: 128,
        badge: 'todays_deals',
        images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80'],
        isFeatured: true
      },
      {
        title: 'Smart Watch Series 7',
        slug: 'smart-watch-series-7',
        sku: 'AG-SW-202',
        description: 'Cutting-edge OLED retina display, ECG monitor, fitness tracking, and waterproof titanium chassis.',
        category: catMap['electronics-gadgets'],
        price: 99.99,
        comparePrice: 129.99,
        stock: 30,
        rating: 4.5,
        numReviews: 104,
        badge: 'todays_deals',
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'],
        isFeatured: true
      },
      {
        title: 'Stylish Handbag',
        slug: 'stylish-handbag',
        sku: 'AG-HB-303',
        description: 'Handcrafted genuine calfskin leather with polished gold hardware and versatile shoulder strap.',
        category: catMap['jewellery-accessories'],
        price: 49.99,
        comparePrice: 79.99,
        stock: 22,
        rating: 4.5,
        numReviews: 77,
        badge: 'todays_deals',
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'],
        isFeatured: true
      },
      {
        title: 'Luxury Perfume',
        slug: 'luxury-perfume',
        sku: 'AG-PF-404',
        description: 'An enchanting blend of warm amber, blooming jasmine, and delicate Madagascar vanilla.',
        category: catMap['beauty-personal-care'],
        price: 79.99,
        comparePrice: 99.99,
        stock: 60,
        rating: 4.5,
        numReviews: 57,
        badge: 'todays_deals',
        images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80'],
        isFeatured: true
      },
      {
        title: 'Running Shoes',
        slug: 'running-shoes',
        sku: 'AG-RS-505',
        description: 'Engineered mesh upper with responsive foam midsole designed for distance performance.',
        category: catMap['electronics-gadgets'],
        price: 59.99,
        comparePrice: 89.99,
        stock: 18,
        rating: 4.5,
        numReviews: 68,
        badge: 'todays_deals',
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'],
        isFeatured: true
      },
      {
        title: 'Noise Cancelling Headphones',
        slug: 'noise-cancelling-headphones',
        sku: 'AG-HP-606',
        description: 'Industry-leading active noise cancellation with 40-hour battery life and spatial audio immersion.',
        category: catMap['electronics-gadgets'],
        price: 89.99,
        comparePrice: 129.99,
        stock: 35,
        rating: 4.5,
        numReviews: 71,
        badge: 'todays_deals',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
        isFeatured: true
      },
      // Additional items for other tabs
      {
        title: 'Gold Pendant Necklace',
        slug: 'gold-pendant-necklace',
        sku: 'AG-GP-707',
        description: '18k gold plated handcrafted delicate chain with solitaire cubic zirconia.',
        category: catMap['jewellery-accessories'],
        price: 34.99,
        comparePrice: 49.99,
        stock: 25,
        rating: 4.8,
        numReviews: 89,
        badge: 'top_rated',
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80'],
        isFeatured: true
      },
      {
        title: 'Ceramic Table Lamp',
        slug: 'ceramic-table-lamp',
        sku: 'AG-CL-808',
        description: 'Minimalist beige textured ceramic body with warm linen fabric shade.',
        category: catMap['home-living'],
        price: 64.00,
        comparePrice: 85.00,
        stock: 15,
        rating: 4.9,
        numReviews: 42,
        badge: 'new_arrivals',
        images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'],
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
          imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop&q=80',
          badgeText: 'Live Beautifully'
        }
      ],
      valueProps: [
        { title: 'Free Shipping', subtitle: 'On All Orders', icon: 'truck' },
        { title: 'Secure Payments', subtitle: '100% Secure', icon: 'shield-check' },
        { title: 'Easy Returns', subtitle: 'Within 7 Days', icon: 'rotate-ccw' },
        { title: 'Exclusive Offers', subtitle: 'Save More', icon: 'gift' }
      ],
      promoBanners: {
        banner1: {
          title: 'Fashion Sale Up to 70% OFF',
          subtitle: 'Step into style',
          buttonText: 'Shop the Sale',
          buttonLink: '/shop?category=jewellery-accessories',
          imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80'
        },
        banner2: {
          title: 'Smart Home Smarter Living Up to 50% OFF',
          subtitle: 'Modern comfort',
          buttonText: 'Shop Smart',
          buttonLink: '/shop?category=home-living',
          imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80'
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

