import mongoose from 'mongoose';
import Customer from '../models/Customer.js';

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const getCustomerData = (body) => ({
  name: typeof body.name === 'string' ? body.name.trim() : body.name,
  businessName:
    typeof body.businessName === 'string'
      ? body.businessName.trim()
      : body.businessName,
  email: typeof body.email === 'string' ? body.email.trim().toLowerCase() : body.email,
  phone: typeof body.phone === 'string' ? body.phone.trim() : body.phone,
  address: typeof body.address === 'string' ? body.address.trim() : body.address
});

const validateCustomerData = (customerData) => {
  if (!customerData.name || !customerData.email || !customerData.phone) {
    return 'Name, email, and phone are required';
  }

  if (!isValidEmail(customerData.email)) {
    return 'Please provide a valid email address';
  }

  return null;
};

const isValidCustomerId = (id) => mongoose.isValidObjectId(id);

const createCustomer = async (req, res) => {
  try {
    const customerData = getCustomerData(req.body);
    const validationError = validateCustomerData(customerData);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const customer = await Customer.create(customerData);

    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to create customer' });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: customers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch customers' });
  }
};

const getCustomerById = async (req, res) => {
  try {
    if (!isValidCustomerId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid customer ID' });
    }

    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    return res.status(200).json({ success: true, data: customer });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch customer' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    if (!isValidCustomerId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid customer ID' });
    }

    const customerData = getCustomerData(req.body);
    const validationError = validateCustomerData(customerData);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, customerData, {
      new: true,
      runValidators: true
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to update customer' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    if (!isValidCustomerId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid customer ID' });
    }

    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
      data: customer
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to delete customer' });
  }
};

export {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
