import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { buildDateFilter } from '../utils/dateFilter.js';
import { dbStore, isMongoConnected } from '../services/dbStore.js';

export const createOrder = async (req, res, next) => {
  try {
    const { 
      items, 
      shippingAddress, 
      paymentMethod = 'cod', 
      discountCode = '', 
      discount = 0,
      paymentTransactionId = ''
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine) {
      return res.status(400).json({ success: false, message: 'Complete shipping address is required.' });
    }

    const customerId = req.user?._id || null;
    const customerName = req.user?.name || shippingAddress.fullName || 'Guest Customer';
    const customerEmail = req.user?.email || shippingAddress.email || req.body.email || 'customer@annshaglobal.com';

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

      const shippingFee = subtotal > 500 ? 0 : 0; // Free shipping for luxury launch
      const tax = Number((subtotal * 0.05).toFixed(2));
      const discountNum = Number(discount) || 0;
      const grandTotal = Math.max(0, Number((subtotal + shippingFee + tax - discountNum).toFixed(2)));
      const orderNumber = `AG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const orderData = {
        orderNumber,
        customerName,
        customerEmail,
        items: verifiedItems,
        shippingAddress,
        subtotal,
        shippingFee,
        tax,
        discount: discountNum,
        grandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        paymentTransactionId: paymentTransactionId || '',
        orderStatus: 'pending'
      };
      if (customerId) {
        orderData.customer = customerId;
      }

      const order = await Order.create(orderData);

      if (customerId) {
        await User.findByIdAndUpdate(customerId, { $inc: { totalOrders: 1, totalSpent: grandTotal } });
      }
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

    const shippingFee = 0;
    const tax = Number((subtotal * 0.05).toFixed(2));
    const discountNum = Number(discount) || 0;
    const grandTotal = Math.max(0, Number((subtotal + shippingFee + tax - discountNum).toFixed(2)));
    const orderNumber = `AG-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = {
      _id: `ord_${Date.now()}`,
      orderNumber,
      customer: customerId,
      customerName,
      customerEmail,
      items: verifiedItems,
      shippingAddress,
      subtotal,
      shippingFee,
      tax,
      discount: discountNum,
      grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      paymentTransactionId: paymentTransactionId || '',
      orderStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    const orders = dbStore.read('orders') || [];
    orders.unshift(newOrder);
    dbStore.write('orders', orders);

    if (customerId) {
      const users = dbStore.read('users') || [];
      const u = users.find(usr => String(usr._id) === String(customerId));
      if (u) {
        u.totalOrders = (u.totalOrders || 0) + 1;
        u.totalSpent = (u.totalSpent || 0) + grandTotal;
        dbStore.write('users', users);
      }
    }

    return res.status(201).json({ success: true, message: 'Order placed successfully!', order: newOrder });
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
    const userEmail = req.user?.email ? req.user.email.toLowerCase().trim() : null;
    const userId = req.user?._id;

    if (isMongoConnected()) {
      const orConditions = [];
      if (userId) orConditions.push({ customer: userId });
      if (userEmail) orConditions.push({ customerEmail: { $regex: new RegExp(`^${userEmail}$`, 'i') } });

      const query = orConditions.length > 0 ? { $or: orConditions } : { customer: userId };
      const orders = await Order.find(query).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: orders.length, orders });
    }

    const allOrders = dbStore.read('orders') || [];
    const orders = allOrders.filter(o => 
      (userId && String(o.customer) === String(userId)) ||
      (userEmail && o.customerEmail && o.customerEmail.toLowerCase().trim() === userEmail)
    );
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
