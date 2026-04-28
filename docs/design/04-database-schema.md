# Database Schema

## Overview
MongoDB document database. 4 main collections with references between them.

---

## Collection: users

```json
{
  "_id": ObjectId,
  "name": String (required, max 50),
  "email": String (required, unique, lowercase),
  "password": String (required, hashed, select: false),
  "role": String (enum: customer|restaurant|rider|admin, default: customer),
  "phone": String (required, 10-15 digits),
  "avatar": String (URL),
  "address": {
    "street": String,
    "city": String,
    "state": String,
    "zipCode": String,
    "country": String (default: Pakistan),
    "coordinates": { "lat": Number, "lng": Number }
  },
  "isVerified": Boolean (default: false),
  "isActive": Boolean (default: true),
  "lastLogin": Date,
  "createdAt": Date,
  "updatedAt": Date
}
```

**Indexes:** email (unique)

---

## Collection: restaurants

```json
{
  "_id": ObjectId,
  "owner": ObjectId → users._id (required),
  "name": String (required, max 100),
  "description": String (max 1000),
  "cuisine": [String] (required),
  "address": {
    "street": String (required),
    "city": String (required),
    "state": String (required),
    "zipCode": String (required),
    "country": String (default: Pakistan),
    "coordinates": { "lat": Number (required), "lng": Number (required) }
  },
  "contact": {
    "phone": String (required),
    "email": String,
    "website": String
  },
  "images": {
    "logo": String (URL),
    "cover": String (URL),
    "gallery": [String]
  },
  "menu": [
    {
      "_id": ObjectId,
      "name": String (required),
      "description": String (max 500),
      "price": Number (required, min 0),
      "category": String (enum: appetizer|main-course|dessert|beverage|special),
      "image": String (URL),
      "isAvailable": Boolean (default: true),
      "preparationTime": Number (minutes, default: 20),
      "dietaryTags": [String] (enum: vegan|vegetarian|gluten-free|halal|keto|dairy-free|nut-free),
      "allergens": [String],
      "spiceLevel": String (enum: mild|medium|hot|extra-hot),
      "calories": Number,
      "rating": { "average": Number, "count": Number }
    }
  ],
  "rating": { "average": Number (0-5), "count": Number },
  "pricing": {
    "commissionRate": Number (default: 15, min: 10, max: 20),
    "minimumOrder": Number (default: 100 PKR)
  },
  "delivery": {
    "isAvailable": Boolean,
    "radius": Number (km),
    "fee": Number (PKR),
    "estimatedTime": Number (minutes)
  },
  "openingHours": {
    "monday|tuesday|...|sunday": {
      "open": String (HH:MM),
      "close": String (HH:MM),
      "isOpen": Boolean
    }
  },
  "features": {
    "hasDelivery": Boolean,
    "hasPickup": Boolean,
    "hasDineIn": Boolean,
    "acceptsCash": Boolean,
    "acceptsCard": Boolean
  },
  "status": {
    "isActive": Boolean,
    "isVerified": Boolean,
    "isFeatured": Boolean
  },
  "stats": {
    "totalOrders": Number,
    "totalRevenue": Number,
    "views": Number
  },
  "createdAt": Date,
  "updatedAt": Date
}
```

**Indexes:** `address.coordinates` (2dsphere for geospatial queries)

---

## Collection: orders

```json
{
  "_id": ObjectId,
  "orderNumber": String (unique, auto-generated: FB202604XXXX),
  "customer": ObjectId → users._id (required),
  "restaurant": ObjectId → restaurants._id (required),
  "rider": ObjectId → users._id (optional),
  "items": [
    {
      "menuItemId": ObjectId,
      "name": String,
      "price": Number,
      "quantity": Number (min: 1),
      "specialInstructions": String,
      "subtotal": Number
    }
  ],
  "pricing": {
    "subtotal": Number (required),
    "platformFee": Number (15% of subtotal),
    "deliveryFee": Number (default: 50 PKR),
    "tax": Number,
    "discount": Number,
    "total": Number (required)
  },
  "deliveryAddress": {
    "street": String (required),
    "city": String (required),
    "zipCode": String,
    "coordinates": { "lat": Number, "lng": Number },
    "instructions": String
  },
  "status": String (enum: pending|confirmed|preparing|ready-for-pickup|picked-up|on-the-way|delivered|cancelled),
  "statusHistory": [
    { "status": String, "timestamp": Date, "note": String }
  ],
  "payment": {
    "method": String (enum: cash|card|wallet, required),
    "status": String (enum: pending|paid|failed|refunded),
    "transactionId": String,
    "paidAt": Date
  },
  "promoCode": { "code": String, "discount": Number },
  "timing": {
    "ordered": Date,
    "confirmed": Date,
    "preparing": Date,
    "readyForPickup": Date,
    "pickedUp": Date,
    "onTheWay": Date,
    "delivered": Date,
    "estimatedDelivery": Date
  },
  "rating": {
    "food": Number (1-5),
    "delivery": Number (1-5),
    "overall": Number (1-5),
    "review": String,
    "reviewedAt": Date
  },
  "cancellation": {
    "reason": String,
    "cancelledBy": String (enum: customer|restaurant|rider|admin),
    "cancelledAt": Date
  },
  "createdAt": Date,
  "updatedAt": Date
}
```

---

## Collection: reviews

```json
{
  "_id": ObjectId,
  "order": ObjectId → orders._id (required),
  "customer": ObjectId → users._id (required),
  "restaurant": ObjectId → restaurants._id (required),
  "rating": {
    "food": Number (1-5, required),
    "service": Number (1-5, required),
    "delivery": Number (1-5, required),
    "overall": Number (1-5, required)
  },
  "comment": String (max 500),
  "images": [String],
  "isVerifiedPurchase": Boolean (default: true),
  "helpfulCount": Number,
  "restaurantResponse": {
    "message": String,
    "respondedAt": Date
  },
  "createdAt": Date,
  "updatedAt": Date
}
```

---

## ER Relationships

```
users (1) ──────────────────── (1) restaurants
  │ owner                         │
  │                               │ (embedded)
  │ customer                    menu[]
  │   │
  │   └──── (M) orders (1) ──── restaurants
  │               │
  │               └──── (1) reviews
  │
  │ rider
  └──────── (M) orders (assigned)
```

---
*FairBite Software Engineering Documentation — Version 1.0*
