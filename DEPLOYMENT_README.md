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
