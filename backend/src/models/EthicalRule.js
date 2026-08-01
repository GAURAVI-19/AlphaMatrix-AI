import mongoose from 'mongoose';

const ethicalRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: String,
    type: {
      type: String,
      enum: ['BIAS_CHECK', 'THRESHOLD_VALIDATION', 'SAFETY_CHECK', 'FAIRNESS_CHECK'],
      required: true
    },
    ruleType: {
      type: String,
      enum: ['DEMOGRAPHIC_PARITY', 'EQUAL_OPPORTUNITY', 'PREDICTIVE_PARITY', 'CUSTOM_THRESHOLD']
    },
    conditions: [{
      field: String,
      operator: {
        type: String,
        enum: ['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS', 'REGEX']
      },
      value: mongoose.Schema.Types.Mixed
    }],
    thresholds: {
      minConfidence: {
        type: Number,
        default: 0.6,
        min: 0,
        max: 1
      },
      maxRisk: {
        type: Number,
        default: 0.5,
        min: 0,
        max: 1
      },
      biasThreshold: {
        type: Number,
        default: 0.15,
        min: 0,
        max: 1
      }
    },
    actions: [{
      type: {
        type: String,
        enum: ['ALLOW', 'REQUIRE_APPROVAL', 'BLOCK', 'NOTIFY', 'LOG']
      },
      parameters: mongoose.Schema.Types.Mixed
    }],
    groups: [{
      type: String,
      enum: ['GENDER', 'AGE_GROUP', 'LOCATION', 'DEPARTMENT', 'TENURE', 'CUSTOM']
    }],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
      default: 'ACTIVE'
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedCount: {
      type: Number,
      default: 0
    },
    violationCount: {
      type: Number,
      default: 0
    },
    lastApplied: Date,
    isDeleted: {
      type: Boolean,
      default: false
    },
    metadata: {
      source: String,
      reference: String,
      tags: [String]
    }
  },
  { timestamps: true }
);

ethicalRuleSchema.index({ name: 1 });
ethicalRuleSchema.index({ isDeleted: 1 });

ethicalRuleSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

const EthicalRule = mongoose.model('EthicalRule', ethicalRuleSchema);
export default EthicalRule;
