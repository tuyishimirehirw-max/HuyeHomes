const express = require('express');
const Property = require('../models/Property');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { validate, validateQuery, schemas, querySchemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Get all properties with filtering
// @route   GET /api/properties
// @access  Public
router.get('/', validateQuery(querySchemas.propertySearch), asyncHandler(async (req, res) => {
  const {
    propertyType,
    listingType,
    sector,
    minPrice,
    maxPrice,
    isVerified,
    isFeatured,
    searchTerm,
    page = 1,
    limit = 12
  } = req.query;

  // Build filters object
  const filters = {
    propertyType,
    listingType,
    sector,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    isVerified: isVerified !== undefined ? isVerified === 'true' : undefined,
    isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
    searchTerm
  };

  // Pagination options
  const skip = (Number(page) - 1) * Number(limit);
  const options = {
    limit: Number(limit),
    skip
  };

  // Get properties
  const properties = await Property.searchProperties(filters, options);
  
  // Get total count for pagination
  const totalCount = await Property.countDocuments(
    Property.searchProperties(filters, {}).getQuery()
  );

  res.json({
    success: true,
    data: {
      properties,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalProperties: totalCount,
        hasNext: Number(page) < Math.ceil(totalCount / Number(limit)),
        hasPrev: Number(page) > 1
      }
    }
  });
}));

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
router.get('/featured', asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 6;
  const properties = await Property.findFeatured(limit);

  res.json({
    success: true,
    data: {
      properties
    }
  });
}));

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
router.get('/:id([0-9a-fA-F]{24})', asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  // Increment view count
  property.viewCount += 1;
  await property.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: {
      property
    }
  });
}));

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Admin only)
router.post('/', authenticate, authorize('admin'), validate(schemas.property), asyncHandler(async (req, res) => {
  const propertyData = req.body;

  const property = await Property.create(propertyData);

  res.status(201).json({
    success: true,
    message: 'Property created successfully',
    data: {
      property
    }
  });
}));

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Admin only)
router.put('/:id', authenticate, authorize('admin'), validate(schemas.propertyUpdate), asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  const updatedProperty = await Property.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Property updated successfully',
    data: {
      property: updatedProperty
    }
  });
}));

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  await Property.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Property deleted successfully'
  });
}));

// @desc    Update property status
// @route   PATCH /api/properties/:id/status
// @access  Private (Admin only)
router.patch('/:id/status', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['active', 'pending', 'sold', 'rented'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  res.json({
    success: true,
    message: 'Property status updated successfully',
    data: {
      property
    }
  });
}));

// @desc    Toggle property verification
// @route   PATCH /api/properties/:id/verify
// @access  Private (Admin only)
router.patch('/:id/verify', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  property.isVerified = !property.isVerified;
  await property.save();

  res.json({
    success: true,
    message: `Property ${property.isVerified ? 'verified' : 'unverified'} successfully`,
    data: {
      property
    }
  });
}));

// @desc    Toggle property featured status
// @route   PATCH /api/properties/:id/feature
// @access  Private (Admin only)
router.patch('/:id/feature', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    return res.status(404).json({
      success: false,
      message: 'Property not found'
    });
  }

  property.isFeatured = !property.isFeatured;
  await property.save();

  res.json({
    success: true,
    message: `Property ${property.isFeatured ? 'featured' : 'unfeatured'} successfully`,
    data: {
      property
    }
  });
}));

// @desc    Get properties by sector
// @route   GET /api/properties/sector/:sector
// @access  Public
router.get('/sector/:sector', asyncHandler(async (req, res) => {
  const properties = await Property.findBySector(req.params.sector);

  res.json({
    success: true,
    data: {
      properties
    }
  });
}));

// @desc    Get property statistics
// @route   GET /api/properties/stats
// @access  Private (Admin only)
router.get('/stats', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const stats = await Property.aggregate([
    {
      $group: {
        _id: null,
        totalProperties: { $sum: 1 },
        activeProperties: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        verifiedProperties: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        },
        featuredProperties: {
          $sum: { $cond: ['$isFeatured', 1, 0] }
        },
        landProperties: {
          $sum: { $cond: [{ $eq: ['$propertyType', 'land'] }, 1, 0] }
        },
        studentHousingProperties: {
          $sum: { $cond: [{ $eq: ['$propertyType', 'student_housing'] }, 1, 0] }
        },
        residentialProperties: {
          $sum: { $cond: [{ $eq: ['$propertyType', 'residential'] }, 1, 0] }
        },
        totalViews: { $sum: '$viewCount' },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);

  const statsByType = await Property.aggregate([
    {
      $group: {
        _id: '$propertyType',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);

  const statsBySector = await Property.aggregate([
    {
      $group: {
        _id: '$location.sector',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats[0] || {},
      byType: statsByType,
      bySector: statsBySector
    }
  });
}));

module.exports = router;
