import Variation from '../models/Variation.js';
import { dbStore, isMongoConnected } from '../services/dbStore.js';
import { v4 as uuidv4 } from 'uuid';

export const getVariations = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    if (isMongoConnected()) {
      const query = { isActive: true };
      if (category && category !== 'all') {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }
      const variations = await Variation.find(query).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: variations.length, variations });
    }

    let variations = dbStore.read('variations');
    if (!variations) variations = [];

    if (category && category !== 'all') {
      variations = variations.filter(v => 
        (v.category && v.category.toLowerCase() === category.toLowerCase()) ||
        (v.categorySlug && v.categorySlug.toLowerCase() === category.toLowerCase())
      );
    }
    if (search) {
      const s = search.toLowerCase();
      variations = variations.filter(v => 
        (v.name && v.name.toLowerCase().includes(s)) ||
        (v.category && v.category.toLowerCase().includes(s))
      );
    }

    res.status(200).json({ success: true, count: variations.length, variations });
  } catch (err) {
    next(err);
  }
};

export const getVariationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const variation = await Variation.findById(id);
      if (!variation) return res.status(404).json({ success: false, message: 'Variation not found.' });
      return res.status(200).json({ success: true, variation });
    }

    const variations = dbStore.read('variations') || [];
    const variation = variations.find(v => String(v._id) === String(id));
    if (!variation) return res.status(404).json({ success: false, message: 'Variation not found.' });

    res.status(200).json({ success: true, variation });
  } catch (err) {
    next(err);
  }
};

export const createVariation = async (req, res, next) => {
  try {
    const { name, category, categorySlug, subcategory, options } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and Category are required.' });
    }

    const cleanOptions = Array.isArray(options) ? options.map(opt => ({
      name: opt.name || 'Option',
      colorCode: opt.colorCode || opt.hex || '',
      hex: opt.colorCode || opt.hex || ''
    })) : [];

    if (isMongoConnected()) {
      const variation = await Variation.create({
        name,
        category,
        categorySlug: categorySlug || category.toLowerCase().replace(/\s+/g, '-'),
        subcategory: subcategory || '-',
        options: cleanOptions
      });
      return res.status(201).json({ success: true, message: 'Variation created successfully.', variation });
    }

    const variations = dbStore.read('variations') || [];
    const newVariation = {
      _id: `var_${uuidv4().substring(0, 8)}`,
      name,
      category,
      categorySlug: categorySlug || category.toLowerCase().replace(/\s+/g, '-'),
      subcategory: subcategory || '-',
      options: cleanOptions,
      createdAt: new Date().toISOString()
    };

    variations.unshift(newVariation);
    dbStore.write('variations', variations);

    res.status(201).json({ success: true, message: 'Variation created successfully.', variation: newVariation });
  } catch (err) {
    next(err);
  }
};

export const updateVariation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, categorySlug, subcategory, options } = req.body;

    const cleanOptions = Array.isArray(options) ? options.map(opt => ({
      name: opt.name || 'Option',
      colorCode: opt.colorCode || opt.hex || '',
      hex: opt.colorCode || opt.hex || ''
    })) : undefined;

    if (isMongoConnected()) {
      const updateData = {};
      if (name) updateData.name = name;
      if (category) updateData.category = category;
      if (categorySlug) updateData.categorySlug = categorySlug;
      if (subcategory !== undefined) updateData.subcategory = subcategory;
      if (cleanOptions) updateData.options = cleanOptions;

      const variation = await Variation.findByIdAndUpdate(id, updateData, { new: true });
      if (!variation) return res.status(404).json({ success: false, message: 'Variation not found.' });
      return res.status(200).json({ success: true, message: 'Variation updated successfully.', variation });
    }

    const variations = dbStore.read('variations') || [];
    const index = variations.findIndex(v => String(v._id) === String(id));
    if (index === -1) return res.status(404).json({ success: false, message: 'Variation not found.' });

    variations[index] = {
      ...variations[index],
      name: name !== undefined ? name : variations[index].name,
      category: category !== undefined ? category : variations[index].category,
      categorySlug: categorySlug !== undefined ? categorySlug : variations[index].categorySlug,
      subcategory: subcategory !== undefined ? subcategory : variations[index].subcategory,
      options: cleanOptions !== undefined ? cleanOptions : variations[index].options,
      updatedAt: new Date().toISOString()
    };

    dbStore.write('variations', variations);

    res.status(200).json({ success: true, message: 'Variation updated successfully.', variation: variations[index] });
  } catch (err) {
    next(err);
  }
};

export const deleteVariation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      await Variation.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Variation deleted successfully.' });
    }

    let variations = dbStore.read('variations') || [];
    variations = variations.filter(v => String(v._id) !== String(id));
    dbStore.write('variations', variations);

    res.status(200).json({ success: true, message: 'Variation deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

