import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { queryOne } from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      const err = new Error('Authentication required');
      err.status = 401;
      throw err;
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await queryOne(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.is_active, r.name as role
       FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
      [decoded.userId]
    );

    if (!user || !user.is_active) {
      const err = new Error('Invalid or inactive user');
      err.status = 401;
      throw err;
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    if (user.role === 'STUDENT') {
      const student = await queryOne(
        'SELECT s.*, p.name as package_name, p.code as package_code, p.college_limit FROM students s LEFT JOIN packages p ON s.package_id = p.id WHERE s.user_id = ?',
        [user.id]
      );
      req.student = student;
    }

    if (user.role === 'TRAINER') {
      const trainer = await queryOne('SELECT * FROM trainers WHERE user_id = ?', [user.id]);
      req.trainer = trainer;
    }

    next();
  } catch (e) {
    e.status = e.status || 401;
    next(e);
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) {
    const err = new Error('You do not have permission to perform this action');
    err.status = 403;
    return next(err);
  }
  next();
};
