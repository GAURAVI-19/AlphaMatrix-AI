import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      sparse: true,
      unique: true
    },
    phone: String,
    type: {
      type: String,
      enum: ['INDIVIDUAL', 'BUSINESS'],
      default: 'INDIVIDUAL'
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    },
    billing: {
      address: String,
      phone: String,
      email: String
    },
    shipping: [{
      address: String,
      city: String,
      default: false
    }],
    creditLimit: {
      type: Number,
      default: 0
    },
    creditUsed: {
      type: Number,
      default: 0
    },
    paymentTerms: {
      type: String,
      enum: ['NET30', 'NET60', 'IMMEDIATE'],
      default: 'NET30'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'],
      default: 'ACTIVE'
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    loyaltyPoints: {
      type: Number,
      default: 0
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    metadata: {
      tags: [String],
      notes: String
    }
  },
  { timestamps: true }
);

customerSchema.index({ email: 1 });
customerSchema.index({ isDeleted: 1 });

customerSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
