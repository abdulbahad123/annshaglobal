import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { buildDateFilter } from '../utils/dateFilter.js';
import { dbStore, isMongoConnected } from '../services/dbStore.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod = 'cod' } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
    }

    let subtotal = 0;
    const verifiedItems = [];

    if (isMongoConnected()) {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.title}` });
        if (product.stock < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock for "${product.title}".` });
        }
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        verifiedItems.push({
          product: product._id,
          title: product.title,
          image: product.images[0] || '',
          price: product.price,
          quantity: item.quantity,
          total: itemTotal
        });
        product.stock -= item.quantity;
        await product.save();
      }

      const shippingFee = subtotal > 50 ? 0 : 5.00;
      const tax = Number((subtotal * 0.05).toFixed(2));
      const grandTotal = Number((subtotal + shippingFee + tax).toFixed(2));
      const orderNumber = `AG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const order = await Order.create({
        orderNumber,
        customer: req.user._id,
        customerName: req.user.name,
        customerEmail: req.user.email,
        items: verifiedItems,
        shippingAddress,
        subtotal,
        shippingFee,
        tax,
        grandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        orderStatus: 'pending'
      });

      await User.findByIdAndUpdate(req.user._id, { $inc: { totalOrders: 1, totalSpent: grandTotal } });
      return res.status(201).json({ success: true, message: 'Order placed successfully!', order });
    }

    // Local Data Store Fallback
    const products = dbStore.read('products');
    for (const item of items) {
      const product = products.find(p => String(p._id) === String(item.product));
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.title}` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for "${product.title}".` });
      }
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      verifiedItems.push({
        product: product._id,
        title: product.title,
        image: product.images?.[0] || '',
        price: product.price,
        quantity: item.quantity,
        total: itemTotal
      });
      product.stock -= item.quantity;
    }
    dbStore.write('products', products);

    const shippingFee = subtotal > 50 ? 0 : 5.00;
    const tax = Number((subtotal * 0.05).toFixed(2));
    const grandTotal = Number((subtotal + shippingFee + tax).toFixed(2));
    const orderNumber = `AG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = {
      _id: `ord_${Date.now()}`,
      orderNumber,
      customer: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      items: verifiedItems,
      shippingAddress,
      subtotal,
      shippingFee,
      tax,
      grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    const orders = dbStore.read('orders');
    orders.unshift(newOrder);
    dbStore.write('orders', orders);

    // Update user stats
    const users = dbStore.read('users');
    const u = users.find(usr => String(usr._id) === String(req.user._id));
    if (u) {
      u.totalOrders = (u.totalOrders || 0) + 1;
      u.totalSpent = Number(((u.totalSpent || 0) + grandTotal).toFixed(2));
      dbStore.write('users', users);
    }

    res.status(201).json({ success: true, message: 'Order placed successfully!', order: newOrder });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    if (isMongoConnected()) {
      const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: orders.length, orders });
    }

    const orders = dbStore.read('orders').filter(o => String(o.customer) === String(req.user._id));
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      paymentStatus,
      rangeType,
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isMongoConnected()) {
      const query = {};
      if (search) {
        query.$or = [
          { orderNumber: { $regex: search, $options: 'i' } },
          { customerName: { $regex: search, $options: 'i' } },
          { customerEmail: { $regex: search, $options: 'i' } }
        ];
      }
      if (status && status !== 'all') query.orderStatus = status;
      if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;

      const dateFilter = buildDateFilter(rangeType, startDate, endDate);
      if (dateFilter) query.createdAt = dateFilter;

      const total = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        orders
      });
    }

    // Local Data Store Fallback
    let orders = dbStore.read('orders');

    if (search) {
      const s = search.toLowerCase();
      orders = orders.filter(o =>
        o.orderNumber.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.customerEmail.toLowerCase().includes(s)
      );
    }

    if (status && status !== 'all') {
      orders = orders.filter(o => o.orderStatus === status);
    }

    if (paymentStatus && paymentStatus !== 'all') {
      orders = orders.filter(o => o.paymentStatus === paymentStatus);
    }

    if (rangeType === 'today') {
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      orders = orders.filter(o => new Date(o.createdAt).getTime() >= startOfToday);
    } else if (rangeType === 'yesterday') {
      const now = new Date();
      const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0).getTime();
      const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59).getTime();
      orders = orders.filter(o => {
        const t = new Date(o.createdAt).getTime();
        return t >= startOfYesterday && t <= endOfYesterday;
      });
    } else if (rangeType === 'custom' && (startDate || endDate)) {
      if (startDate) {
        const s = new Date(startDate).setHours(0, 0, 0, 0);
        orders = orders.filter(o => new Date(o.createdAt).getTime() >= s);
      }
      if (endDate) {
        const e = new Date(endDate).setHours(23, 59, 59, 999);
        orders = orders.filter(o => new Date(o.createdAt).getTime() <= e);
      }
    }

    const total = orders.length;
    const paginated = orders.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders: paginated
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status, paymentStatus } = req.body;

    if (isMongoConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
      if (status) {
        order.orderStatus = status;
        if (status === 'delivered') order.deliveredAt = new Date();
        if (status === 'cancelled') order.cancelledAt = new Date();
      }
      if (paymentStatus) order.paymentStatus = paymentStatus;
      await order.save();
      return res.status(200).json({ success: true, message: 'Order status updated successfully.', order });
    }

    const orders = dbStore.read('orders');
    const order = orders.find(o => String(o._id) === String(id));
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (status) {
      order.orderStatus = status;
      if (status === 'delivered') order.deliveredAt = new Date().toISOString();
      if (status === 'cancelled') order.cancelledAt = new Date().toISOString();
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;

    dbStore.write('orders', orders);
    res.status(200).json({ success: true, message: 'Order status updated successfully.', order });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (isMongoConnected()) {
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
      return res.status(200).json({ success: true, order });
    }

    const orders = dbStore.read('orders');
    const order = orders.find(o => String(o._id) === String(id));
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};
