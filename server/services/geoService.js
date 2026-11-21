import geoip from 'geoip-lite';

export const getClientLocation = (req) => {
  let ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // IPv6 localhost or local range handling
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      ip: ip || '127.0.0.1',
      country: 'United States',
      countryCode: 'US',
      city: 'New York'
    };
  }

  // Lookup geo data
  const geo = geoip.lookup(ip);
  if (!geo) {
    return {
      ip,
      country: 'International',
      countryCode: 'INT',
      city: 'Unknown'
    };
  }

  return {
    ip,
    country: geo.country || 'International',
    countryCode: geo.country || 'INT',
    city: geo.city || 'Unknown'
  };
};

