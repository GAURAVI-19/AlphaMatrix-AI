import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a branch name'],
      trim: true,
      unique: true
    },
    code: {
      type: String,
      required: [true, 'Please provide a branch code'],
      unique: true,
      uppercase: true,
      trim: true
    },
    location: {
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      country: {
        type: String,
        default: 'India'
      },
      address: String,
      pincode: String
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true
    },
    employees: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE'
    },
    performance: {
      score: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      employees: Number,
      totalSalary: Number,
      revenue: Number
    },
    contact: {
      phone: String,
      email: String,
      website: String
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    metadata: {
      establishedDate: Date,
      targetEmployees: Number,
      targetRevenue: Number
    }
  },
  { timestamps: true }
);

// Indexes
branchSchema.index({ code: 1 });
branchSchema.index({ isDeleted: 1 });

// Populate and soft delete pre-find hook
branchSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: { $ne: true } });
  if (this.options._recursed) {
    return next();
  }
  this.populate('manager').populate({
    path: 'employees',
    select: 'name email position'
  });
  next();
});

const Branch = mongoose.model('Branch', branchSchema);
export default Branch;
