# Design Patterns

## 1. MVC (Model-View-Controller)

**Applied in:** Backend architecture

```
Model (Mongoose Schemas)
    User.js, Restaurant.js, Order.js, Review.js
    → Defines data structure and database interaction

Controller (Business Logic)
    authController.js, restaurantController.js, etc.
    → Handles request processing, calls models, formats responses

View (Routes + HTTP Responses)
    authRoutes.js, restaurantRoutes.js, etc.
    → Maps HTTP endpoints to controller functions
    → JSON responses consumed by React frontend
```

**Benefits:** Separation of concerns; easy to test controllers independently; clear responsibility boundaries.

---

## 2. Repository Pattern (via Mongoose)

**Applied in:** Data access layer

Mongoose models act as repositories, abstracting raw MongoDB queries:

```js
// Instead of raw DB queries:
db.collection('users').findOne({ email })

// We use the Repository pattern:
User.findOne({ email }).select('+password')
Restaurant.find(query).skip(skip).limit(limit)
Order.findById(id).populate('customer restaurant rider')
```

**Benefits:** Database-agnostic business logic; testable; consistent API.

---

## 3. Middleware Chain Pattern

**Applied in:** Express request pipeline

```
Request → Helmet → CORS → RateLimit → Router →
Auth Middleware → Controller → Response
```

Each middleware has a single responsibility and passes control via `next()`.

```js
// Composable middleware
router.post('/orders', protect, authorize('customer'), createOrder);
```

**Benefits:** Modular; reusable; easy to add/remove steps.

---

## 4. Factory Method (Token Generation)

**Applied in:** User model JWT generation

```js
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
```

The User model encapsulates token creation logic, keeping it DRY across register and login flows.

---

## 5. Observer Pattern (via Mongoose Hooks)

**Applied in:** Pre-save hooks

```js
// Password hashing observer — fires before every save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Order number generation observer
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `FB${year}${month}${random}`;
  }
  next();
});
```

**Benefits:** Automatic side-effects without polluting business logic.

---

## 6. Context Provider Pattern

**Applied in:** React AuthContext

```jsx
// AuthContext.jsx — wraps entire app
<AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
  {children}
</AuthContext.Provider>

// Used anywhere in the tree
const { user, login } = useContext(AuthContext);
```

**Benefits:** Eliminates prop-drilling for auth state; single source of truth.

---

## 7. Service Layer Pattern

**Applied in:** Frontend API calls

```js
// restaurantService.js — encapsulates all restaurant API calls
export const getRestaurants = (filters) => api.get('/restaurants', { params: filters });
export const getRestaurant = (id) => api.get(`/restaurants/${id}`);
export const createRestaurant = (data) => api.post('/restaurants', data);
```

**Benefits:** Components don't know about HTTP; easy to mock in tests; swap API without touching components.

---

## 8. Singleton Pattern

**Applied in:** Axios instance and DB connection

```js
// api.js — one axios instance for entire app
const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });
export default api;

// db.js — one MongoDB connection per process
const connectDB = async () => { await mongoose.connect(URI); };
```

**Benefits:** Shared configuration; no duplicate connections.

---
*FairBite Software Engineering Documentation — Version 1.0*
