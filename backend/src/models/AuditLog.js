import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    module: {
      type: String,
      enum: ['AUTH', 'BRANCH', 'EMPLOYEE', 'PREDICTION', 'APPROVAL', 'COURSE', 'PIP', 'SETTINGS'],
      required: true
    },
    entity: {
      type: {
        type: String,
        enum: ['User', 'Branch', 'Employee', 'Prediction', 'Approval', 'Course', 'PIPRecord', 'EthicalRule']
      },
      id: mongoose.Schema.Types.ObjectId
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'ERROR'],
      default: 'SUCCESS'
    },
    statusCode: Number,
    errorMessage: String,
    resourcePath: String,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    },
    responseTime: Number,
    metadata: {
      branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch'
      },
      department: String,
      tags: [String]
    }
  },
  { timestamps: true }
);

// Indexes
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ 'entity.id': 1 });

auditLogSchema.pre(/^find/, function(next) {
  this.populate('user', 'name email role');
  next();
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
