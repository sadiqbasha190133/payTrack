import Invoice from '../models/Invoice.js';
import { sendOverdueInvoiceEmail } from './emailService.js';

const sendOverdueNotifications = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueInvoices = await Invoice.find({
    remainingAmount: { $gt: 0 },
    dueDate: { $lt: today }
  }).populate('customer', 'name email');

  const summary = {
    processed: overdueInvoices.length,
    emailsSent: 0,
    emailsFailed: 0,
    emailsSkipped: 0
  };

  for (const invoice of overdueInvoices) {
    const numberOfDaysOverdue = Math.floor((today - invoice.dueDate) / (1000 * 60 * 60 * 24));

    try {
      const result = await sendOverdueInvoiceEmail({
        customerEmail: invoice.customer.email,
        customerName: invoice.customer.name,
        invoiceNumber: invoice.invoiceNumber,
        remainingAmount: invoice.remainingAmount,
        dueDate: invoice.dueDate,
        numberOfDaysOverdue
      });

      if (result.sent) {
        summary.emailsSent += 1;
      } else {
        summary.emailsSkipped += 1;
      }
    } catch (error) {
      summary.emailsFailed += 1;
      console.error(`Failed to send overdue notification for invoice ${invoice.invoiceNumber}.`);
    }
  }

  return summary;
};

export { sendOverdueNotifications };
