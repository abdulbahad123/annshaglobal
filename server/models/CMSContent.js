import mongoose from 'mongoose';

const cmsContentSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'homepage_config' },

  announcementBar: {
    enabled: { type: Boolean, default: true },
    shippingText: { type: String, default: 'Free Shipping on Orders Above $50' },
    returnsText: { type: String, default: 'Easy Returns Within 7 Days' },
    supportText: { type: String, default: '24/7 Customer Support' },
    socialLinks: {
      facebook: { type: String, default: '#' },
      instagram: { type: String, default: '#' },
      youtube: { type: String, default: '#' },
      pinterest: { type: String, default: '#' }
    }
  },

  heroBanners: [{
    tagline: { type: String, default: 'PREMIUM COLLECTION' },
    title: { type: String, default: 'Care, Style and Home, All in One Place.' },
    subtitle: { type: String, default: 'Discover Premium Products with Unbeatable Deals.' },
    buttonText: { type: String, default: 'Shop Now' },
    buttonLink: { type: String, default: '/shop' },
    imageUrl: { type: String, default: '' },
    badgeText: { type: String, default: 'Live Beautifully' }
  }],

  valueProps: [{
    title: { type: String, default: 'Free Shipping' },
    subtitle: { type: String, default: 'On All Orders' },
    icon: { type: String, default: 'truck' }
  }],

  promoBanners: {
    banner1: {
      title: { type: String, default: 'Fashion Sale Up to 70% OFF' },
      subtitle: { type: String, default: 'Step into style' },
      buttonText: { type: String, default: 'Shop the Sale' },
      buttonLink: { type: String, default: '/shop?category=fashion' },
      imageUrl: { type: String, default: '' }
    },
    banner2: {
      title: { type: String, default: 'Smart Home Smarter Living Up to 50% OFF' },
      subtitle: { type: String, default: 'Modern comfort' },
      buttonText: { type: String, default: 'Shop Smart' },
      buttonLink: { type: String, default: '/shop?category=home' },
      imageUrl: { type: String, default: '' }
    }
  },

  brands: [{
    name: { type: String, required: true },
    logoUrl: { type: String, required: true }
  }],

  footer: {
    aboutText: { type: String, default: 'Your one-stop destination for premium products and unique finds.' },
    playStoreLink: { type: String, default: '#' },
    appStoreLink: { type: String, default: '#' },
    copyrightText: { type: String, default: '© 2025 Annsha Global. All rights reserved.' }
  }
}, { strict: false, timestamps: true });

export default mongoose.model('CMSContent', cmsContentSchema);

