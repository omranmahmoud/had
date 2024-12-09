import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No authentication token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      message: 'Authentication failed: ' + error.message 
    });
  }
};

export const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ 
          message: 'Admin access required' 
        });
      }
      next();
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(403).json({ 
      message: 'Admin access required' 
    });
  }
};