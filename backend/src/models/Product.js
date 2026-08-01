import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    description: String,
    category: {
      type: String,
      required: true
    },
    price: {
      cost: {
        type: Number,
        required: true
      },
      selling: {
        type: Number,
        required: true
      },
      margin: {
        type: Number,
        default: 0
      }
    },
    quantity: {
      inStock: {
        type: Number,
        default: 0
      },
      reserved: {
        type: Number,
        default: 0
      },
      reorderLevel: {
        type: Number,
        default: 50
      }
    },
    supplier: {
      name: String,
      contactPerson: String,
      email: String,
      phone: String
    },
    image: String,
    status: {
      type: String,
      enum: ['ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK'],
      default: 'ACTIVE'
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    metadata: {
      weight: Number,
      dimensions: String,
      warranty: String
    }
  },
  { timestamps: true }
);

productSchema.index({ sku: 1 });
productSchema.index({ isDeleted: 1 });

productSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
