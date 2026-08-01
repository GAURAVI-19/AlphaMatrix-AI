import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    employeeId: {
      type: String,
      required: true,
      unique: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    department: {
      type: String,
      required: true
    },
    position: {
      type: String,
      required: true
    },
    joinDate: {
      type: Date,
      required: true
    },
    salary: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'ON_PIP', 'TERMINATED'],
      default: 'ACTIVE'
    },
    performance: {
      currentScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      level: {
        type: String,
        enum: ['POOR', 'BELOW_AVERAGE', 'AVERAGE', 'GOOD', 'EXCELLENT'],
        default: 'AVERAGE'
      },
      attendance: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      productivity: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      quality: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      teamwork: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      initiative: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      lastReviewDate: Date,
      historicalScores: [{
        score: Number,
        date: Date,
        reviewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }]
    },
    skills: [{
      name: String,
      proficiency: {
        type: String,
        enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']
      },
      acquiredDate: Date
    }],
    courses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }],
    certifications: [{
      name: String,
      issuer: String,
      issueDate: Date,
      expiryDate: Date
    }],
    satisfactionScore: {
      type: Number,
      min: 1,
      max: 10,
      default: null
    },
    attritionRisk: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    metrics: {
      projectsCompleted: {
        type: Number,
        default: 0
      },
      targetsAchieved: {
        type: Number,
        default: 0
      },
      targetsSet: {
        type: Number,
        default: 0
      },
      absenceDays: {
        type: Number,
        default: 0
      }
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Indexes
employeeSchema.index({ userId: 1 });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ branch: 1 });
employeeSchema.index({ isDeleted: 1 });

employeeSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: { $ne: true } });
  this.populate('userId', 'name email phone profileImage').populate('branch', 'name code');
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
