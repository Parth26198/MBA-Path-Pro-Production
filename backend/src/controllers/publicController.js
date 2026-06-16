import { query } from '../config/database.js';
import * as collegeService from '../services/collegeService.js';
import { success } from '../utils/apiResponse.js';

export const getPackages = async (req, res, next) => {
  try {
    const packages = await query('SELECT * FROM packages WHERE is_active = 1 ORDER BY sort_order');
    const parsed = packages.map((p) => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
    }));
    success(res, parsed);
  } catch (e) {
    next(e);
  }
};

export const getFeaturedColleges = async (req, res, next) => {
  try {
    success(res, await collegeService.listColleges({ featured: true, limit: 6 }));
  } catch (e) {
    next(e);
  }
};

export const getColleges = async (req, res, next) => {
  try {
    success(res, await collegeService.listColleges({ search: req.query.search }));
  } catch (e) {
    next(e);
  }
};

export const getCollege = async (req, res, next) => {
  try {
    const college = await collegeService.getCollegeBySlug(req.params.slug);
    if (!college) {
      const err = new Error('College not found');
      err.status = 404;
      throw err;
    }
    success(res, college);
  } catch (e) {
    next(e);
  }
};

export const getStats = async (req, res, next) => {
  try {
    success(res, {
      studentsPlaced: 2847,
      partnerColleges: 120,
      successRate: 94,
      avgPackage: '18.5 LPA',
      yearsExperience: 12,
    });
  } catch (e) {
    next(e);
  }
};

export const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;
    await query(
      'INSERT INTO contact_submissions (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, message]
    );
    success(res, { received: true }, 'Thank you! Our team will contact you within 24 hours.');
  } catch (e) {
    next(e);
  }
};
