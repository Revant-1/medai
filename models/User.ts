import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  healthMetrics: {
    heartRate: {
      value: Number,
      unit: String,
      timestamp: Date
    },
    bloodPressure: {
      value: Number,
      unit: String,
      timestamp: Date
    },
    spO2: {
      value: Number,
      unit: String,
      timestamp: Date
    },
    cholesterol: {
      value: Number,
      unit: String,
      timestamp: Date
    }
  },
  chatHistory: [{
    message: String,
    response: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);