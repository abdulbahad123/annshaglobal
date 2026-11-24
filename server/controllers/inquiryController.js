import Inquiry from '../models/Inquiry.js';
import { isMongoConnected } from '../services/dbStore.js';
import fs from 'fs';
import path from 'path';

const inquiriesJsonPath = path.join(process.cwd(), 'data', 'inquiries.json');

const readLocalInquiries = () => {
  try {
    if (fs.existsSync(inquiriesJsonPath)) {
      return JSON.parse(fs.readFileSync(inquiriesJsonPath, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading inquiries.json:', e);
  }
  return [];
};

const writeLocalInquiries = (data) => {
  try {
    const dir = path.dirname(inquiriesJsonPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(inquiriesJsonPath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error writing inquiries.json:', e);
  }
};

// Customer submit inquiry: POST /api/v1/inquiries
export const createInquiry = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || 'Storefront Inquiry').trim(),
      message: message.trim(),
      status: 'unread'
    };

    if (isMongoConnected()) {
      const inq = new Inquiry(payload);
      await inq.save();
      return res.status(201).json({
        success: true,
        message: 'Your inquiry has been received! Our concierge team will reply within 24 hours.',
        inquiry: inq
      });
    }

    const list = readLocalInquiries();
    const newInq = {
      _id: 'inq_' + Date.now(),
      ...payload,
      createdAt: new Date().toISOString()
    };
    list.unshift(newInq);
    writeLocalInquiries(list);

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been received! Our concierge team will reply within 24 hours.',
      inquiry: newInq
    });
  } catch (err) {
    next(err);
  }
};

// Admin get inquiries: GET /api/v1/inquiries
export const getAllInquiries = async (req, res, next) => {
  try {
    const { search = '', status = 'All' } = req.query;

    if (isMongoConnected()) {
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ];
      }
      if (status && status !== 'All') query.status = status;

      const inquiries = await Inquiry.find(query).sort('-createdAt');
      const unreadCount = await Inquiry.countDocuments({ status: 'unread' });
      return res.status(200).json({ success: true, inquiries, unreadCount, total: inquiries.length });
    }

    let list = readLocalInquiries();
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(item =>
        item.name.toLowerCase().includes(s) ||
        item.email.toLowerCase().includes(s) ||
        (item.subject && item.subject.toLowerCase().includes(s)) ||
        item.message.toLowerCase().includes(s)
      );
    }
    if (status && status !== 'All') {
      list = list.filter(item => item.status === status);
    }

    const unreadCount = list.filter(i => i.status === 'unread').length;
    res.status(200).json({ success: true, inquiries: list, unreadCount, total: list.length });
  } catch (err) {
    next(err);
  }
};

// Admin update status / reply notes: PUT /api/v1/inquiries/:id
export const updateInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, replyNotes } = req.body;

    if (isMongoConnected()) {
      const inq = await Inquiry.findById(id);
      if (!inq) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
      if (status) inq.status = status;
      if (replyNotes !== undefined) inq.replyNotes = replyNotes;
      await inq.save();
      return res.status(200).json({ success: true, message: 'Inquiry updated successfully.', inquiry: inq });
    }

    const list = readLocalInquiries();
    const item = list.find(i => String(i._id) === String(id));
    if (!item) return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    if (status) item.status = status;
    if (replyNotes !== undefined) item.replyNotes = replyNotes;
    writeLocalInquiries(list);

    res.status(200).json({ success: true, message: 'Inquiry updated successfully.', inquiry: item });
  } catch (err) {
    next(err);
  }
};

// Admin delete inquiry: DELETE /api/v1/inquiries/:id
export const deleteInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      await Inquiry.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Inquiry removed.' });
    }

    let list = readLocalInquiries();
    list = list.filter(i => String(i._id) !== String(id));
    writeLocalInquiries(list);

    res.status(200).json({ success: true, message: 'Inquiry removed.' });
  } catch (err) {
    next(err);
  }
};
