export const buildDateFilter = (rangeType, startDate, endDate) => {
  const now = new Date();
  
  if (rangeType === 'today') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return { $gte: startOfToday, $lte: endOfToday };
  }
  
  if (rangeType === 'yesterday') {
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    return { $gte: startOfYesterday, $lte: endOfYesterday };
  }
  
  if (rangeType === 'custom' && (startDate || endDate)) {
    const filter = {};
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      filter.$gte = s;
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      filter.$lte = e;
    }
    return Object.keys(filter).length > 0 ? filter : null;
  }
  
  return null;
};

