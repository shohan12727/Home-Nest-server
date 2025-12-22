# 🏠 HomeNest – Server Side (Backend API)

This repository contains the **server-side implementation** of **HomeNest**, a real estate listing platform.  
The backend provides RESTful APIs to manage property listings, user data, and ratings while ensuring secure access through Firebase authentication.

---

## 🔗 Live Server URL

**API Base URL:** https://home-nest-7e180.web.app

---

## ⚙️ Server Features

- 🔐 **Secure API with Firebase Admin**
  - JWT token verification for protected routes
  - Ensures only authenticated users can access private endpoints

- 🏘️ **Property Management API**
  - Add new property listings
  - Update existing properties
  - Delete properties with authorization
  - Fetch all properties or user-specific properties

- 🔍 **Advanced Query Support**
  - Backend sorting (price / posted date)
  - Search properties by property name
  - Filter properties by user email

- ⭐ **Ratings & Reviews API**
  - Store property ratings (1–5 stars)
  - Save user reviews with timestamps
  - Fetch user-specific rating history

- 🗄️ **MongoDB Integration**
  - All data stored securely in MongoDB
  - Optimized queries using indexing and sorting

---

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB (Native Driver)
- Firebase Admin SDK
- CORS
- dotenv
- Nodemon (Development)

---

## 📦 NPM Packages

```json
express,
mongodb,
firebase-admin,
cors,
dotenv,
nodemon
