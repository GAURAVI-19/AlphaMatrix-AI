import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    type: {
      type: String,
      enum: ['PERFORMANCE', 'ATTRITION', 'PRODUCTIVITY', 'SKILL_GAP'],
      required: true
    },
    prediction: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW'
    },
    explanation: {
      features: [{
        name: String,
        importance: Number,
        value: String
      }],
      summary: String,
      details: String
    },
    ethicalCheck: {
      passed: {
        type: Boolean,
        default: true
      },
      biasDetected: {
        type: Boolean,
        default: false
      },
      biasDetails: String,
      riskScore: {
        type: Number,
        default: 0
      }
    },
    approval: {
      status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        sparse: true
      },
      approvalDate: Date,
      comments: String
    },
    actions: [{
      recommendation: String,
      priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH']
      },
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
    modelVersion: String,
    selectedModel: {
      type: String,
      default: 'XGBOOST'
    },
    domain: {
      type: String,
      enum: ['HR', 'BANKING', 'HEALTHCARE', 'UNIVERSITIES', 'MANUFACTURING', 'GOVERNMENT', 'INSURANCE', 'DEFENSE'],
      default: 'HR'
    },
    limeExplanation: mongoose.Schema.Types.Mixed,
    certificateId: String,
    inputData: mongoose.Schema.Types.Mixed,
    isDeleted: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE'
    }
  },
  { timestamps: true }
);

predictionSchema.index({ employee: 1 });
predictionSchema.index({ isDeleted: 1 });

predictionSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: { $ne: true } });
  this.populate('employee').populate('approval.approvedBy');
  next();
});

const Prediction = mongoose.model('Prediction', predictionSchema);
export default Prediction;
