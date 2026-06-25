const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
// Always resolve .env relative to the backend/ folder regardless of where script is run from
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const Assistant = require('../models/Assistant');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carryhand';

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany();
  await Assistant.deleteMany();
  await Booking.deleteMany();
  await Review.deleteMany();
  console.log('Cleared existing data');

  // Admin
  await User.create({ name: 'Admin User', email: 'admin@carryhand.com', password: 'admin123', role: 'admin', isVerified: true });

  // Customers
  const customers = await User.insertMany([
    { name: 'Priya Sharma', email: 'priya@example.com', password: await bcrypt.hash('password123', 12), phone: '9876543210', role: 'customer' },
    { name: 'Rahul Gupta', email: 'rahul@example.com', password: await bcrypt.hash('password123', 12), phone: '9876543211', role: 'customer' },
    { name: 'Anjali Singh', email: 'anjali@example.com', password: await bcrypt.hash('password123', 12), phone: '9876543212', role: 'customer' },
  ]);

  // Assistants
  const assistantUsers = await User.insertMany([
    { name: 'Ramesh Kumar', email: 'ramesh@example.com', password: await bcrypt.hash('password123', 12), phone: '9876543213', role: 'assistant', isVerified: true },
    { name: 'Sunita Devi', email: 'sunita@example.com', password: await bcrypt.hash('password123', 12), phone: '9876543214', role: 'assistant', isVerified: true },
    { name: 'Vijay Patel', email: 'vijay@example.com', password: await bcrypt.hash('password123', 12), phone: '9876543215', role: 'assistant', isVerified: true },
    { name: 'Kavita Rao', email: 'kavita@example.com', password: await bcrypt.hash('password123', 12), phone: '9876543216', role: 'assistant' },
  ]);

  await Assistant.insertMany([
    { user: assistantUsers[0]._id, bio: 'Experienced shopping assistant with 3 years of service. Friendly and reliable.', isApproved: true, isOnline: true, rating: 4.8, totalRatings: 24, completedJobs: 47, totalEarnings: 5640, languages: ['Hindi', 'English'], experience: '3 years', location: { city: 'Delhi', area: 'Connaught Place' }, approvedAt: new Date() },
    { user: assistantUsers[1]._id, bio: 'Professional assistant specializing in mall shopping. Know all major malls in Mumbai.', isApproved: true, isOnline: true, rating: 4.6, totalRatings: 18, completedJobs: 32, totalEarnings: 3840, languages: ['Hindi', 'Marathi', 'English'], experience: '2 years', location: { city: 'Mumbai', area: 'Andheri' }, approvedAt: new Date() },
    { user: assistantUsers[2]._id, bio: 'Strong and dependable. Specialized in heavy grocery and wholesale market shopping.', isApproved: true, isOnline: false, rating: 4.9, totalRatings: 31, completedJobs: 58, totalEarnings: 6960, languages: ['Hindi', 'Gujarati'], experience: '4 years', location: { city: 'Ahmedabad', area: 'SG Highway' }, approvedAt: new Date() },
    { user: assistantUsers[3]._id, bio: 'New assistant, eager to help!', isApproved: false, isOnline: false, rating: 0, totalRatings: 0, completedJobs: 0, totalEarnings: 0, languages: ['Hindi'], location: { city: 'Bangalore', area: 'MG Road' } },
  ]);

  // Bookings
  const bookings = await Booking.insertMany([
    { customer: customers[0]._id, assistant: assistantUsers[0]._id, location: { name: 'Select City Walk', address: 'Saket, New Delhi', type: 'mall' }, duration: 2, status: 'completed', startTime: new Date(Date.now() - 86400000), endTime: new Date(Date.now() - 79200000), price: 300, paymentStatus: 'paid', reviewGiven: true },
    { customer: customers[1]._id, assistant: assistantUsers[1]._id, location: { name: 'Phoenix Market City', address: 'Kurla, Mumbai', type: 'mall' }, duration: 3, status: 'active', startTime: new Date(), price: 450, paymentStatus: 'pending' },
    { customer: customers[2]._id, location: { name: 'Lajpat Nagar Market', address: 'Lajpat Nagar, New Delhi', type: 'market' }, duration: 1, status: 'pending', price: 150, paymentStatus: 'pending' },
    { customer: customers[0]._id, assistant: assistantUsers[2]._id, location: { name: 'Manek Chowk', address: 'Ahmedabad Old City', type: 'market' }, duration: 2, status: 'completed', startTime: new Date(Date.now() - 172800000), endTime: new Date(Date.now() - 165600000), price: 300, paymentStatus: 'paid', reviewGiven: false },
  ]);

  // Review
  await Review.create({
    booking: bookings[0]._id, customer: customers[0]._id, assistant: assistantUsers[0]._id,
    rating: 5, comment: 'Ramesh was amazing! Very helpful and strong. Will book again.', tags: ['Friendly', 'Strong', 'Punctual']
  });

  console.log('✅ Seed data inserted successfully!');
  console.log('\n--- Login Credentials ---');
  console.log('Admin:    admin@carryhand.com  / admin123');
  console.log('Customer: priya@example.com    / password123');
  console.log('Assistant: ramesh@example.com  / password123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
