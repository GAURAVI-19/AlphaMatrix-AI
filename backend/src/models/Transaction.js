import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      sparse: true
    },
    type: {
      type: String,
      enum: ['SALE', 'PURCHASE', 'RETURN', 'EXCHANGE'],
      required: true
    },
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      discount: {
        type: Number,
        default: 0
      },
      tax: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        required: true
      }
    }],
    amount: {
      subtotal: Number,
      tax: Number,
      discount: Number,
      total: {
        type: Number,
        required: true
      }
    },
    payment: {
      method: {
        type: String,
        enum: ['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'CHEQUE', 'DIGITAL'],
        required: true
      },
      status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
        default: 'PENDING'
      },
      paidDate: Date,
      referenceNumber: String
    },
    shipping: {
      address: String,
      method: String,
      trackingNumber: String,
      estimatedDelivery: Date,
      actualDelivery: Date
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch'
    },
    notes: String,
    isDeleted: {
      type: Boolean,
      default: false
    },
    metadata: {
      invoiceNumber: String,
      poNumber: String,
      tags: [String]
    }
  },
  { timestamps: true }
);

transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ customer: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ isDeleted: 1 });

transactionSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: { $ne: true } });
  this.populate('customer').populate('items.product').populate('createdBy');
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
