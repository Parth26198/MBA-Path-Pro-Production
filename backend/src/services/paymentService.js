import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';
import config from '../config/index.js';
import { query, queryOne } from '../config/database.js';
import { logActivity } from './activityService.js';
import { createNotification } from './notificationService.js';
import { sendPaymentConfirmationEmail } from './emailService.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const invoiceDir = path.join(__dirname, '../../uploads/invoices');

function getRazorpay() {
  if (!config.razorpay.enabled || !config.razorpay.keyId) return null;
  return new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

function generateInvoiceNumber() {
  return `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function generateInvoiceHtml(payment, student, pkg) {
  if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });
  const invoiceNumber = payment.invoice_number || generateInvoiceNumber();
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${invoiceNumber}</title>
<style>body{font-family:Arial,sans-serif;padding:40px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}</style></head>
<body><h1>MBA Path Pro</h1><h2>Tax Invoice</h2><p>Invoice: <strong>${invoiceNumber}</strong></p>
<p>Student: ${student.name}<br>Email: ${student.email}<br>Date: ${new Date(payment.paid_at || Date.now()).toLocaleDateString()}</p>
<table><tr><th>Description</th><th>Amount</th></tr>
<tr><td>${pkg.name} — ${pkg.college_limit} college applications</td><td>₹${payment.amount}</td></tr></table>
<p><strong>Total: ₹${payment.amount}</strong></p><p>Thank you for choosing MBA Path Pro.</p></body></html>`;
  const filePath = path.join(invoiceDir, `${invoiceNumber}.html`);
  fs.writeFileSync(filePath, html);
  return { invoiceNumber, invoiceUrl: `/uploads/invoices/${invoiceNumber}.html` };
}

export async function createPaymentOrder({ studentId, packageId, userId }) {
  const pkg = await queryOne('SELECT * FROM packages WHERE id = ? AND is_active = 1', [packageId]);
  if (!pkg) throw Object.assign(new Error('Invalid package'), { status: 400 });

  const student = await queryOne(
    'SELECT s.*, u.name, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
    [studentId]
  );
  if (!student) throw Object.assign(new Error('Student not found'), { status: 404 });

  const amountPaise = Math.round(Number(pkg.price) * 100);
  const razorpay = getRazorpay();

  if (razorpay) {
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `student_${studentId}_pkg_${packageId}`,
      notes: { student_id: String(studentId), package_id: String(packageId) },
    });

    const payResult = await query(
      `INSERT INTO payments (student_id, package_id, amount, status, payment_method, razorpay_order_id)
       VALUES (?, ?, ?, 'pending', 'razorpay', ?)`,
      [studentId, packageId, pkg.price, order.id]
    );

    return {
      mode: 'razorpay',
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      keyId: config.razorpay.keyId,
      paymentId: payResult.insertId,
      package: pkg,
    };
  }

  const invoiceNumber = generateInvoiceNumber();
  const payResult = await query(
    `INSERT INTO payments (student_id, package_id, amount, status, payment_method, transaction_ref, invoice_number, paid_at)
     VALUES (?, ?, ?, 'completed', 'simulated', ?, ?, NOW())`,
    [studentId, packageId, pkg.price, `TXN-${Date.now()}`, invoiceNumber]
  );

  const invoice = await generateInvoiceHtml(
    { amount: pkg.price, invoice_number: invoiceNumber, paid_at: new Date() },
    student,
    pkg
  );

  await query('UPDATE payments SET invoice_url = ? WHERE id = ?', [invoice.invoiceUrl, payResult.insertId]);
  await query("UPDATE students SET payment_status = 'completed' WHERE id = ?", [studentId]);

  await logActivity(userId, 'PAYMENT_COMPLETED', 'payment', payResult.insertId, `Simulated payment for ${pkg.name}`);

  return {
    mode: 'simulated',
    success: true,
    paymentId: payResult.insertId,
    invoiceNumber,
    invoiceUrl: invoice.invoiceUrl,
  };
}

export async function verifyRazorpayPayment({ orderId, paymentId, signature, userId }) {
  const expected = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (expected !== signature) {
    throw Object.assign(new Error('Invalid payment signature'), { status: 400 });
  }

  const payment = await queryOne('SELECT * FROM payments WHERE razorpay_order_id = ?', [orderId]);
  if (!payment) throw Object.assign(new Error('Payment record not found'), { status: 404 });

  const student = await queryOne(
    'SELECT s.*, u.name, u.email, u.id as user_id FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
    [payment.student_id]
  );
  const pkg = await queryOne('SELECT * FROM packages WHERE id = ?', [payment.package_id]);
  const invoiceNumber = generateInvoiceNumber();

  await query(
    `UPDATE payments SET status = 'completed', razorpay_payment_id = ?, invoice_number = ?, paid_at = NOW() WHERE id = ?`,
    [paymentId, invoiceNumber, payment.id]
  );

  const invoice = await generateInvoiceHtml(
    { ...payment, invoice_number: invoiceNumber, paid_at: new Date() },
    student,
    pkg
  );
  await query('UPDATE payments SET invoice_url = ? WHERE id = ?', [invoice.invoiceUrl, payment.id]);
  await query("UPDATE students SET payment_status = 'completed' WHERE id = ?", [payment.student_id]);

  await createNotification({
    user_id: student.user_id,
    title: 'Payment Successful',
    message: `Your payment for ${pkg.name} was confirmed.`,
    type: 'success',
    link: '/student/payments',
  });

  await sendPaymentConfirmationEmail(student, payment.amount, invoiceNumber);
  await logActivity(userId, 'PAYMENT_VERIFIED', 'payment', payment.id, 'Razorpay payment verified');

  return { success: true, invoiceNumber, invoiceUrl: invoice.invoiceUrl };
}

export async function markPaymentFailed(orderId, reason) {
  await query(
    `UPDATE payments SET status = 'failed', failure_reason = ? WHERE razorpay_order_id = ?`,
    [reason, orderId]
  );
}

export async function getPaymentHistory(studentId) {
  return query(
    `SELECT p.*, pk.name as package_name, pk.code as package_code
     FROM payments p JOIN packages pk ON p.package_id = pk.id
     WHERE p.student_id = ? ORDER BY p.created_at DESC`,
    [studentId]
  );
}

export async function getAllPayments({ page = 1, limit = 20, status } = {}) {
  const offset = (page - 1) * limit;
  let sql = `SELECT p.*, pk.name as package_name, u.name as student_name, u.email
             FROM payments p
             JOIN packages pk ON p.package_id = pk.id
             JOIN students s ON p.student_id = s.id
             JOIN users u ON s.user_id = u.id WHERE 1=1`;
  const params = [];
  if (status) {
    sql += ' AND p.status = ?';
    params.push(status);
  }
  sql += ` ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`;
  const rows = await query(sql, params);
  const [countRow] = await query(
    `SELECT COUNT(*) as total FROM payments p ${status ? 'WHERE p.status = ?' : ''}`,
    status ? [status] : []
  );
  return { rows, total: countRow.total };
}

export function getRazorpayKeyId() {
  return config.razorpay.enabled ? config.razorpay.keyId : null;
}
