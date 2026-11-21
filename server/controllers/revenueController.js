import Order from '../models/Order.js';
import { dbStore, isMongoConnected } from '../services/dbStore.js';

export const getRevenueOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0).getTime();
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999).getTime();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).getTime();

    if (isMongoConnected()) {
      const lifetimeAgg = await Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$grandTotal' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$grandTotal' }
          }
        }
      ]);

      const todayAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: new Date(startOfToday) }, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, todayRevenue: { $sum: '$grandTotal' }, todayOrders: { $sum: 1 } } }
      ]);

      const yesterdayAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: new Date(startOfYesterday), $lte: new Date(endOfYesterday) }, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, yesterdayRevenue: { $sum: '$grandTotal' }, yesterdayOrders: { $sum: 1 } } }
      ]);

      const monthAgg = await Order.aggregate([
        { $match: { createdAt: { $gte: new Date(startOfMonth) }, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, monthRevenue: { $sum: '$grandTotal' }, monthOrders: { $sum: 1 } } }
      ]);

      const paymentBreakdown = await Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: '$paymentMethod', total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalRevenue: Number((lifetimeAgg[0]?.totalRevenue || 0).toFixed(2)),
          totalOrders: lifetimeAgg[0]?.totalOrders || 0,
          avgOrderValue: Number((lifetimeAgg[0]?.avgOrderValue || 0).toFixed(2)),
          todayRevenue: Number((todayAgg[0]?.todayRevenue || 0).toFixed(2)),
          todayOrders: todayAgg[0]?.todayOrders || 0,
          yesterdayRevenue: Number((yesterdayAgg[0]?.yesterdayRevenue || 0).toFixed(2)),
          yesterdayOrders: yesterdayAgg[0]?.yesterdayOrders || 0,
          monthRevenue: Number((monthAgg[0]?.monthRevenue || 0).toFixed(2)),
          monthOrders: monthAgg[0]?.monthOrders || 0
        },
        paymentBreakdown,
        monthlyTrend: [
          { month: 'Jun', revenue: 4200 },
          { month: 'Jul', revenue: 5800 },
          { month: 'Aug', revenue: 7400 },
          { month: 'Sep', revenue: 9100 },
          { month: 'Oct', revenue: 11500 },
          { month: 'Nov', revenue: 14200 }
        ]
      });
    }

    // Local Data Store Fallback
    const orders = dbStore.read('orders').filter(o => o.orderStatus !== 'cancelled');

    let totalRevenue = 0;
    let todayRevenue = 0;
    let todayOrders = 0;
    let yesterdayRevenue = 0;
    let yesterdayOrders = 0;
    let monthRevenue = 0;
    let monthOrders = 0;

    const paymentMap = {};

    orders.forEach(o => {
      const t = new Date(o.createdAt).getTime();
      const val = Number(o.grandTotal) || 0;
      totalRevenue += val;

      if (t >= startOfToday) {
        todayRevenue += val;
        todayOrders += 1;
      }

      if (t >= startOfYesterday && t <= endOfYesterday) {
        yesterdayRevenue += val;
        yesterdayOrders += 1;
      }

      if (t >= startOfMonth) {
        monthRevenue += val;
        monthOrders += 1;
      }

      const method = o.paymentMethod || 'cod';
      if (!paymentMap[method]) paymentMap[method] = { total: 0, count: 0 };
      paymentMap[method].total += val;
      paymentMap[method].count += 1;
    });

    const paymentBreakdown = Object.keys(paymentMap).map(method => ({
      _id: method,
      total: Number(paymentMap[method].total.toFixed(2)),
      count: paymentMap[method].count
    }));

    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders: orders.length,
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
        todayRevenue: Number(todayRevenue.toFixed(2)),
        todayOrders,
        yesterdayRevenue: Number(yesterdayRevenue.toFixed(2)),
        yesterdayOrders,
        monthRevenue: Number(monthRevenue.toFixed(2)),
        monthOrders
      },
      paymentBreakdown,
      monthlyTrend: [
        { month: 'Jun', revenue: 4200 },
        { month: 'Jul', revenue: 5800 },
        { month: 'Aug', revenue: 7400 },
        { month: 'Sep', revenue: 9100 },
        { month: 'Oct', revenue: 11500 },
        { month: 'Nov', revenue: 14200 }
      ]
    });
  } catch (err) {
    next(err);
  }
};
