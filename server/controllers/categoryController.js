import Category from '../models/Category.js';
import Product from '../models/Product.js';
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

export const getCategories = async (req, res, next) => {
  try {
    if (isMongoConnected()) {
      const categories = await Category.find({ isActive: true })
        .populate('parentCategory', 'name slug')
        .sort({ orderIndex: 1, name: 1 });
      return res.status(200).json({ success: true, count: categories.length, categories });
    }

    let categories = dbStore.read('categories').filter(c => c.isActive !== false);
    categories.sort((a, b) => (Number(a.orderIndex) || 0) - (Number(b.orderIndex) || 0));
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (err) {
    next(err);
  }
};

export const getAllCategoriesAdmin = async (req, res, next) => {
  try {
    if (isMongoConnected()) {
      const categories = await Category.find()
        .populate('parentCategory', 'name slug')
        .sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: categories.length, categories });
    }

    const categories = dbStore.read('categories');
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, parentCategory, orderIndex } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

    const slug = slugify(name);
    let image = req.body.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80';
    if (req.processedImage) {
      image = req.processedImage.url;
    }

    if (isMongoConnected()) {
      const existing = await Category.findOne({ slug });
      if (existing) return res.status(409).json({ success: false, message: 'Category with this name already exists.' });
      const category = await Category.create({
        name,
        slug,
        description: description || '',
        parentCategory: parentCategory || null,
        image,
        orderIndex: orderIndex ? parseInt(orderIndex, 10) : 0
      });
      return res.status(201).json({ success: true, message: 'Category created successfully.', category });
    }

    const categories = dbStore.read('categories');
    if (categories.find(c => c.slug === slug)) {
      return res.status(409).json({ success: false, message: 'Category with this name already exists.' });
    }

    const newCategory = {
      _id: `cat_${Date.now()}`,
      name,
      slug,
      description: description || '',
      parentCategory: parentCategory || null,
      image,
      orderIndex: orderIndex ? parseInt(orderIndex, 10) : categories.length + 1,
      productCount: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    categories.push(newCategory);
    dbStore.write('categories', categories);

    res.status(201).json({ success: true, message: 'Category created successfully.', category: newCategory });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, description, parentCategory, orderIndex, isActive } = req.body;

    let image = req.body.image;
    if (req.processedImage) {
      image = req.processedImage.url;
    }

    if (isMongoConnected()) {
      const category = await Category.findById(id);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

      if (name) {
        category.name = name;
        category.slug = slugify(name);
      }
      if (description !== undefined) category.description = description;
      if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
      if (orderIndex !== undefined) category.orderIndex = parseInt(orderIndex, 10);
      if (isActive !== undefined) category.isActive = isActive;
      if (image) category.image = image;

      await category.save();
      return res.status(200).json({ success: true, message: 'Category updated successfully.', category });
    }

    const categories = dbStore.read('categories');
    const category = categories.find(c => String(c._id) === String(id));
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    if (name) {
      category.name = name;
      category.slug = slugify(name);
    }
    if (description !== undefined) category.description = description;
    if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
    if (orderIndex !== undefined) category.orderIndex = parseInt(orderIndex, 10);
    if (isActive !== undefined) category.isActive = isActive;
    if (image) category.image = image;

    dbStore.write('categories', categories);
    res.status(200).json({ success: true, message: 'Category updated successfully.', category });
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (isMongoConnected()) {
      const category = await Category.findById(id);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
      const attachedProducts = await Product.countDocuments({ category: category._id });
      if (attachedProducts > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete: ${attachedProducts} products are currently linked to this category.`
        });
      }
      await Category.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Category deleted successfully.' });
    }

    let categories = dbStore.read('categories');
    const category = categories.find(c => String(c._id) === String(id));
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    const products = dbStore.read('products');
    const attached = products.filter(p => String(p.category) === String(id));
    if (attached.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${attached.length} products are currently linked to this category.`
      });
    }

    categories = categories.filter(c => String(c._id) !== String(id));
    dbStore.write('categories', categories);

    res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
