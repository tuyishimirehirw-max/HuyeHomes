# Huye Homes Backend API

MongoDB-powered backend API for the Huye Homes real estate platform.

## Features

- **Property Management**: CRUD operations for land and student housing listings
- **User Authentication**: JWT-based admin authentication system
- **Inquiry Management**: Track and manage user property inquiries
- **Image Upload**: Cloudinary integration for property images
- **Advanced Search**: Filter properties by type, location, price, and more
- **Statistics Dashboard**: Comprehensive analytics and reporting

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **File Storage**: Cloudinary
- **Validation**: Joi
- **Security**: Helmet, CORS, rate limiting

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or MongoDB Atlas)
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with:
   - MongoDB connection string
   - JWT secret key
   - Cloudinary credentials
   - CORS origins

5. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/huyehomes

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS Configuration
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

## Database Seeding

To populate the database with sample data:

```bash
node src/utils/seed.js
```

This will create:
- An admin user (username: `admin`, password: `admin123`)
- Sample property listings
- Sample inquiry data

## API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "admin",
  "password": "admin123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Properties

#### Get All Properties
```http
GET /api/properties?propertyType=land&sector=Taba&page=1&limit=12
```

#### Get Featured Properties
```http
GET /api/properties/featured?limit=6
```

#### Create Property
```http
POST /api/properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Beautiful Plot in Taba",
  "description": "Prime residential plot...",
  "propertyType": "land",
  "listingType": "sale",
  "price": 8500000,
  "priceUnit": "RWF",
  "location": {
    "sector": "Taba",
    "district": "Huye"
  },
  "size": {
    "sqm": 450
  },
  "features": ["Tarmac Access", "Water Connection"],
  "contact": {
    "name": "John Doe",
    "phone": "+250788123456",
    "email": "john@example.com"
  }
}
```

#### Update Property
```http
PUT /api/properties/:id
Authorization: Bearer <token>
```

#### Delete Property
```http
DELETE /api/properties/:id
Authorization: Bearer <token>
```

### Inquiries

#### Get All Inquiries
```http
GET /api/inquiries?status=new&page=1&limit=20
Authorization: Bearer <token>
```

#### Create Inquiry
```http
POST /api/inquiries
Content-Type: application/json

{
  "propertyId": "property_id",
  "propertyTitle": "Beautiful Plot",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+250787654321",
  "message": "I'm interested in this property"
}
```

#### Update Inquiry Status
```http
PATCH /api/inquiries/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "contacted",
  "notes": "Called customer, interested in viewing"
}
```

### Image Upload

#### Upload Property Images
```http
POST /api/upload/property-images
Authorization: Bearer <token>
Content-Type: multipart/form-data

images: [File, File, ...]
```

#### Delete Image
```http
DELETE /api/upload/:publicId
Authorization: Bearer <token>
```

## Data Models

### Property Schema

```javascript
{
  title: String,
  description: String,
  propertyType: ['land', 'student_housing', 'residential'],
  listingType: ['sale', 'rent'],
  price: Number,
  priceUnit: ['RWF', 'RWF/mo'],
  location: {
    sector: String,
    district: String,
    coordinates: { lat: Number, lng: Number }
  },
  size: {
    sqm: Number,
    hectares: Number
  },
  features: [String],
  amenities: {
    wifi: Boolean,
    parking: Boolean,
    security: Boolean,
    furnished: Boolean,
    water: Boolean,
    electricity: Boolean
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean,
    publicId: String
  }],
  contact: {
    name: String,
    phone: String,
    email: String
  },
  status: ['active', 'pending', 'sold', 'rented'],
  isVerified: Boolean,
  isFeatured: Boolean,
  viewCount: Number
}
```

### User Schema

```javascript
{
  username: String,
  email: String,
  passwordHash: String,
  role: ['admin', 'moderator'],
  profile: {
    firstName: String,
    lastName: String
  },
  lastLogin: Date,
  isActive: Boolean
}
```

### Inquiry Schema

```javascript
{
  propertyId: ObjectId,
  propertyTitle: String,
  name: String,
  email: String,
  phone: String,
  message: String,
  status: ['new', 'contacted', 'closed'],
  notes: String,
  contactedAt: Date
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Input validation with Joi
- File upload security
- SQL injection prevention (NoSQL injection prevention)

## Performance Optimization

- Database indexing on frequently queried fields
- Text search indexes for property descriptions
- Connection pooling
- Query result caching (Redis ready)
- Image optimization via Cloudinary

## Deployment

### Production Setup

1. Set environment variables for production
2. Configure MongoDB Atlas
3. Set up Cloudinary
4. Deploy to Heroku/DigitalOcean

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=strong-secret-key
CLOUDINARY_CLOUD_NAME=...
```

## Monitoring

- Request logging with Morgan
- Error tracking and logging
- Performance monitoring ready
- Health check endpoint: `/health`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
