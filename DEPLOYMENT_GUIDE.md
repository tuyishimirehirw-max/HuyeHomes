# Huye Homes Platform Deployment Guide

Complete guide for deploying the MongoDB-powered Huye Homes real estate platform with admin panel.

## Overview

The platform consists of:
- **Backend API**: Node.js + Express + MongoDB
- **Admin Panel**: React.js with Material-UI
- **Frontend Website**: Enhanced static HTML/CSS/JS

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (recommended) or local MongoDB
- Cloudinary account (for image uploads)
- Git for version control
- Code editor (VS Code recommended)

## Step 1: Backend Setup

### 1.1 Clone and Setup
```bash
cd huyehomes-backend
npm install
```

### 1.2 Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/huyehomes

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS Configuration
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### 1.3 Database Setup
```bash
# Seed database with sample data
node src/utils/seed.js
```

### 1.4 Start Backend Development Server
```bash
npm run dev
```

Backend will be available at `http://localhost:5000`

## Step 2: Admin Panel Setup

### 2.1 Clone and Setup
```bash
cd huyehomes-admin
npm install
```

### 2.2 Start Admin Development Server
```bash
npm start
```

Admin panel will be available at `http://localhost:3001`

### 2.3 Login Credentials
- Username: `admin`
- Password: `admin123`

## Step 3: Frontend Website Integration

### 3.1 Current Website Location
Your existing website is at: `/home/robert-hirwa/Downloads/Compressed/HuyeRealEstate/website`

### 3.2 Integration Steps
The backend API will serve data to your existing static pages. You'll need to:

1. **Update existing HTML files** to fetch data from the API
2. **Add JavaScript** for dynamic content loading
3. **Implement search and filtering** functionality
4. **Add contact forms** for property inquiries

### 3.3 Example Integration Code

#### Fetch Properties for Homepage
```javascript
// Add to your existing main.js
async function loadFeaturedProperties() {
  try {
    const response = await fetch('http://localhost:5000/api/properties/featured?limit=3');
    const data = await response.json();
    
    if (data.success) {
      renderFeaturedProperties(data.data.properties);
    }
  } catch (error) {
    console.error('Error loading properties:', error);
  }
}

function renderFeaturedProperties(properties) {
  // Update your existing property cards with dynamic data
  const container = document.querySelector('.property-cards-container');
  container.innerHTML = properties.map(property => `
    <div class="property-card">
      <div class="card-image">
        <img src="${property.images[0]?.url}" alt="${property.title}">
        ${property.isVerified ? '<span class="badge badge-verified">Verified</span>' : ''}
      </div>
      <div class="card-content">
        <h3 class="card-title">${property.title}</h3>
        <p class="card-location">
          <i class="fa-solid fa-map-marker-alt"></i> ${property.location.sector}, ${property.location.district}
        </p>
        <div class="card-features">
          ${property.features.map(feature => `<div class="feature-item">${feature}</div>`).join('')}
        </div>
        <div class="card-footer">
          <div class="card-price">${property.formattedPrice}</div>
          <a href="property-detail.html?id=${property._id}" class="btn-primary">View Details</a>
        </div>
      </div>
    </div>
  `).join('');
}

// Load on page load
document.addEventListener('DOMContentLoaded', loadFeaturedProperties);
```

#### Property Inquiry Form
```javascript
async function submitInquiry(formData) {
  try {
    const response = await fetch('http://localhost:5000/api/inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Inquiry submitted successfully!');
      // Reset form
      document.getElementById('inquiry-form').reset();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error submitting inquiry:', error);
    alert('Failed to submit inquiry. Please try again.');
  }
}
```

## Step 4: Production Deployment

### 4.1 Backend Deployment (Heroku)

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create huyehomes-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your-production-secret
heroku config:set CLOUDINARY_CLOUD_NAME=...
heroku config:set CLOUDINARY_API_KEY=...
heroku config:set CLOUDINARY_API_SECRET=...

# Deploy
git add .
git commit -m "Deploy to production"
git push heroku main
```

### 4.2 Admin Panel Deployment (Netlify)

```bash
# Build the admin panel
cd huyehomes-admin
npm run build

# Deploy to Netlify
# 1. Create account at netlify.com
# 2. Drag and drop the build folder
# OR use Netlify CLI:
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### 4.3 Frontend Website Deployment

Your existing static website can be deployed to:
- **Netlify** (recommended)
- **Vercel**
- **GitHub Pages**
- **AWS S3**

For Netlify:
```bash
# From your website directory
netlify deploy --prod --dir=.
```

## Step 5: Environment Configuration

### Development Environment
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/huyehomes
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### Production Environment
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/huyehomes
FRONTEND_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
```

## Step 6: Security Considerations

### 6.1 Database Security
- Use MongoDB Atlas with IP whitelisting
- Enable database authentication
- Regular backups
- Monitor for unusual activity

### 6.2 API Security
- Strong JWT secrets
- Rate limiting implemented
- Input validation
- HTTPS only in production
- CORS properly configured

### 6.3 File Upload Security
- Cloudinary handles image security
- File type validation
- Size limits enforced
- Malware scanning (Cloudinary)

## Step 7: Monitoring and Maintenance

### 7.1 Application Monitoring
```bash
# Check logs
heroku logs --tail --app huyehomes-backend

# Monitor performance
# Consider using:
# - New Relic
# - Datadog
# - Sentry for error tracking
```

### 7.2 Database Monitoring
- MongoDB Atlas provides monitoring dashboard
- Track query performance
- Monitor storage usage
- Set up alerts for unusual activity

### 7.3 Regular Tasks
- Update dependencies
- Security patches
- Database backups
- Performance optimization
- Content moderation

## Step 8: Testing

### 8.1 Backend Testing
```bash
cd huyehomes-backend
npm test
```

### 8.2 Integration Testing
- Test all API endpoints
- Verify image uploads
- Test authentication flow
- Check database operations

### 8.3 Frontend Testing
- Test admin panel functionality
- Verify property management
- Test inquiry system
- Check responsive design

## Step 9: Backup and Recovery

### 9.1 Database Backups
- MongoDB Atlas automated backups
- Export data regularly:
```bash
mongodump --uri="mongodb+srv://..." --out=backup-$(date +%Y-%m-%d)
```

### 9.2 File Backups
- Cloudinary provides redundancy
- Export critical data periodically
- Document custom configurations

## Step 10: Scaling Considerations

### 10.1 Database Scaling
- MongoDB Atlas scaling options
- Read replicas for high traffic
- Sharding for large datasets

### 10.2 Application Scaling
- Load balancers
- Multiple app instances
- CDN for static assets
- Caching with Redis

## Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check MongoDB connection
mongosh "mongodb+srv://..."

# Check environment variables
printenv | grep MONGODB

# Check logs
npm start
```

#### Admin Panel Can't Connect
```bash
# Check CORS configuration
# Verify API URL in .env
# Check network connectivity
```

#### Image Uploads Fail
```bash
# Verify Cloudinary credentials
# Check file size limits
# Test API endpoint directly
```

#### Database Issues
```bash
# Check connection string
# Verify user permissions
# Check Atlas status page
```

## Support

For technical support:
1. Check this guide first
2. Review application logs
3. Check MongoDB Atlas status
4. Verify Cloudinary configuration
5. Test API endpoints individually

## Next Steps

After successful deployment:
1. Monitor performance
2. Gather user feedback
3. Plan feature enhancements
4. Regular security audits
5. Performance optimization
6. Content strategy planning

This deployment guide provides everything needed to successfully deploy and maintain your Huye Homes real estate platform.
