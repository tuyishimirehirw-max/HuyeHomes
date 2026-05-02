const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    default: null,
    validate: {
      validator: function(value) {
        return value === null || mongoose.Types.ObjectId.isValid(value);
      },
      message: 'Property ID must be a valid ObjectId'
    },
    index: true
  },
  propertyTitle: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'closed'],
    default: 'new',
    index: true
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  contactedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted inquiry date
inquirySchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Virtual for response time
inquirySchema.virtual('responseTime').get(function() {
  if (this.contactedAt) {
    const diffMs = this.contactedAt - this.createdAt;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours;
  }
  return null;
});

// Indexes
inquirySchema.index({ propertyId: 1, status: 1 });
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ email: 1 });

// Pre-save middleware to auto-update contactedAt
inquirySchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'contacted' && !this.contactedAt) {
    this.contactedAt = new Date();
  }
  next();
});

// Static methods
inquirySchema.statics.findByProperty = function(propertyId) {
  return this.find({ propertyId }).sort({ createdAt: -1 });
};

inquirySchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

inquirySchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

inquirySchema.statics.getRecentInquiries = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('propertyId', 'title propertyType');
};

module.exports = mongoose.model('Inquiry', inquirySchema);
