const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    // Clear existing data
    await Property.deleteMany({});
    await User.deleteMany({});

    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = 'admin123';
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@huyehomes.rw',
      passwordHash: adminPassword,
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      }
    });

    console.log('Created admin user:', adminUser.username);

    // Sample properties data
    const properties = [
      {
        title: 'Hilltop View Plot',
        description: 'Prime residential plot with stunning views of Huye valley. Perfect for building your dream home with easy access to main roads and utilities.',
        propertyType: 'land',
        listingType: 'sale',
        price: 8500000,
        priceUnit: 'RWF',
        location: {
          sector: 'Taba',
          district: 'Huye',
          coordinates: { lat: -2.5833, lng: 29.7500 }
        },
        size: {
          sqm: 450,
          hectares: 0.045
        },
        features: ['Tarmac Access', 'Water Connection', 'Electricity Available'],
        amenities: {
          wifi: false,
          parking: true,
          security: true,
          furnished: false,
          water: true,
          electricity: true
        },
        images: [
          {
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxZVfuem6oGoYRf2CjryI3-aCNdrN6DNjmf3oPw-e3cyf8MYtKMSDQk7KSpta7dcbHHOCBDhW6NHGaiprUEb6_pc54Lfqshfyz-RIyvgfIy_FdrTtFnz70xAMHsJr2fOZQMHYcnVHz6U_PgJI8RvQfD3RI1dXjyoNsSD9oDHnsRF-19hQNcLjLiDASQ1oVAZEqrBnwSF-j803uqeeNEtZvSUT1wXRIWy-2oF_IjO-PT6LzP6g7Rcn3on23ofOWBU_driDBROztk6UY',
            alt: 'Hilltop View Plot - Taba',
            isPrimary: true,
            publicId: 'huyehomes/properties/hilltop_plot_1'
          }
        ],
        contact: {
          name: 'John Doe',
          phone: '+250788123456',
          email: 'john@example.com'
        },
        status: 'active',
        isVerified: true,
        isFeatured: true
      },
      {
        title: 'Student Oasis Hostel',
        description: 'Comfortable student accommodation near University of Rwanda. Single rooms with free WiFi and included utilities.',
        propertyType: 'student_housing',
        listingType: 'rent',
        price: 45000,
        priceUnit: 'RWF/mo',
        location: {
          sector: 'Ngoma',
          district: 'Huye',
          coordinates: { lat: -2.5900, lng: 29.7600 }
        },
        size: {
          sqm: 15
        },
        features: ['Near UR Campus', 'Free WiFi', 'Water Included', 'Security 24/7'],
        amenities: {
          wifi: true,
          parking: false,
          security: true,
          furnished: true,
          water: true,
          electricity: true
        },
        images: [
          {
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9QBfhVKyGF0nzIaSIpAsXNKBuxu70kCprMLFdBqolmBEf0lMK_v27FLM4lHaWV6cDo1cmj7Afk5Gd_gO9QsqzI-O-8dP1U1mECnpyCovrtn0QT1vIFTiRZgtG57NdzahrY5gjoWbJCoesieQynyti-lgxXHRHDJPy7lieTMglKOLYVl75pbrd1y0HSb5lDT89KLAm7DJuEA4PN5V56jx6OAnwsJWtEWDmpg5niJu6c6rrjftWcUutGmyzrlE2t6B1AXKlcQ9pJP28',
            alt: 'Student Oasis Hostel',
            isPrimary: true,
            publicId: 'huyehomes/properties/student_oasis_1'
          }
        ],
        contact: {
          name: 'Mary Johnson',
          phone: '+250787654321',
          email: 'mary@studenthostels.rw'
        },
        status: 'active',
        isVerified: true,
        isFeatured: true
      },
      {
        title: 'Prime Agricultural Land',
        description: 'Fertile agricultural land with irrigation potential. Perfect for farming or future development. Good road access.',
        propertyType: 'land',
        listingType: 'sale',
        price: 12000000,
        priceUnit: 'RWF',
        location: {
          sector: 'Mbazi',
          district: 'Huye',
          coordinates: { lat: -2.6000, lng: 29.7700 }
        },
        size: {
          sqm: 12000,
          hectares: 1.2
        },
        features: ['Fertile Soil', 'Near Stream', 'Road Access', 'Irrigation Ready'],
        amenities: {
          wifi: false,
          parking: true,
          security: false,
          furnished: false,
          water: true,
          electricity: false
        },
        images: [
          {
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRJXR8e2CwibPri9OYaxE7tIZulnEeZMy88aGXmPWAEMM-Frpr_l0YesIBEARr-psk9JUFZ2qGhUAoBvpHOlT4DlWS2cjrVHZRrzH8bFIzpXPQPSQGgXRhU7ZTpE3_hYOygWVblkFfGwP1d4df_9d7vjoLdTuDIPyr1pseWlOVxCyHG2CeJ-I04GAltjUinlNsvvgHUbPoPHMetCeQKyARKdJMgCUzYPdysbCaAuasvXidT0t2B5k_Hia5LiMxbqGAHXVhUDK-FVGP',
            alt: 'Agricultural Land',
            isPrimary: true,
            publicId: 'huyehomes/properties/agricultural_land_1'
          }
        ],
        contact: {
          name: 'Jean Pierre',
          phone: '+250785555555',
          email: 'jean@agriculture.rw'
        },
        status: 'active',
        isVerified: true,
        isFeatured: false
      },
      {
        title: 'Green View Ghetto',
        description: 'Affordable student housing with green views. 5 minutes walk to campus with basic amenities included.',
        propertyType: 'student_housing',
        listingType: 'rent',
        price: 35000,
        priceUnit: 'RWF/mo',
        location: {
          sector: 'Taba',
          district: 'Huye'
        },
        size: {
          sqm: 12
        },
        features: ['5 mins to Campus', 'Free WiFi', 'Quiet Environment'],
        amenities: {
          wifi: true,
          parking: false,
          security: true,
          furnished: false,
          water: true,
          electricity: true
        },
        images: [
          {
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1oMjjxCP32MdvEvLeATJ4yPpQcXINEitKfzZPvMZfhkX41XianIP5MdW7yMB7bsFDPKiys38pXPVy8UkxhH68RuQeAcdOltMyhg3abymErJdI7MOkbzDyHLrumaRYxzv5A56wIx86ZNwukdJd3fdYybYcQm432Fd-bvhUouQ7xsaYVOYXkGY9cMNlFoyJOCsqtNS4J233FtCoC2hC6cHgSfwdu5VZ4rDU0VltwFD4VFd3k-mbD9uoRM8OZW5TpD9gyJHHLE3KBjYb',
            alt: 'Green View Ghetto',
            isPrimary: true,
            publicId: 'huyehomes/properties/green_view_1'
          }
        ],
        contact: {
          name: 'Alice Mugisha',
          phone: '+250784444444',
          email: 'alice@studenthousing.rw'
        },
        status: 'active',
        isVerified: true,
        isFeatured: false
      },
      {
        title: 'Campus Gate Suites',
        description: 'Premium student accommodation right at the university gate. Modern facilities with 24/7 security.',
        propertyType: 'student_housing',
        listingType: 'rent',
        price: 55000,
        priceUnit: 'RWF/mo',
        location: {
          sector: 'Ngoma',
          district: 'Huye'
        },
        size: {
          sqm: 18
        },
        features: ['2 mins to Campus', 'Modern Facilities', '24/7 Security', 'Study Areas'],
        amenities: {
          wifi: true,
          parking: true,
          security: true,
          furnished: true,
          water: true,
          electricity: true
        },
        images: [
          {
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1PM6aPXt_n77uk-0DYUxMwvOrRKb3wmg3cKOTIh-UAo1f6YAIo-W9JraFMV93SJ50IHzNrEp5z2ODuSgQR6q8yTPH61wUD8udEPEPOGCcgKcNO1vJQQ7j_WcKss6LdrQBvZmgqi2rTitrtESY5G1QX1u5kpkw8GUdG-AIfFqOCQFwourH7fL5BFMMujJSjssBHrXaus0Gw8BG5ggNOzHMRwWqUllE6qT9FVCpIPFIIOg56-rSR0SxNWRKslAg4W5FWaA3e8GdJCOh',
            alt: 'Campus Gate Suites',
            isPrimary: true,
            publicId: 'huyehomes/properties/campus_gate_1'
          }
        ],
        contact: {
          name: 'Robert Kamanzi',
          phone: '+250783333333',
          email: 'robert@campusgate.rw'
        },
        status: 'active',
        isVerified: true,
        isFeatured: true
      },
      {
        title: 'Residential Plot in Tumba',
        description: 'Well-located residential plot in Tumba sector. Ready for construction with all utilities available.',
        propertyType: 'land',
        listingType: 'sale',
        price: 8500000,
        priceUnit: 'RWF',
        location: {
          sector: 'Tumba',
          district: 'Huye'
        },
        size: {
          sqm: 600,
          hectares: 0.06
        },
        features: ['Tarmac Access', 'Water Connection', 'Electricity Available', 'Flat Terrain'],
        amenities: {
          wifi: false,
          parking: true,
          security: false,
          furnished: false,
          water: true,
          electricity: true
        },
        images: [
          {
            url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaJeKbSFvHfWuFV7cPShyRJ88d2oG8kO1m6z-ab9TGZNsux16wz9Ar8B1jjbfHvLwxtumbBrAI-7SxSfArFmQFt0yMjZFWoPIwb3vYvw6Kij8unG0IRv0pi0T1fnYnYRmOVzzOtf5QvFMKydvPJ60XNfk8jocHlyFBz_7QkVJH1kA1GwXbOi73DlSmboebS919mdHRMZKzYNkdT_CAo0LliW9D51IK3OFT9gGa7X_htrC__ifrRQvbR9MDRRGXYVp9U0hkIptO7V9t',
            alt: 'Residential Plot in Tumba',
            isPrimary: true,
            publicId: 'huyehomes/properties/tumba_plot_1'
          }
        ],
        contact: {
          name: 'Grace Uwimana',
          phone: '+250782222222',
          email: 'grace@realestate.rw'
        },
        status: 'active',
        isVerified: true,
        isFeatured: false
      }
    ];

    // Insert properties
    const createdProperties = await Property.insertMany(properties);
    console.log(`Created ${createdProperties.length} properties`);

    console.log('Database seeded successfully!');
    
    return {
      admin: adminUser,
      properties: createdProperties
    };

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = seedData;
