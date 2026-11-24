import Subscriber from '../models/Subscriber.js';
import { isMongoConnected } from '../services/dbStore.js';
import fs from 'fs';
import path from 'path';

const subscribersJsonPath = path.join(process.cwd(), 'data', 'subscribers.json');

const readLocalSubscribers = () => {
  try {
    if (fs.existsSync(subscribersJsonPath)) {
      return JSON.parse(fs.readFileSync(subscribersJsonPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading subscribers.json:', e);
  }
  return [];
};

const writeLocalSubscribers = (data) => {
  try {
    const dir = path.dirname(subscribersJsonPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(subscribersJsonPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing subscribers.json:', e);
  }
};

// Public subscribe endpoint: POST /api/v1/subscribers
export const createSubscriber = async (req, res, next) => {
  try {
    const { email, source = 'storefront_footer' } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isMongoConnected()) {
      const existing = await Subscriber.findOne({ email: cleanEmail });
      if (existing) {
        if (existing.status === 'unsubscribed') {
          existing.status = 'active';
          await existing.save();
          return res.status(200).json({ success: true, message: 'Welcome back! Your newsletter subscription is re-activated.' });
        }
        return res.status(200).json({ success: true, message: 'You are already subscribed to our luxury newsletter!' });
      }

      const newSub = new Subscriber({ email: cleanEmail, source });
      await newSub.save();
      return res.status(201).json({ success: true, message: 'Thank you for subscribing! Check your inbox for exclusive boutique offers.', subscriber: newSub });
    }

    // Local JSON Fallback
    const list = readLocalSubscribers();
    const existing = list.find(s => s.email === cleanEmail);
    if (existing) {
      existing.status = 'active';
      writeLocalSubscribers(list);
      return res.status(200).json({ success: true, message: 'Welcome back! You are already subscribed to our luxury newsletter!' });
    }

    const newSub = {
      _id: 'sub_' + Date.now(),
      email: cleanEmail,
      status: 'active',
      source,
      createdAt: new Date().toISOString()
    };
    list.unshift(newSub);
    writeLocalSubscribers(list);

    res.status(201).json({ success: true, message: 'Thank you for subscribing! Check your inbox for exclusive boutique offers.', subscriber: newSub });
  } catch (err) {
    next(err);
  }
};

// Admin list subscribers: GET /api/v1/subscribers
export const getAllSubscribers = async (req, res, next) => {
  try {
    const { search = '', status = 'All' } = req.query;

    if (isMongoConnected()) {
      const query = {};
      if (search) query.email = { $regex: search, $options: 'i' };
      if (status && status !== 'All') query.status = status;

      const subscribers = await Subscriber.find(query).sort('-createdAt');
      return res.status(200).json({ success: true, subscribers, total: subscribers.length });
    }

    let list = readLocalSubscribers();
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(item => item.email.toLowerCase().includes(s));
    }
    if (status && status !== 'All') {
      list = list.filter(item => item.status === status);
    }

    res.status(200).json({ success: true, subscribers: list, total: list.length });
  } catch (err) {
    next(err);
  }
};

// Admin delete subscriber: DELETE /api/v1/subscribers/:id
export const deleteSubscriber = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      await Subscriber.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Subscriber removed successfully.' });
    }

    let list = readLocalSubscribers();
    list = list.filter(s => String(s._id) !== String(id));
    writeLocalSubscribers(list);

    res.status(200).json({ success: true, message: 'Subscriber removed successfully.' });
  } catch (err) {
    next(err);
  }
};
