#!/bin/bash

# Huye Homes Deployment Script
# This script helps deploy the full-stack application

set -e

echo "🚀 Starting Huye Homes Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi

    print_status "All dependencies are installed."
}

# Build admin panel
build_admin() {
    print_status "Building admin panel..."
    cd huyehomes-admin
    npm install
    npm run build
    cd ..
    print_status "Admin panel built successfully."
}

# Prepare backend for deployment
prepare_backend() {
    print_status "Preparing backend for deployment..."
    cd huyehomes-backend

    # Create production package.json for backend
    cat > package.json << 'EOF'
{
  "name": "huyehomes-backend",
  "version": "1.0.0",
  "description": "Backend API for Huye Homes Real Estate Platform",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.9.2",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.40.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "dotenv": "^16.3.1"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

    npm install --production
    cd ..
    print_status "Backend prepared for deployment."
}

# Create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."

    # Create deployment directory
    mkdir -p deployment
    cd deployment

    # Copy backend
    cp -r ../huyehomes-backend/* ./

    # Copy admin build to serve statically
    mkdir -p public/admin
    cp -r ../huyehomes-admin/build/* ./public/admin/

    # Copy static frontend
    cp -r ../*.html ../css ../js ../build ./public/

    # Create production server.js that serves both API and static files
    cat > src/server.js << 'EOF'
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const inquiryRoutes = require('./routes/inquiries');
const uploadRoutes = require('./routes/upload');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/upload', uploadRoutes);

// Serve admin panel
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/index.html'));
});

// Serve main website
app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/huyehomes', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
});
EOF

    cd ..
    print_status "Deployment package created."
}

# Create environment file template
create_env_template() {
    print_status "Creating environment configuration template..."

    cat > .env.example << 'EOF'
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/huyehomes?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# Admin Credentials (will be created on first run)
ADMIN_EMAIL=admin@huyehomes.com
ADMIN_PASSWORD=change-this-password
EOF

    print_status "Environment template created."
}

# Create README for deployment
create_readme() {
    print_status "Creating deployment README..."

    cat > DEPLOYMENT_README.md << 'EOF'
# Huye Homes Deployment Guide

## Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Cloudinary account (for image uploads)
- Hosting platform (Heroku, Railway, Render, etc.)

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your actual values:
   - MongoDB connection string
   - JWT secret (generate a strong random string)
   - Cloudinary credentials
   - Your frontend domain

## Deployment Options

### Option 1: Heroku
1. Create a Heroku account
2. Install Heroku CLI
3. Run: `heroku create your-app-name`
4. Set environment variables: `heroku config:set KEY=VALUE`
5. Deploy: `git push heroku main`

### Option 2: Railway
1. Go to railway.app
2. Connect your GitHub repository
3. Add environment variables in dashboard
4. Deploy automatically

### Option 3: Render
1. Go to render.com
2. Create a new Web Service
3. Connect your repository
4. Set environment variables
5. Deploy

### Option 4: DigitalOcean App Platform
1. Go to DigitalOcean dashboard
2. Create a new app
3. Connect your repository
4. Configure environment variables
5. Deploy

## Database Setup
1. Create a MongoDB Atlas cluster
2. Get your connection string
3. Update MONGODB_URI in environment variables

## First Run
After deployment, the admin user will be created automatically with:
- Email: admin@huyehomes.com
- Password: (whatever you set in ADMIN_PASSWORD)

## File Structure
```
deployment/
├── src/
│   ├── server.js
│   ├── routes/
│   ├── models/
│   └── middleware/
├── public/
│   ├── index.html
│   ├── admin/
│   │   └── (admin panel files)
│   └── (other static files)
├── package.json
└── .env
```

## Troubleshooting
- Check logs: `heroku logs --tail`
- Verify environment variables are set correctly
- Ensure MongoDB connection string is valid
- Check that all dependencies are installed
EOF

    print_status "Deployment README created."
}

# Main deployment process
main() {
    print_status "Starting Huye Homes deployment preparation..."

    check_dependencies
    build_admin
    prepare_backend
    create_deployment_package
    create_env_template
    create_readme

    print_status "🎉 Deployment preparation complete!"
    print_status ""
    print_status "Next steps:"
    print_status "1. Set up your hosting platform (Heroku, Railway, Render, etc.)"
    print_status "2. Set up MongoDB Atlas database"
    print_status "3. Configure environment variables"
    print_status "4. Deploy the 'deployment' folder"
    print_status ""
    print_warning "Remember to change default passwords and secrets!"
}

# Run main function
main
EOF