import User from '../models/User.js';
import Order from '../models/Order.js';
import { buildDateFilter } from '../utils/dateFilter.js';
import { dbStore, isMongoConnected } from '../services/dbStore.js';

export const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', rangeType, startDate, endDate } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isMongoConnected()) {
      const query = { role: 'customer' };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }
      const dateFilter = buildDateFilter(rangeType, startDate, endDate);
      if (dateFilter) query.createdAt = dateFilter;

      const total = await User.countDocuments(query);
      const customers = await User.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select('-password');

      return res.status(200).json({
        success: true,
        count: customers.length,
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        customers
      });
    }

    // Local Data Store Fallback
    let customers = dbStore.read('users').filter(u => u.role === 'customer');

    if (search) {
      const s = search.toLowerCase();
      customers = customers.filter(c =>
        (c.name && c.name.toLowerCase().includes(s)) ||
        (c.email && c.email.toLowerCase().includes(s)) ||
        (c.country && c.country.toLowerCase().includes(s)) ||
        (c.phone && c.phone.includes(s))
      );
    }

    if (rangeType === 'today') {
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      customers = customers.filter(c => new Date(c.createdAt).getTime() >= startOfToday);
    } else if (rangeType === 'yesterday') {
      const now = new Date();
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0).getTime();
      const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59).getTime();
      customers = customers.filter(c => {
        const t = new Date(c.createdAt).getTime();
        return t >= startOfYesterday && t <= endOfYesterday;
      });
    } else if (rangeType === 'custom' && (startDate || endDate)) {
      if (startDate) {
        const s = new Date(startDate).setHours(0, 0, 0, 0);
        customers = customers.filter(c => new Date(c.createdAt).getTime() >= s);
      }
      if (endDate) {
        const e = new Date(endDate).setHours(23, 59, 59, 999);
        customers = customers.filter(c => new Date(c.createdAt).getTime() <= e);
      }
    }

    const total = customers.length;
    const paginated = customers.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      success: true,
      count: paginated.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      customers: paginated
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerStats = async (req, res, next) => {
  try {
    if (isMongoConnected()) {
      const totalCustomers = await User.countDocuments({ role: 'customer' });
      const recentCustomers = await User.find({ role: 'customer' })
        .sort({ createdAt: -1 })
        .limit(6)
        .select('name email country countryCode city totalOrders totalSpent createdAt');

      const countryStats = await User.aggregate([
        { $match: { role: 'customer' } },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]);

      return res.status(200).json({
        success: true,
        totalCustomers,
        recentCustomers,
        countryStats
      });
    }

    // Local Data Store Fallback
    const customers = dbStore.read('users').filter(u => u.role === 'customer');
    const recentCustomers = [...customers].reverse().slice(0, 6);

    const countryMap = {};
    customers.forEach(c => {
      const country = c.country || 'Unknown';
      countryMap[country] = (countryMap[country] || 0) + 1;
    });

    const countryStats = Object.keys(countryMap).map(country => ({
      _id: country,
      count: countryMap[country]
    })).sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      totalCustomers: customers.length,
      recentCustomers,
      countryStats
    });
  } catch (err) {
    next(err);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (isMongoConnected()) {
      const customer = await User.findById(id).select('-password');
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
      const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, customer, orders });
    }

    const users = dbStore.read('users');
    const customer = users.find(u => String(u._id) === String(id));
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const orders = dbStore.read('orders').filter(o => String(o.customer) === String(id));
    res.status(200).json({ success: true, customer, orders });
  } catch (err) {
    next(err);
  }
};

export const toggleBlockCustomer = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (isMongoConnected()) {
      const customer = await User.findById(id);
      if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
      customer.isBlocked = !customer.isBlocked;
      await customer.save();
      return res.status(200).json({
        success: true,
        message: `Customer ${customer.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
        isBlocked: customer.isBlocked
      });
    }

    const users = dbStore.read('users');
    const customer = users.find(u => String(u._id) === String(id));
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    customer.isBlocked = !customer.isBlocked;
    dbStore.write('users', users);

    res.status(200).json({
      success: true,
      message: `Customer ${customer.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
      isBlocked: customer.isBlocked
    });
  } catch (err) {
    next(err);
  }
};
