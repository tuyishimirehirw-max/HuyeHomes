const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'huyehomes/properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' },
      { fetch_format: 'auto' }
    ]
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 10 // Max 10 files at once
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    }
  }
});

// @desc    Upload property images
// @route   POST /api/upload/property-images
// @access  Private (Admin only)
router.post('/property-images', authenticate, authorize('admin'), upload.array('images', 10), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No images uploaded'
    });
  }

  const uploadedImages = req.files.map(file => ({
    url: file.secure_url,
    alt: file.originalname,
    publicId: file.public_id,
    isPrimary: false
  }));

  // If this is the first image, mark it as primary
  if (uploadedImages.length > 0) {
    uploadedImages[0].isPrimary = true;
  }

  res.status(201).json({
    success: true,
    message: `${req.files.length} images uploaded successfully`,
    data: {
      images: uploadedImages
    }
  });
}));

// @desc    Upload single image
// @route   POST /api/upload/single
// @access  Private (Admin only)
router.post('/single', authenticate, authorize('admin'), upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image uploaded'
    });
  }

  const uploadedImage = {
    url: req.file.secure_url,
    alt: req.file.originalname,
    publicId: req.file.public_id,
    isPrimary: true
  };

  res.status(201).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      image: uploadedImage
    }
  });
}));

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private (Admin only)
router.delete('/:publicId', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  if (!publicId) {
    return res.status(400).json({
      success: false,
      message: 'Public ID is required'
    });
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else if (result.result === 'not found') {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete image',
        error: result.result
      });
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image from cloud storage'
    });
  }
}));

// @desc    Get image info
// @route   GET /api/upload/info/:publicId
// @access  Private (Admin only)
router.get('/info/:publicId', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  try {
    const result = await cloudinary.api.resource(publicId);

    res.json({
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        createdAt: result.created_at
      }
    });
  } catch (error) {
    if (error.http_code === 404) {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    } else {
      console.error('Cloudinary info error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get image info'
      });
    }
  }
}));

// @desc    Bulk delete images
// @route   DELETE /api/upload/bulk
// @access  Private (Admin only)
router.delete('/bulk', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { publicIds } = req.body;

  if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Public IDs are required'
    });
  }

  try {
    const deletePromises = publicIds.map(publicId => 
      cloudinary.uploader.destroy(publicId)
    );

    const results = await Promise.all(deletePromises);

    const successful = results.filter(r => r.result === 'ok').length;
    const failed = results.length - successful;

    res.json({
      success: true,
      message: `${successful} images deleted successfully${failed > 0 ? `, ${failed} failed` : ''}`,
      data: {
        successful,
        failed,
        total: results.length
      }
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete images'
    });
  }
}));

// @desc    Generate image signature for client-side upload
// @route   GET /api/upload/signature
// @access  Private (Admin only)
router.get('/signature', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp: timestamp,
    folder: 'huyehomes/properties',
    transformation: 'c_limit,w_1200,h_800,q_auto:good,f_auto'
  };

  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

  res.json({
    success: true,
    data: {
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: params.folder,
      transformation: params.transformation
    }
  });
}));

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field'
      });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
});

module.exports = router;
