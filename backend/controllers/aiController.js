import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import { getDashboardData } from '../services/dashboardService.js';
import {
  generatePaymentReminder,
  generateBusinessInsights,
  answerBusinessQuestion
} from '../services/aiService.js';

const TONES = ['friendly', 'professional', 'firm'];

const sendAIUnavailableResponse = (res) => {
  console.error('AI service request failed.');
  return res.status(503).json({ success: false, message: 'AI service is temporarily unavailable.' });
};

const generateReminder = async (req, res) => {
  try {
    const { invoiceId, tone = 'friendly' } = req.body;

    if (!mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({ success: false, message: 'Invalid invoice ID' });
    }

    if (!TONES.includes(tone)) {
      return res.status(400).json({ success: false, message: 'Invalid reminder tone' });
    }

    const invoice = await Invoice.findById(invoiceId).populate('customer', 'name email');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.remainingAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A payment reminder cannot be generated for a paid invoice'
      });
    }

    if (!invoice.customer) {
      return res.status(404).json({ success: false, message: 'Invoice customer not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(invoice.dueDate);
    const daysOverdue = dueDate < today ? Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)) : 0;

    const message = await generatePaymentReminder({
      tone,
      customerName: invoice.customer.name,
      invoiceNumber: invoice.invoiceNumber,
      remainingAmount: invoice.remainingAmount,
      dueDate: invoice.dueDate.toISOString().slice(0, 10),
      daysOverdue
    });

    return res.status(200).json({ success: true, data: { message } });
  } catch (error) {
    return sendAIUnavailableResponse(res);
  }
};

const generateInsights = async (req, res) => {
  try {
    const businessData = await getDashboardData();

    if (businessData.metrics.totalInvoices === 0) {
      return res.status(200).json({
        success: true,
        data: { message: 'There is not enough business data to generate meaningful insights yet.' }
      });
    }

    const insights = await generateBusinessInsights(businessData);
    return res.status(200).json({ success: true, data: { insights } });
  } catch (error) {
    return sendAIUnavailableResponse(res);
  }
};

const chat = async (req, res) => {
  try {
    const { question } = req.body;

    if (typeof question !== 'string' || !question.trim() || question.trim().length > 500) {
      return res.status(400).json({ success: false, message: 'Please provide a valid question' });
    }

    const businessData = await getDashboardData();
    if (businessData.metrics.totalInvoices === 0) {
      return res.status(200).json({
        success: true,
        data: { answer: 'There is not enough business data available to answer that question yet.' }
      });
    }

    const answer = await answerBusinessQuestion({ question: question.trim(), businessData });
    return res.status(200).json({ success: true, data: { answer } });
  } catch (error) {
    return sendAIUnavailableResponse(res);
  }
};

export { generateReminder, generateInsights, chat };
