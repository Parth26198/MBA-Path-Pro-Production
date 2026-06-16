import * as authService from '../services/authService.js';
import { success, error } from '../utils/apiResponse.js';

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    success(res, result, 'Login successful');
  } catch (e) {
    next(e);
  }
};

export const register = async (req, res, next) => {
  try {
    const result = await authService.registerStudent(req.body);
    success(res, result, 'Registration successful', 201);
  } catch (e) {
    next(e);
  }
};

export const me = async (req, res, next) => {
  try {
    const data = await authService.getMe(req.userId);
    success(res, data);
  } catch (e) {
    next(e);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    success(res, await authService.requestPasswordReset(req.body.email), 'Reset email sent if account exists');
  } catch (e) {
    next(e);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    success(res, await authService.resetPassword(req.body.token, req.body.password), 'Password reset successful');
  } catch (e) {
    next(e);
  }
};
