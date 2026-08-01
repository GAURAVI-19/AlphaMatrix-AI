import mongoose from 'mongoose';

const predictionHistorySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    prediction: {
      type: Number,
      required: true
    },
    riskLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW'
    },
    type: {
      type: String,
      required: true
    },
    inputData: mongoose.Schema.Types.Mixed,
    shapValues: [{
      name: String,
      importance: Number,
      value: String
    }],
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

predictionHistorySchema.index({ employee: 1 });
predictionHistorySchema.index({ timestamp: -1 });

// Populate employee on query find
predictionHistorySchema.pre(/^find/, function(next) {
  this.populate('employee');
  next();
});

const PredictionHistory = mongoose.model('PredictionHistory', predictionHistorySchema);
export default PredictionHistory;
