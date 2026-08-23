import express from 'express';
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} from '../controllers/invoiceController.js';
import { getInvoicePayments } from '../controllers/paymentController.js';

const router = express.Router();

router.route('/').post(createInvoice).get(getInvoices);
router.get('/:invoiceId/payments', getInvoicePayments);
router.route('/:id').get(getInvoiceById).put(updateInvoice).delete(deleteInvoice);

export default router;
