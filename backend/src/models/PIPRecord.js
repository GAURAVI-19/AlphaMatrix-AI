import mongoose from 'mongoose';

const pipRecordSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'TERMINATED'],
      default: 'ACTIVE'
    },
    reason: {
      type: String,
      required: true
    },
    goals: [{
      description: {
        type: String,
        required: true
      },
      metric: String,
      targetValue: mongoose.Schema.Types.Mixed,
      currentValue: mongoose.Schema.Types.Mixed,
      weight: {
        type: Number,
        default: 1
      },
      achieved: {
        type: Boolean,
        default: false
      },
      completionDate: Date
    }],
    reviewCycle: [{
      reviewDate: {
        type: Date,
        required: true
      },
      reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      performanceScore: {
        type: Number,
        min: 0,
        max: 100
      },
      comments: String,
      status: {
        type: String,
        enum: ['ON_TRACK', 'AT_RISK', 'IMPROVED', 'DETERIORATED'],
        default: 'ON_TRACK'
      },
      goalsProgress: [{
        goalIndex: Number,
        progressPercentage: {
          type: Number,
          min: 0,
          max: 100
        },
        notes: String
      }]
    }],
    supportActions: [{
      action: String,
      description: String,
      owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      dueDate: Date,
      status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
        default: 'PENDING'
      }
    }],
    training: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    hr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true
    },
    successCriteria: {
      overallScore: {
        type: Number,
        default: 70,
        description: 'Minimum score to pass PIP'
      },
      goalsAchievementPercentage: {
        type: Number,
        default: 80,
        description: 'Minimum percentage of goals to achieve'
      }
    },
    outcome: {
      result: {
        type: String,
        enum: ['PASS', 'FAIL', 'IN_PROGRESS'],
        default: 'IN_PROGRESS'
      },
      finalDate: Date,
      finalScore: Number,
      comments: String
    },
    escalationHistory: [{
      level: {
        type: String,
        enum: ['LEVEL_1', 'LEVEL_2', 'LEVEL_3']
      },
      date: Date,
      reason: String,
      escalatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
      tags: [String]
    }
  },
  { timestamps: true }
);

pipRecordSchema.index({ employee: 1 });
pipRecordSchema.index({ isDeleted: 1 });

pipRecordSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: { $ne: true } });
  this.populate('employee').populate('manager').populate('hr');
  next();
});

const PIPRecord = mongoose.model('PIPRecord', pipRecordSchema);
export default PIPRecord;
