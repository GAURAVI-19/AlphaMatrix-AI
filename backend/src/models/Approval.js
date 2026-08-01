import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    prediction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prediction',
      required: true
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING'
    },
    type: {
      type: String,
      required: true
    },
    description: String,
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    requiredApprovals: {
      type: Number,
      default: 1
    },
    approvals: [{
      approver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
      },
      comments: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    dueDate: Date,
    comments: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      text: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    actionItems: [{
      description: String,
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
        default: 'PENDING'
      }
    }],
    isDeleted: {
      type: Boolean,
      default: false
    },
    metadata: {
      department: String,
      branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
      },
      impact: String
    }
  },
  { timestamps: true }
);

approvalSchema.index({ prediction: 1 });
approvalSchema.index({ isDeleted: 1 });

approvalSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: { $ne: true } });
  this.populate('employee').populate('createdBy').populate('approvals.approver');
  next();
});

const Approval = mongoose.model('Approval', approvalSchema);
export default Approval;
