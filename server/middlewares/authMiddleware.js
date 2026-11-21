import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { dbStore, isMongoConnected } from '../services/dbStore.js';

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const secret = process.env.JWT_ACCESS_SECRET || 'annsha_global_access_super_secret_key_2026_xyz';
    const decoded = jwt.verify(token, secret);
    
    let user = null;

    if (isMongoConnected()) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      const users = dbStore.read('users');
      user = users.find(u => String(u._id) === String(decoded.id));
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account no longer exists.'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended by administration.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};
