const getInvoiceStatus = ({ remainingAmount, paidAmount, dueDate }) => {
  if (remainingAmount <= 0) {
    return 'PAID';
  }

  if (new Date(dueDate) < new Date()) {
    return 'OVERDUE';
  }

  if (paidAmount > 0) {
    return 'PARTIAL';
  }

  return 'PENDING';
};

export default getInvoiceStatus;
