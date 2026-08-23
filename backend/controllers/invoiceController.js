import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Invoice from '../models/Invoice.js';
import getInvoiceStatus from '../utils/invoiceStatus.js';
import { sendInvoiceCreatedEmail } from '../services/emailService.js';

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const isValidNumber = (value) => typeof value === 'number' && Number.isFinite(value);

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 'At least one invoice item is required';
  }

  for (const item of items) {
    if (!item || typeof item.name !== 'string' || !item.name.trim()) {
      return 'Each item must have a name';
    }

    if (!isValidNumber(item.quantity) || item.quantity < 1) {
      return 'Each item quantity must be at least 1';
    }

    if (!isValidNumber(item.price) || item.price < 0) {
      return 'Each item price cannot be negative';
    }
  }

  return null;
};

const validateDueDate = (dueDate) => {
  if (!dueDate || Number.isNaN(new Date(dueDate).getTime())) {
    return 'A valid due date is required';
  }

  return null;
};

const calculateInvoiceAmounts = (items, tax, discount, paidAmount) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const totalAmount = subtotal + tax - discount;
  const remainingAmount = totalAmount - paidAmount;

  return { subtotal, totalAmount, remainingAmount };
};

const formatItems = (items) =>
  items.map((item) => ({
    name: item.name.trim(),
    quantity: item.quantity,
    price: item.price
  }));

const createInvoice = async (req, res) => {
  try {
    const { customer, invoiceNumber, items, tax = 0, discount = 0, dueDate } = req.body;

    if (!isValidObjectId(customer)) {
      return res.status(400).json({ success: false, message: 'Invalid customer ID' });
    }

    if (typeof invoiceNumber !== 'string' || !invoiceNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Invoice number is required' });
    }

    const itemsError = validateItems(items);
    if (itemsError) {
      return res.status(400).json({ success: false, message: itemsError });
    }

    if (!isValidNumber(tax) || tax < 0) {
      return res.status(400).json({ success: false, message: 'Tax cannot be negative' });
    }

    if (!isValidNumber(discount) || discount < 0) {
      return res.status(400).json({ success: false, message: 'Discount cannot be negative' });
    }

    const dueDateError = validateDueDate(dueDate);
    if (dueDateError) {
      return res.status(400).json({ success: false, message: dueDateError });
    }

    const customerRecord = await Customer.findById(customer).select('name email');
    if (!customerRecord) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const cleanItems = formatItems(items);
    const { subtotal, totalAmount, remainingAmount } = calculateInvoiceAmounts(
      cleanItems,
      tax,
      discount,
      0
    );

    if (discount > subtotal + tax) {
      return res.status(400).json({
        success: false,
        message: 'Discount cannot be greater than subtotal plus tax'
      });
    }

    const existingInvoice = await Invoice.exists({ invoiceNumber: invoiceNumber.trim() });
    if (existingInvoice) {
      return res.status(400).json({ success: false, message: 'Invoice number already exists' });
    }

    const invoice = await Invoice.create({
      customer,
      invoiceNumber: invoiceNumber.trim(),
      items: cleanItems,
      subtotal,
      tax,
      discount,
      totalAmount,
      paidAmount: 0,
      remainingAmount,
      dueDate,
      status: getInvoiceStatus({ remainingAmount, paidAmount: 0, dueDate })
    });

    sendInvoiceCreatedEmail({
      customerEmail: customerRecord.email,
      customerName: customerRecord.name,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      remainingAmount: invoice.remainingAmount,
      dueDate: invoice.dueDate
    }).catch(() => {
      console.error(`Failed to send invoice email for invoice ${invoice.invoiceNumber}.`);
    });

    return res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to create invoice' });
  }
};

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer', 'name businessName email phone')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch invoices' });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid invoice ID' });
    }

    const invoice = await Invoice.findById(req.params.id).populate(
      'customer',
      'name businessName email phone'
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    return res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch invoice' });
  }
};

const updateInvoice = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid invoice ID' });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const items = req.body.items === undefined ? invoice.items : req.body.items;
    const tax = req.body.tax === undefined ? invoice.tax : req.body.tax;
    const discount = req.body.discount === undefined ? invoice.discount : req.body.discount;
    const dueDate = req.body.dueDate === undefined ? invoice.dueDate : req.body.dueDate;

    const itemsError = validateItems(items);
    if (itemsError) {
      return res.status(400).json({ success: false, message: itemsError });
    }

    if (!isValidNumber(tax) || tax < 0) {
      return res.status(400).json({ success: false, message: 'Tax cannot be negative' });
    }

    if (!isValidNumber(discount) || discount < 0) {
      return res.status(400).json({ success: false, message: 'Discount cannot be negative' });
    }

    const dueDateError = validateDueDate(dueDate);
    if (dueDateError) {
      return res.status(400).json({ success: false, message: dueDateError });
    }

    const cleanItems = formatItems(items);
    const { subtotal, totalAmount, remainingAmount } = calculateInvoiceAmounts(
      cleanItems,
      tax,
      discount,
      invoice.paidAmount
    );

    if (discount > subtotal + tax) {
      return res.status(400).json({
        success: false,
        message: 'Discount cannot be greater than subtotal plus tax'
      });
    }

    if (invoice.paidAmount > totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Total amount cannot be less than the amount already paid'
      });
    }

    invoice.items = cleanItems;
    invoice.tax = tax;
    invoice.discount = discount;
    invoice.dueDate = dueDate;
    invoice.subtotal = subtotal;
    invoice.totalAmount = totalAmount;
    invoice.remainingAmount = remainingAmount;
    invoice.status = getInvoiceStatus({
      remainingAmount,
      paidAmount: invoice.paidAmount,
      dueDate
    });

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to update invoice' });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid invoice ID' });
    }

    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
      data: invoice
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to delete invoice' });
  }
};

export { createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice };
