const express = require('express');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private (Admin only)
router.get('/', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const {
    status,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};
  if (status) {
    query.status = status;
  }

  // Sort options
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  const inquiries = await Inquiry.find(query)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .populate('propertyId', 'title propertyType images');

  const totalCount = await Inquiry.countDocuments(query);

  res.json({
    success: true,
    data: {
      inquiries,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit)),
        totalInquiries: totalCount,
        hasNext: Number(page) < Math.ceil(totalCount / Number(limit)),
        hasPrev: Number(page) > 1
      }
    }
  });
}));

// @desc    Get inquiries for a specific property
// @route   GET /api/inquiries/property/:propertyId
// @access  Private (Admin only)
router.get('/property/:propertyId', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.findByProperty(req.params.propertyId);

  res.json({
    success: true,
    data: {
      inquiries
    }
  });
}));

// @desc    Get inquiry statistics
// @route   GET /api/inquiries/stats
// @access  Private (Admin only)
router.get('/stats', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const stats = await Inquiry.getStats();

  const recentInquiries = await Inquiry.getRecentInquiries(5);

  const monthlyStats = await Inquiry.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  const responseTimeStats = await Inquiry.aggregate([
    {
      $match: { contactedAt: { $exists: true } }
    },
    {
      $addFields: {
        responseHours: {
          $divide: [
            { $subtract: ['$contactedAt', '$createdAt'] },
            1000 * 60 * 60 // Convert to hours
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgResponseTime: { $avg: '$responseHours' },
        minResponseTime: { $min: '$responseHours' },
        maxResponseTime: { $max: '$responseHours' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      byStatus: stats,
      recentInquiries,
      monthlyTrends: monthlyStats,
      responseTime: responseTimeStats[0] || null
    }
  });
}));

// @desc    Get single inquiry
// @route   GET /api/inquiries/:id
// @access  Private (Admin only)
router.get('/:id', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id)
    .populate('propertyId', 'title propertyType images location');

  if (!inquiry) {
    return res.status(404).json({
      success: false,
      message: 'Inquiry not found'
    });
  }

  res.json({
    success: true,
    data: {
      inquiry
    }
  });
}));

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Public
router.post('/', validate(schemas.inquiry), asyncHandler(async (req, res) => {
  const { propertyId, propertyTitle, name, email, phone, message } = req.body;
  const normalizedPropertyId = propertyId ? propertyId : undefined;

  // Verify property exists if propertyId is provided
  if (normalizedPropertyId) {
    const property = await Property.findById(normalizedPropertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
  }

  // Create inquiry
  const inquiry = await Inquiry.create({
    propertyId: normalizedPropertyId,
    propertyTitle,
    name,
    email,
    phone,
    message
  });

  // Populate property details for response if propertyId exists
  if (normalizedPropertyId) {
    await inquiry.populate('propertyId', 'title propertyType images');
  }

  res.status(201).json({
    success: true,
    message: 'Inquiry submitted successfully',
    data: {
      inquiry
    }
  });
}));

// @desc    Update inquiry status
// @route   PATCH /api/inquiries/:id/status
// @access  Private (Admin only)
router.patch('/:id/status', authenticate, authorize('admin'), validate(schemas.inquiryStatus), asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) {
    return res.status(404).json({
      success: false,
      message: 'Inquiry not found'
    });
  }

  inquiry.status = status;
  if (notes) inquiry.notes = notes;
  
  if (status === 'contacted' && !inquiry.contactedAt) {
    inquiry.contactedAt = new Date();
  }

  await inquiry.save();

  res.json({
    success: true,
    message: 'Inquiry status updated successfully',
    data: {
      inquiry
    }
  });
}));

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) {
    return res.status(404).json({
      success: false,
      message: 'Inquiry not found'
    });
  }

  await Inquiry.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Inquiry deleted successfully'
  });
}));

// @desc    Bulk update inquiry statuses
// @route   PATCH /api/inquiries/bulk-status
// @access  Private (Admin only)
router.patch('/bulk-status', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { inquiryIds, status, notes } = req.body;

  if (!inquiryIds || !Array.isArray(inquiryIds) || inquiryIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Inquiry IDs are required'
    });
  }

  if (!['new', 'contacted', 'closed'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const updateData = { status };
  if (notes) updateData.notes = notes;
  if (status === 'contacted') updateData.contactedAt = new Date();

  const result = await Inquiry.updateMany(
    { _id: { $in: inquiryIds } },
    updateData
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} inquiries updated successfully`,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
}));

// @desc    Bulk delete inquiries
// @route   DELETE /api/inquiries/bulk
// @access  Private (Admin only)
router.delete('/bulk', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { inquiryIds } = req.body;

  if (!inquiryIds || !Array.isArray(inquiryIds) || inquiryIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Inquiry IDs are required'
    });
  }

  const result = await Inquiry.deleteMany({ _id: { $in: inquiryIds } });

  res.json({
    success: true,
    message: `${result.deletedCount} inquiries deleted successfully`,
    data: {
      deletedCount: result.deletedCount
    }
  });
}));

module.exports = router;
