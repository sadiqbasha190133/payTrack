import Customer from '../models/Customer.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import getInvoiceStatus from '../utils/invoiceStatus.js';

const getDashboardData = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueSoonDate = new Date(today);
  dueSoonDate.setDate(dueSoonDate.getDate() + 7);
  dueSoonDate.setHours(23, 59, 59, 999);

  const hasRemainingAmount = { $gt: ['$remainingAmount', 0] };
  const isOverdue = { $and: [hasRemainingAmount, { $lt: ['$dueDate', today] }] };
  const isPaid = { $lte: ['$remainingAmount', 0] };
  const isPartial = {
    $and: [hasRemainingAmount, { $gte: ['$dueDate', today] }, { $gt: ['$paidAmount', 0] }]
  };
  const isPending = {
    $and: [hasRemainingAmount, { $gte: ['$dueDate', today] }, { $lte: ['$paidAmount', 0] }]
  };
  const isDueSoon = {
    $and: [hasRemainingAmount, { $gte: ['$dueDate', today] }, { $lte: ['$dueDate', dueSoonDate] }]
  };

  const [totalCustomers, invoiceSummary, recentPayments, recentInvoices, topOutstandingCustomers, overdueInvoices] =
    await Promise.all([
      Customer.countDocuments(),
      Invoice.aggregate([
        {
          $group: {
            _id: null,
            totalInvoices: { $sum: 1 },
            totalSales: { $sum: '$totalAmount' },
            totalReceived: { $sum: '$paidAmount' },
            totalOutstanding: { $sum: '$remainingAmount' },
            totalOverdue: { $sum: { $cond: [isOverdue, '$remainingAmount', 0] } },
            overdueInvoiceCount: { $sum: { $cond: [isOverdue, 1, 0] } },
            pendingInvoiceCount: { $sum: { $cond: [isPending, 1, 0] } },
            partialInvoiceCount: { $sum: { $cond: [isPartial, 1, 0] } },
            paidInvoiceCount: { $sum: { $cond: [isPaid, 1, 0] } },
            dueSoonAmount: { $sum: { $cond: [isDueSoon, '$remainingAmount', 0] } }
          }
        }
      ]),
      Payment.find().populate('invoice', 'invoiceNumber').populate('customer', 'name').sort({ paymentDate: -1, createdAt: -1 }).limit(5).lean(),
      Invoice.find().populate('customer', 'name').sort({ createdAt: -1 }).limit(5).lean(),
      Invoice.aggregate([
        { $match: { remainingAmount: { $gt: 0 } } },
        { $group: { _id: '$customer', outstandingAmount: { $sum: '$remainingAmount' } } },
        { $sort: { outstandingAmount: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
        { $unwind: '$customer' },
        { $project: { _id: 0, customerId: '$_id', customerName: '$customer.name', businessName: '$customer.businessName', outstandingAmount: 1 } }
      ]),
      Invoice.aggregate([
        { $match: { remainingAmount: { $gt: 0 }, dueDate: { $lt: today } } },
        { $sort: { dueDate: 1 } },
        { $limit: 5 },
        { $lookup: { from: 'customers', localField: 'customer', foreignField: '_id', as: 'customer' } },
        { $unwind: '$customer' },
        {
          $project: {
            _id: 0,
            invoiceId: '$_id',
            invoiceNumber: 1,
            customerName: '$customer.name',
            remainingAmount: 1,
            dueDate: 1,
            numberOfDaysOverdue: { $floor: { $divide: [{ $subtract: [today, '$dueDate'] }, 1000 * 60 * 60 * 24] } }
          }
        }
      ])
    ]);

  const summary = invoiceSummary[0] || {};

  return {
    metrics: {
      totalCustomers,
      totalInvoices: summary.totalInvoices || 0,
      totalSales: summary.totalSales || 0,
      totalReceived: summary.totalReceived || 0,
      totalOutstanding: summary.totalOutstanding || 0,
      totalOverdue: summary.totalOverdue || 0,
      overdueInvoiceCount: summary.overdueInvoiceCount || 0,
      pendingInvoiceCount: summary.pendingInvoiceCount || 0,
      partialInvoiceCount: summary.partialInvoiceCount || 0,
      paidInvoiceCount: summary.paidInvoiceCount || 0,
      dueSoonAmount: summary.dueSoonAmount || 0
    },
    recentPayments: recentPayments.map((payment) => ({ paymentId: payment._id, amount: payment.amount, paymentDate: payment.paymentDate, paymentMethod: payment.paymentMethod, invoiceNumber: payment.invoice?.invoiceNumber, customerName: payment.customer?.name })),
    recentInvoices: recentInvoices.map((invoice) => ({ invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber, customerName: invoice.customer?.name, totalAmount: invoice.totalAmount, paidAmount: invoice.paidAmount, remainingAmount: invoice.remainingAmount, dueDate: invoice.dueDate, status: getInvoiceStatus(invoice) })),
    topOutstandingCustomers,
    overdueInvoices
  };
};

export { getDashboardData };
