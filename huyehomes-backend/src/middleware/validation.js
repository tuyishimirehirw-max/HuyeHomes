const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errorMessage
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  // User registration/login
  login: Joi.object({
    identifier: Joi.string().required().messages({
      'string.empty': 'Email or username is required',
      'any.required': 'Email or username is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    })
  }),

  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
      'string.empty': 'Username is required',
      'string.alphanum': 'Username can only contain letters and numbers',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required'
    }),
    profile: Joi.object({
      firstName: Joi.string().max(50).optional(),
      lastName: Joi.string().max(50).optional()
    }).optional()
  }),

  // Property validation
  property: Joi.object({
    title: Joi.string().trim().max(255).required().messages({
      'string.empty': 'Property title is required',
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Property title is required'
    }),
    description: Joi.string().trim().max(2000).required().messages({
      'string.empty': 'Property description is required',
      'string.max': 'Description cannot exceed 2000 characters',
      'any.required': 'Property description is required'
    }),
    propertyType: Joi.string().valid('land', 'student_housing', 'residential').required().messages({
      'any.only': 'Property type must be land, student_housing, or residential',
      'any.required': 'Property type is required'
    }),
    listingType: Joi.string().valid('sale', 'rent').required().messages({
      'any.only': 'Listing type must be sale or rent',
      'any.required': 'Listing type is required'
    }),
    price: Joi.number().min(0).required().messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
    priceUnit: Joi.string().valid('RWF', 'RWF/mo').optional(),
    location: Joi.object({
      sector: Joi.string().trim().required().messages({
        'string.empty': 'Location sector is required',
        'any.required': 'Location sector is required'
      }),
      district: Joi.string().trim().optional(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).optional(),
        lng: Joi.number().min(-180).max(180).optional()
      }).optional()
    }).required(),
    size: Joi.object({
      sqm: Joi.number().min(0).optional(),
      hectares: Joi.number().min(0).optional()
    }).optional(),
    features: Joi.array().items(Joi.string().trim()).optional(),
    amenities: Joi.object({
      wifi: Joi.boolean().optional(),
      parking: Joi.boolean().optional(),
      security: Joi.boolean().optional(),
      furnished: Joi.boolean().optional(),
      water: Joi.boolean().optional(),
      electricity: Joi.boolean().optional()
    }).optional(),
    contact: Joi.object({
      name: Joi.string().trim().required().messages({
        'string.empty': 'Contact name is required',
        'any.required': 'Contact name is required'
      }),
      phone: Joi.string().trim().required().messages({
        'string.empty': 'Contact phone is required',
        'any.required': 'Contact phone is required'
      }),
      email: Joi.string().email().optional().messages({
        'string.email': 'Please enter a valid email'
      })
    }).required(),
    isVerified: Joi.boolean().optional(),
    isFeatured: Joi.boolean().optional()
  }),

  // Property update (partial validation)
  propertyUpdate: Joi.object({
    title: Joi.string().trim().max(255).optional(),
    description: Joi.string().trim().max(2000).optional(),
    propertyType: Joi.string().valid('land', 'student_housing', 'residential').optional(),
    listingType: Joi.string().valid('sale', 'rent').optional(),
    price: Joi.number().min(0).optional(),
    priceUnit: Joi.string().valid('RWF', 'RWF/mo').optional(),
    location: Joi.object({
      sector: Joi.string().trim().optional(),
      district: Joi.string().trim().optional(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).optional(),
        lng: Joi.number().min(-180).max(180).optional()
      }).optional()
    }).optional(),
    size: Joi.object({
      sqm: Joi.number().min(0).optional(),
      hectares: Joi.number().min(0).optional()
    }).optional(),
    features: Joi.array().items(Joi.string().trim()).optional(),
    amenities: Joi.object({
      wifi: Joi.boolean().optional(),
      parking: Joi.boolean().optional(),
      security: Joi.boolean().optional(),
      furnished: Joi.boolean().optional(),
      water: Joi.boolean().optional(),
      electricity: Joi.boolean().optional()
    }).optional(),
    contact: Joi.object({
      name: Joi.string().trim().optional(),
      phone: Joi.string().trim().optional(),
      email: Joi.string().email().optional()
    }).optional(),
    status: Joi.string().valid('active', 'pending', 'sold', 'rented').optional(),
    isVerified: Joi.boolean().optional(),
    isFeatured: Joi.boolean().optional()
  }),

  // Inquiry validation
  inquiry: Joi.object({
    propertyId: Joi.string().optional().allow(null, ''),
    propertyTitle: Joi.string().trim().required().messages({
      'string.empty': 'Property title is required',
      'any.required': 'Property title is required'
    }),
    name: Joi.string().trim().max(100).required().messages({
      'string.empty': 'Name is required',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email',
      'any.required': 'Email is required'
    }),
    phone: Joi.string().trim().required().messages({
      'string.empty': 'Phone number is required',
      'any.required': 'Phone number is required'
    }),
    message: Joi.string().trim().max(1000).required().messages({
      'string.empty': 'Message is required',
      'string.max': 'Message cannot exceed 1000 characters',
      'any.required': 'Message is required'
    })
  }),

  // Inquiry status update
  inquiryStatus: Joi.object({
    status: Joi.string().valid('new', 'contacted', 'closed').required().messages({
      'any.only': 'Status must be new, contacted, or closed',
      'any.required': 'Status is required'
    }),
    notes: Joi.string().max(500).optional()
  })
};

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        errors: errorMessage
      });
    }
    
    next();
  };
};

const querySchemas = {
  propertySearch: Joi.object({
    propertyType: Joi.string().valid('land', 'student_housing', 'residential').optional(),
    listingType: Joi.string().valid('sale', 'rent').optional(),
    sector: Joi.string().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    isVerified: Joi.boolean().optional(),
    isFeatured: Joi.boolean().optional(),
    searchTerm: Joi.string().optional(),
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).max(500).optional()
  })
};

module.exports = {
  validate,
  schemas,
  validateQuery,
  querySchemas
};
