import { isPremiumStudent } from '../services/studentTierService.js';

export const requirePremium = (req, res, next) => {
  if (!isPremiumStudent(req.student)) {
    const err = new Error('Upgrade to a premium package to access this feature');
    err.status = 403;
    err.code = 'PAYMENT_REQUIRED';
    return next(err);
  }
  next();
};
