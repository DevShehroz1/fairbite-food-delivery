# Sequence Diagrams (PlantUML Format)

---

## 1. User Registration Sequence

```plantuml
@startuml Registration-Sequence
title User Registration Flow

actor Customer
participant "React Frontend" as FE
participant "Express API" as API
participant "Auth Controller" as AC
participant "User Model" as UM
database "MongoDB" as DB

Customer -> FE : Fill registration form\n(name, email, password, phone, role)
FE -> API : POST /api/auth/register\n{name, email, password, phone, role}
API -> AC : register(req, res)
AC -> UM : User.findOne({ email })
UM -> DB : Query users collection
DB --> UM : null (no existing user)
UM --> AC : null
AC -> UM : User.create({ ...body })
UM -> UM : pre('save') hook:\nbcrypt.hash(password)
UM -> DB : Insert new user document
DB --> UM : Saved user document
UM --> AC : User object
AC -> AC : user.generateToken()\njwt.sign({ id, role })
AC --> API : { success: true, token, user }
API --> FE : HTTP 201 + JSON
FE -> FE : Store token in localStorage\nUpdate AuthContext
FE --> Customer : Redirect to home page

@enduml
```

---

## 2. Order Placement Sequence

```plantuml
@startuml Order-Placement-Sequence
title Order Placement Flow

actor Customer
participant "React Cart" as Cart
participant "Express API" as API
participant "Auth Middleware" as AM
participant "Order Controller" as OC
participant "Restaurant Model" as RM
participant "Order Model" as OM
database "MongoDB" as DB

Customer -> Cart : Click "Place Order"
Cart -> API : POST /api/orders\nHeaders: Authorization: Bearer <token>\nBody: { restaurantId, items, deliveryAddress, payment }

API -> AM : protect middleware
AM -> AM : jwt.verify(token)
AM --> API : req.user = { id, role }

API -> OC : createOrder(req, res)
OC -> RM : Restaurant.findById(restaurantId)
RM -> DB : Find restaurant
DB --> RM : Restaurant document
RM --> OC : restaurant object

OC -> OC : Loop items:\n  Find menu item in restaurant.menu\n  Calculate item subtotal
OC -> OC : Calculate pricing:\n  subtotal = sum of item subtotals\n  deliveryFee = restaurant.delivery.fee\n  platformFee = subtotal * 15%\n  total = subtotal + deliveryFee

OC -> OM : Order.create({ customer, restaurant, items, pricing, deliveryAddress, payment })
OM -> OM : pre('save') hook:\nGenerate orderNumber: FB202604XXXX
OM -> DB : Insert order document
DB --> OM : Saved order
OM --> OC : Order object

OC -> RM : restaurant.stats.totalOrders += 1
RM -> DB : Update restaurant stats
DB --> RM : Updated

OC --> API : { success: true, data: order }
API --> Cart : HTTP 201 + order data
Cart --> Customer : Order confirmation screen\nOrder #FB202604XXXX

@enduml
```

---

## 3. Restaurant Owner: Update Menu Sequence

```plantuml
@startuml Menu-Update-Sequence
title Add Menu Item Flow

actor "Restaurant Owner" as Owner
participant "React Dashboard" as FE
participant "Express API" as API
participant "Auth Middleware" as AM
participant "Restaurant Controller" as RC
participant "Restaurant Model" as RM
database "MongoDB" as DB

Owner -> FE : Fill menu item form\n(name, price, category, dietary tags)
FE -> API : POST /api/restaurants/:id/menu\nHeaders: Bearer <token>\nBody: { name, price, category, dietaryTags, ... }

API -> AM : protect + authorize('restaurant', 'admin')
AM -> AM : Verify JWT\nCheck role = 'restaurant'
AM --> API : Authorized

API -> RC : addMenuItem(req, res)
RC -> RM : Restaurant.findById(req.params.id)
RM -> DB : Find restaurant
DB --> RM : Restaurant document
RM --> RC : restaurant

RC -> RC : Check restaurant.owner === req.user.id
RC -> RC : restaurant.menu.push(req.body)
RC -> RM : restaurant.save()
RM -> DB : Update document with new menu item
DB --> RM : Updated restaurant
RM --> RC : Saved restaurant

RC --> API : { success: true, data: newMenuItem }
API --> FE : HTTP 201 + menu item
FE --> Owner : "Item added successfully"

@enduml
```

---

## 4. Order Status Update Sequence

```plantuml
@startuml Status-Update-Sequence
title Order Status Progression

actor "Restaurant Owner" as Restaurant
participant "React Dashboard" as FE
participant "Express API" as API
participant "Order Controller" as OC
participant "Order Model" as OM
database "MongoDB" as DB

Restaurant -> FE : Click "Confirm Order"
FE -> API : PUT /api/orders/:id/status\n{ status: "confirmed", note: "Order accepted" }
API -> OC : updateOrderStatus(req, res)

OC -> OM : Order.findById(req.params.id)
OM -> DB : Find order
DB --> OM : Order document
OM --> OC : order object

OC -> OC : order.status = "confirmed"\norder.statusHistory.push({ status, note })\norder.timing.confirmed = Date.now()

alt status === "delivered"
  OC -> OC : order.payment.status = "paid"\norder.payment.paidAt = Date.now()
  OC -> OC : Update restaurant revenue stats
end

OC -> OM : order.save()
OM -> DB : Update order
DB --> OM : Updated
OM --> OC : Saved order

OC --> API : { success: true, data: order }
API --> FE : Updated order
FE --> Restaurant : Status badge updated

@enduml
```

---
*Render at: https://www.plantuml.com/plantuml/uml/*
