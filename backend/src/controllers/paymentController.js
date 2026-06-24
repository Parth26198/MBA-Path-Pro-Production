import * as paymentService from '../services/paymentService.js';
import { success } from '../utils/apiResponse.js';

export const createOrder = async (req, res, next) => {
  try {
    const packageId = parseInt(req.body.package_id, 10);
    if (!packageId) {
      const err = new Error('package_id is required');
      err.status = 400;
      throw err;
    }
    const result = await paymentService.createPaymentOrder({
      studentId: req.student.id,
      packageId,
      userId: req.userId,
    });
    success(res, result, 'Payment order created', 201);
  } catch (e) {
    next(e);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const result = await paymentService.verifyRazorpayPayment({
      orderId: req.body.razorpay_order_id,
      paymentId: req.body.razorpay_payment_id,
      signature: req.body.razorpay_signature,
      userId: req.userId,
    });
    success(res, result, 'Payment verified');
  } catch (e) {
    next(e);
  }
};

export const paymentFailed = async (req, res, next) => {
  try {
    await paymentService.markPaymentFailed(req.body.order_id, req.body.reason || 'Payment failed');
    success(res, null, 'Payment marked as failed');
  } catch (e) {
    next(e);
  }
};

export const history = async (req, res, next) => {
  try {
    success(res, await paymentService.getPaymentHistory(req.student.id));
  } catch (e) {
    next(e);
  }
};

export const adminPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { rows, total } = await paymentService.getAllPayments({ page, limit, status: req.query.status });
    success(res, { payments: rows, pagination: { page, limit, total } });
  } catch (e) {
    next(e);
  }
};

export const razorpayKey = async (req, res, next) => {
  try {
    success(res, { keyId: paymentService.getRazorpayKeyId(), enabled: !!paymentService.getRazorpayKeyId() });
  } catch (e) {
    next(e);
  }
};
