import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { dbStore, isMongoConnected } from '../services/dbStore.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      badge,
      search,
      sort = '-createdAt',
      minPrice,
      maxPrice
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isMongoConnected()) {
      const query = { isActive: true };
      if (category) {
        const cat = await Category.findOne({ $or: [{ slug: category }, { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }] });
        if (cat) query.category = cat._id;
      }
      if (badge && badge !== 'all') query.badge = badge;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } }
        ];
      }
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        products
      });
    }

    // Local Data Store Fallback
    let products = dbStore.read('products').filter(p => p.isActive !== false);
    const categories = dbStore.read('categories');

    // Populate category object
    products = products.map(p => {
      const cat = categories.find(c => String(c._id) === String(p.category) || c.slug === p.category);
      return { ...p, category: cat || { name: 'General', slug: 'general' } };
    });

    if (category) {
      products = products.filter(p => p.category?.slug === category || String(p.category?._id) === String(category));
    }

    if (badge && badge !== 'all') {
      products = products.filter(p => p.badge === badge);
    }

    if (search) {
      const s = search.toLowerCase();
      products = products.filter(p =>
        p.title.toLowerCase().includes(s) ||
        (p.description && p.description.toLowerCase().includes(s)) ||
        (p.sku && p.sku.toLowerCase().includes(s))
      );
    }

    if (minPrice) products = products.filter(p => p.price >= Number(minPrice));
    if (maxPrice) products = products.filter(p => p.price <= Number(maxPrice));

    // Sort by orderIndex ascending by default
    products.sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0));

    const total = products.length;
    const paginated = products.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products: paginated
    });
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    if (isMongoConnected()) {
      const product = await Product.findOne({ slug, isActive: true }).populate('category', 'name slug');
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
      return res.status(200).json({ success: true, product });
    }

    const products = dbStore.read('products');
    const categories = dbStore.read('categories');
    const product = products.find(p => p.slug === slug || String(p._id) === String(slug));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const cat = categories.find(c => String(c._id) === String(product.category));
    res.status(200).json({ success: true, product: { ...product, category: cat || { name: 'General', slug: 'general' } } });
  } catch (err) {
    next(err);
  }
};

export const getAllProductsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', category } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isMongoConnected()) {
      const query = {};
      if (search) {
        query.$or = [{ title: { $regex: search, $options: 'i' } }, { sku: { $regex: search, $options: 'i' } }];
      }
      if (category) query.category = category;

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        products
      });
    }

    let products = dbStore.read('products');
    const categories = dbStore.read('categories');

    products = products.map(p => {
      const cat = categories.find(c => String(c._id) === String(p.category));
      return { ...p, category: cat || { name: 'General', slug: 'general' } };
    });

    if (search) {
      const s = search.toLowerCase();
      products = products.filter(p => p.title.toLowerCase().includes(s) || (p.sku && p.sku.toLowerCase().includes(s)));
    }
    if (category) {
      products = products.filter(p => String(p.category?._id) === String(category) || p.category?.slug === category);
    }

    const total = products.length;
    const paginated = products.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      products: paginated
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      sku,
      description,
      shortDescription,
      subtitle,
      orderIndex,
      weight,
      dimensions,
      material,
      variants,
      sizes,
      features,
      category,
      price,
      comparePrice,
      stock,
      badge,
      rating,
      numReviews,
      isFeatured,
      images: rawImages
    } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ success: false, message: 'Title, price, and category are required.' });
    }

    const generatedSku = sku ? sku.toUpperCase() : `AG-${Math.floor(100000 + Math.random() * 900000)}`;
    const slug = `${slugify(title)}-${Math.floor(1000 + Math.random() * 9000)}`;

    let images = [];
    if (req.processedImages && req.processedImages.length > 0) {
      images = req.processedImages.map(img => img.url);
    } else if (req.processedImage) {
      images = [req.processedImage.url];
    } else if (rawImages) {
      images = Array.isArray(rawImages) ? rawImages : [rawImages];
    }

    if (images.length === 0) {
      images = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'];
    }

    if (isMongoConnected()) {
      const product = await Product.create({
        title,
        slug,
        sku: generatedSku,
        description: description || title,
        shortDescription: shortDescription || '',
        subtitle: subtitle || '',
        orderIndex: orderIndex !== undefined ? Number(orderIndex) : 0,
        weight: weight || '',
        dimensions: dimensions || '',
        material: material || '',
        variants: Array.isArray(variants) ? variants : (typeof variants === 'string' ? JSON.parse(variants || '[]') : []),
        sizes: Array.isArray(sizes) ? sizes : (typeof sizes === 'string' ? JSON.parse(sizes || '[]') : []),
        features: Array.isArray(features) ? features : (typeof features === 'string' ? JSON.parse(features || '[]') : []),
        category,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : 0,
        stock: stock ? Number(stock) : 10,
        images,
        badge: badge || 'none',
        rating: rating ? Number(rating) : 4.5,
        numReviews: numReviews ? Number(numReviews) : 12,
        isFeatured: isFeatured === 'true' || isFeatured === true
      });
      await Category.findByIdAndUpdate(category, { $inc: { productCount: 1 } });
      return res.status(201).json({ success: true, message: 'Product created successfully.', product });
    }

    // Local Data Store Fallback
    const products = dbStore.read('products');
    const newProduct = {
      _id: `prod_${Date.now()}`,
      title,
      slug,
      sku: generatedSku,
      description: description || title,
      shortDescription: shortDescription || '',
      subtitle: subtitle || '',
      orderIndex: orderIndex !== undefined ? Number(orderIndex) : 0,
      weight: weight || '',
      dimensions: dimensions || '',
      material: material || '',
      variants: Array.isArray(variants) ? variants : (typeof variants === 'string' ? JSON.parse(variants || '[]') : []),
      sizes: Array.isArray(sizes) ? sizes : (typeof sizes === 'string' ? JSON.parse(sizes || '[]') : []),
      features: Array.isArray(features) ? features : (typeof features === 'string' ? JSON.parse(features || '[]') : []),
      category,
      price: Number(price),
      comparePrice: comparePrice ? Number(comparePrice) : 0,
      stock: stock ? Number(stock) : 10,
      images,
      badge: badge || 'none',
      rating: rating ? Number(rating) : 4.5,
      numReviews: numReviews ? Number(numReviews) : 12,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    products.unshift(newProduct);
    dbStore.write('products', products);

    // Update category count in store
    const categories = dbStore.read('categories');
    const cat = categories.find(c => String(c._id) === String(category) || c.slug === category);
    if (cat) {
      cat.productCount = (cat.productCount || 0) + 1;
      dbStore.write('categories', categories);
    }

    res.status(201).json({ success: true, message: 'Product created successfully.', product: newProduct });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const {
      title,
      sku,
      description,
      shortDescription,
      subtitle,
      orderIndex,
      weight,
      dimensions,
      material,
      variants,
      sizes,
      features,
      category,
      price,
      comparePrice,
      stock,
      badge,
      rating,
      numReviews,
      isFeatured,
      isActive,
      images: rawImages
    } = req.body;

    let newImages = [];
    let isFullImagesList = false;
    if (rawImages !== undefined) {
      isFullImagesList = true;
      if (Array.isArray(rawImages)) {
        newImages = rawImages;
      } else if (typeof rawImages === 'string' && rawImages.startsWith('[')) {
        try { newImages = JSON.parse(rawImages); } catch (e) { newImages = [rawImages]; }
      } else if (rawImages) {
        newImages = [rawImages];
      }
    }

    if (req.processedImages && req.processedImages.length > 0) {
      const uploaded = req.processedImages.map(img => img.url);
      newImages = [...newImages, ...uploaded];
    } else if (req.processedImage) {
      newImages = [...newImages, req.processedImage.url];
    }

    if (isMongoConnected()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

      if (title) product.title = title;
      if (sku) product.sku = sku.toUpperCase();
      if (description) product.description = description;
      if (shortDescription !== undefined) product.shortDescription = shortDescription;
      if (subtitle !== undefined) product.subtitle = subtitle;
      if (orderIndex !== undefined) product.orderIndex = Number(orderIndex);
      if (weight !== undefined) product.weight = weight;
      if (dimensions !== undefined) product.dimensions = dimensions;
      if (material !== undefined) product.material = material;
      if (variants !== undefined) product.variants = Array.isArray(variants) ? variants : (typeof variants === 'string' ? JSON.parse(variants || '[]') : []);
      if (sizes !== undefined) product.sizes = Array.isArray(sizes) ? sizes : (typeof sizes === 'string' ? JSON.parse(sizes || '[]') : []);
      if (features !== undefined) product.features = Array.isArray(features) ? features : (typeof features === 'string' ? JSON.parse(features || '[]') : []);
      if (price !== undefined) product.price = Number(price);
      if (comparePrice !== undefined) product.comparePrice = Number(comparePrice);
      if (stock !== undefined) product.stock = Number(stock);
      if (badge) product.badge = badge;
      if (rating !== undefined) product.rating = Number(rating);
      if (numReviews !== undefined) product.numReviews = Number(numReviews);
      if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
      if (isActive !== undefined) product.isActive = isActive;

      if (category && category !== String(product.category)) {
        await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
        await Category.findByIdAndUpdate(category, { $inc: { productCount: 1 } });
        product.category = category;
      }

      if (isFullImagesList) {
        product.images = newImages;
      } else if (newImages.length > 0) {
        product.images = [...product.images, ...newImages];
      }

      await product.save();
      return res.status(200).json({ success: true, message: 'Product updated successfully.', product });
    }

    // Local Data Store Fallback
    const products = dbStore.read('products');
    const product = products.find(p => String(p._id) === String(id));
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    if (title) product.title = title;
    if (sku) product.sku = sku.toUpperCase();
    if (description) product.description = description;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (subtitle !== undefined) product.subtitle = subtitle;
    if (orderIndex !== undefined) product.orderIndex = Number(orderIndex);
    if (weight !== undefined) product.weight = weight;
    if (dimensions !== undefined) product.dimensions = dimensions;
    if (material !== undefined) product.material = material;
    if (variants !== undefined) product.variants = Array.isArray(variants) ? variants : (typeof variants === 'string' ? JSON.parse(variants || '[]') : []);
    if (sizes !== undefined) product.sizes = Array.isArray(sizes) ? sizes : (typeof sizes === 'string' ? JSON.parse(sizes || '[]') : []);
    if (features !== undefined) product.features = Array.isArray(features) ? features : (typeof features === 'string' ? JSON.parse(features || '[]') : []);
    if (price !== undefined) product.price = Number(price);
    if (comparePrice !== undefined) product.comparePrice = Number(comparePrice);
    if (stock !== undefined) product.stock = Number(stock);
    if (badge) product.badge = badge;
    if (rating !== undefined) product.rating = Number(rating);
    if (numReviews !== undefined) product.numReviews = Number(numReviews);
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isActive !== undefined) product.isActive = isActive;
    if (category) product.category = category;

    if (isFullImagesList) {
      product.images = newImages;
    } else if (newImages.length > 0) {
      product.images = [...product.images, ...newImages];
    }

    dbStore.write('products', products);
    res.status(200).json({ success: true, message: 'Product updated successfully.', product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (isMongoConnected()) {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
      await Category.findByIdAndUpdate(product.category, { $inc: { productCount: -1 } });
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Product deleted successfully.' });
    }

    let products = dbStore.read('products');
    products = products.filter(p => String(p._id) !== String(id));
    dbStore.write('products', products);

    res.status(200).json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

export const addProductReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const { id } = req.params;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide rating and review comment.' });
    }

    let product;
    if (isMongoConnected()) {
      product = await Product.findById(id) || await Product.findOne({ slug: id });
    } else {
      const products = dbStore.read('products');
      product = products.find(p => String(p._id) === String(id) || p.slug === id);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const review = {
      user: req.user?._id,
      userName: req.user?.name || 'Verified Customer',
      rating: Number(rating),
      title: title || '',
      comment: comment.trim(),
      isVerified: true,
      createdAt: new Date()
    };

    if (!product.reviews) product.reviews = [];
    product.reviews.unshift(review);

    const totalReviews = product.reviews.length;
    const avgRating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / totalReviews;

    product.numReviews = totalReviews;
    product.rating = Number(avgRating.toFixed(1));

    if (isMongoConnected()) {
      await product.save();
    } else {
      const products = dbStore.read('products');
      const idx = products.findIndex(p => String(p._id) === String(product._id));
      if (idx !== -1) products[idx] = product;
      dbStore.write('products', products);
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      review,
      rating: product.rating,
      numReviews: product.numReviews,
      reviews: product.reviews
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product;
    if (isMongoConnected()) {
      product = await Product.findById(id) || await Product.findOne({ slug: id });
    } else {
      const products = dbStore.read('products');
      product = products.find(p => String(p._id) === String(id) || p.slug === id);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({
      success: true,
      rating: product.rating,
      numReviews: product.numReviews || product.reviews?.length || 0,
      reviews: product.reviews || []
    });
  } catch (error) {
    next(error);
  }
};
