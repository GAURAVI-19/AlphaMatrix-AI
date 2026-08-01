import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    category: {
      type: String,
      required: true
    },
    level: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'BEGINNER'
    },
    duration: {
      type: Number,
      required: true,
      description: 'Duration in hours'
    },
    provider: {
      type: String,
      required: true
    },
    instructor: {
      name: String,
      email: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    skills: [String],
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    capacity: {
      type: Number,
      default: 100
    },
    enrolledStudents: [{
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
      },
      enrollmentDate: Date,
      status: {
        type: String,
        enum: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'],
        default: 'ASSIGNED'
      },
      progressPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      score: {
        type: Number,
        min: 0,
        max: 100
      },
      completionDate: Date
    }],
    curriculum: [{
      module: String,
      description: String,
      duration: Number,
      resources: [String]
    }],
    certification: {
      available: {
        type: Boolean,
        default: true
      },
      validityMonths: Number,
      requirements: {
        minScore: {
          type: Number,
          default: 60
        }
      }
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED'],
      default: 'DRAFT'
    },
    type: {
      type: String,
      enum: ['MANDATORY', 'OPTIONAL', 'SKILL_DEVELOPMENT'],
      default: 'OPTIONAL'
    },
    costPerStudent: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      reviews: [{
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee'
        },
        rating: Number,
        comment: String,
        timestamp: Date
      }]
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    metadata: {
      tags: [String],
      externalUrl: String
    }
  },
  { timestamps: true }
);

courseSchema.index({ title: 1 });
courseSchema.index({ isDeleted: 1 });

courseSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: { $ne: true } });
  this.populate('enrolledStudents.student').populate('instructor.id');
  next();
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
