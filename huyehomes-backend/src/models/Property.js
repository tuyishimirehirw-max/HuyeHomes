const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [255, 'Title cannot exceed 255 characters']
  },
  description: {
    type: String,
    required: [true, 'Property description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  propertyType: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['land', 'student_housing', 'residential'],
    index: true
  },
  listingType: {
    type: String,
    required: [true, 'Listing type is required'],
    enum: ['sale', 'rent'],
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceUnit: {
    type: String,
    enum: ['RWF', 'RWF/mo'],
    default: 'RWF'
  },
  location: {
    sector: {
      type: String,
      required: [true, 'Location sector is required'],
      trim: true,
      index: true
    },
    district: {
      type: String,
      default: 'Huye',
      trim: true
    },
    coordinates: {
      lat: {
        type: Number,
        min: -90,
        max: 90
      },
      lng: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  size: {
    sqm: {
      type: Number,
      min: [0, 'Size cannot be negative']
    },
    hectares: {
      type: Number,
      min: [0, 'Size cannot be negative']
    }
  },
  features: [{
    type: String,
    trim: true
  }],
  amenities: {
    wifi: {
      type: Boolean,
      default: false
    },
    parking: {
      type: Boolean,
      default: false
    },
    security: {
      type: Boolean,
      default: false
    },
    furnished: {
      type: Boolean,
      default: false
    },
    water: {
      type: Boolean,
      default: false
    },
    electricity: {
      type: Boolean,
      default: false
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  contact: {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'rented'],
    default: 'active',
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted price
propertySchema.virtual('formattedPrice').get(function() {
  if (this.price >= 1000000) {
    return `${(this.price / 1000000).toFixed(1)}M ${this.priceUnit}`;
  } else if (this.price >= 1000) {
    return `${(this.price / 1000).toFixed(0)}K ${this.priceUnit}`;
  }
  return `${this.price} ${this.priceUnit}`;
});

// Virtual for primary image
propertySchema.virtual('primaryImage').get(function() {
  const primaryImage = this.images.find(img => img.isPrimary);
  return primaryImage || this.images[0] || null;
});

// Text search index
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.sector': 'text'
});

// Compound indexes for common queries
propertySchema.index({ propertyType: 1, status: 1, createdAt: -1 });
propertySchema.index({ 'location.sector': 1, status: 1, price: 1 });
propertySchema.index({ isVerified: 1, isFeatured: 1, createdAt: -1 });

// Pre-save middleware
propertySchema.pre('save', function(next) {
  // Auto-convert hectares to sqm if only hectares is provided
  if (this.size.hectares && !this.size.sqm) {
    this.size.sqm = this.size.hectares * 10000;
  }
  // Auto-convert sqm to hectares if only sqm is provided
  if (this.size.sqm && !this.size.hectares) {
    this.size.hectares = this.size.sqm / 10000;
  }
  next();
});

// Static methods
propertySchema.statics.findBySector = function(sector) {
  return this.find({ 'location.sector': new RegExp(sector, 'i'), status: 'active' });
};

propertySchema.statics.findFeatured = function(limit = 6) {
  return this.find({ isFeatured: true, status: 'active' })
    .sort({ createdAt: -1 })
    .limit(limit);
};

propertySchema.statics.searchProperties = function(filters, options = {}) {
  const {
    propertyType,
    listingType,
    sector,
    minPrice,
    maxPrice,
    isVerified,
    isFeatured,
    searchTerm
  } = filters;

  const query = { status: 'active' };

  if (propertyType) query.propertyType = propertyType;
  if (listingType) query.listingType = listingType;
  if (sector) query['location.sector'] = new RegExp(sector, 'i');
  if (isVerified !== undefined) query.isVerified = isVerified;
  if (isFeatured !== undefined) query.isFeatured = isFeatured;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }

  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }

  let queryBuilder = this.find(query);

  if (searchTerm) {
    queryBuilder = queryBuilder.select({ score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 });
  } else {
    queryBuilder = queryBuilder.sort({ isVerified: -1, isFeatured: -1, createdAt: -1 });
  }

  if (options.limit) {
    queryBuilder = queryBuilder.limit(options.limit);
  }

  if (options.skip) {
    queryBuilder = queryBuilder.skip(options.skip);
  }

  return queryBuilder;
};

module.exports = mongoose.model('Property', propertySchema);
