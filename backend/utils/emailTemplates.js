const formatAmount = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

const invoiceCreatedTemplate = ({ customerName, invoiceNumber, totalAmount, remainingAmount, dueDate }) => ({
  subject: `New Invoice ${invoiceNumber} from PayTrack`,
  text: `Hello ${customerName},\n\nA new invoice has been created for you.\n\nInvoice: ${invoiceNumber}\nTotal amount: ${formatAmount(totalAmount)}\nRemaining amount: ${formatAmount(remainingAmount)}\nDue date: ${formatDate(dueDate)}\n\nPlease review the invoice and arrange payment by the due date.\n\nThank you.`
});

const paymentReceivedTemplate = ({
  customerName,
  invoiceNumber,
  amount,
  paymentDate,
  remainingAmount,
  status
}) => ({
  subject: `Payment received for invoice ${invoiceNumber}`,
  text: `Hello ${customerName},\n\nWe received your payment of ${formatAmount(amount)}.\n\nInvoice: ${invoiceNumber}\nPayment date: ${formatDate(paymentDate)}\nRemaining balance: ${formatAmount(remainingAmount)}\nInvoice status: ${status}\n\nThank you.`
});

const ownerPaymentReceivedTemplate = ({
  customerName,
  invoiceNumber,
  amount,
  paymentMethod,
  remainingAmount,
  paymentDate
}) => ({
  subject: `Payment received: ${invoiceNumber}`,
  text: `Payment Received\n\nCustomer: ${customerName}\nInvoice: ${invoiceNumber}\nAmount: ${formatAmount(amount)}\nMethod: ${paymentMethod}\nRemaining: ${formatAmount(remainingAmount)}\nPayment date: ${formatDate(paymentDate)}`
});

const overdueInvoiceTemplate = ({
  customerName,
  invoiceNumber,
  remainingAmount,
  dueDate,
  numberOfDaysOverdue
}) => ({
  subject: `Overdue invoice reminder: ${invoiceNumber}`,
  text: `Hello ${customerName},\n\nYour invoice is overdue.\n\nInvoice: ${invoiceNumber}\nRemaining balance: ${formatAmount(remainingAmount)}\nDue date: ${formatDate(dueDate)}\nDays overdue: ${numberOfDaysOverdue}\n\nPlease arrange payment at your earliest convenience.\n\nThank you.`
});

export {
  invoiceCreatedTemplate,
  paymentReceivedTemplate,
  ownerPaymentReceivedTemplate,
  overdueInvoiceTemplate
};
