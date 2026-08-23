import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import getInvoiceStatus from '../utils/invoiceStatus.js';
import {
  sendPaymentReceivedEmail,
  sendOwnerPaymentReceivedEmail
} from '../services/emailService.js';

const PAYMENT_METHODS = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER'];

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const isValidPaymentDate = (paymentDate) =>
  paymentDate === undefined || !Number.isNaN(new Date(paymentDate).getTime());

const createPayment = async (req, res) => {
  try {
    const { invoice: invoiceId, amount, paymentDate, paymentMethod = 'UPI', notes } = req.body;

    if (!isValidObjectId(invoiceId)) {
      return res.status(400).json({ success: false, message: 'Invalid invoice ID' });
    }

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be greater than 0'
      });
    }

    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    if (!isValidPaymentDate(paymentDate)) {
      return res.status(400).json({ success: false, message: 'Invalid payment date' });
    }

    if (notes !== undefined && typeof notes !== 'string') {
      return res.status(400).json({ success: false, message: 'Notes must be a string' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const currentRemainingAmount = invoice.totalAmount - invoice.paidAmount;
    if (amount > currentRemainingAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount cannot be greater than the remaining invoice amount'
      });
    }

    const payment = await Payment.create({
      invoice: invoice._id,
      customer: invoice.customer,
      amount,
      paymentDate,
      paymentMethod,
      notes: notes?.trim()
    });

    invoice.paidAmount += amount;
    invoice.remainingAmount = invoice.totalAmount - invoice.paidAmount;
    invoice.status = getInvoiceStatus({
      remainingAmount: invoice.remainingAmount,
      paidAmount: invoice.paidAmount,
      dueDate: invoice.dueDate
    });
    await invoice.save();

    await payment.populate([
      { path: 'invoice', select: 'invoiceNumber totalAmount paidAmount remainingAmount dueDate status' },
      { path: 'customer', select: 'name businessName email phone' }
    ]);

    const emailData = {
      customerEmail: payment.customer?.email,
      customerName: payment.customer?.name,
      invoiceNumber: payment.invoice?.invoiceNumber,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      remainingAmount: invoice.remainingAmount,
      status: invoice.status
    };

    sendPaymentReceivedEmail(emailData).catch(() => {
      console.error(`Failed to send customer payment email for invoice ${invoice.invoiceNumber}.`);
    });

    sendOwnerPaymentReceivedEmail(emailData).catch(() => {
      console.error(`Failed to send owner payment email for invoice ${invoice.invoiceNumber}.`);
    });

    return res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: {
        payment,
        invoice
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to create payment' });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('invoice', 'invoiceNumber totalAmount paidAmount remainingAmount dueDate status')
      .populate('customer', 'name businessName email phone')
      .sort({ paymentDate: -1, createdAt: -1 });

    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch payments' });
  }
};

const getPaymentById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid payment ID' });
    }

    const payment = await Payment.findById(req.params.id)
      .populate('invoice', 'invoiceNumber totalAmount paidAmount remainingAmount dueDate status')
      .populate('customer', 'name businessName email phone');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    return res.status(200).json({ success: true, data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch payment' });
  }
};

const getInvoicePayments = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    if (!isValidObjectId(invoiceId)) {
      return res.status(400).json({ success: false, message: 'Invalid invoice ID' });
    }

    const invoiceExists = await Invoice.exists({ _id: invoiceId });
    if (!invoiceExists) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const payments = await Payment.find({ invoice: invoiceId })
      .populate('invoice', 'invoiceNumber totalAmount paidAmount remainingAmount dueDate status')
      .populate('customer', 'name businessName email phone')
      .sort({ paymentDate: -1, createdAt: -1 });

    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch invoice payments' });
  }
};

export { createPayment, getPayments, getPaymentById, getInvoicePayments };
