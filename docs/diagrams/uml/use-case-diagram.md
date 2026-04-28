# Use Case Diagrams (Text/PlantUML Format)

> These can be rendered using PlantUML (plantuml.com) or any UML tool.

---

## Main System Use Case Diagram

```plantuml
@startuml FairBite-UseCases

left to right direction
skinparam packageStyle rectangle

actor Customer
actor "Restaurant Owner" as Restaurant
actor Rider
actor Admin

rectangle "FairBite Platform" {

  package "Authentication" {
    usecase "Register Account" as UC1
    usecase "Login" as UC2
    usecase "Update Profile" as UC3
    usecase "Logout" as UC4
  }

  package "Customer Features" {
    usecase "Browse Restaurants" as UC5
    usecase "Filter by Dietary Tags" as UC6
    usecase "View Restaurant Menu" as UC7
    usecase "Add Items to Cart" as UC8
    usecase "Place Order" as UC9
    usecase "Track Order Status" as UC10
    usecase "Cancel Order" as UC11
    usecase "Write Review" as UC12
    usecase "View Order History" as UC13
  }

  package "Restaurant Features" {
    usecase "Create Restaurant Profile" as UC14
    usecase "Manage Menu Items" as UC15
    usecase "View Incoming Orders" as UC16
    usecase "Update Order Status" as UC17
    usecase "View Sales Analytics" as UC18
    usecase "Respond to Reviews" as UC19
  }

  package "Rider Features" {
    usecase "View Available Orders" as UC20
    usecase "Accept Delivery" as UC21
    usecase "Update Delivery Status" as UC22
    usecase "View Earnings" as UC23
  }

  package "Admin Features" {
    usecase "Manage Users" as UC24
    usecase "Verify Restaurants" as UC25
    usecase "View Platform Analytics" as UC26
    usecase "Handle Disputes" as UC27
  }
}

' Customer associations
Customer --> UC1
Customer --> UC2
Customer --> UC3
Customer --> UC4
Customer --> UC5
Customer --> UC6
Customer --> UC7
Customer --> UC8
Customer --> UC9
Customer --> UC10
Customer --> UC11
Customer --> UC12
Customer --> UC13

' Restaurant associations
Restaurant --> UC1
Restaurant --> UC2
Restaurant --> UC14
Restaurant --> UC15
Restaurant --> UC16
Restaurant --> UC17
Restaurant --> UC18
Restaurant --> UC19

' Rider associations
Rider --> UC1
Rider --> UC2
Rider --> UC20
Rider --> UC21
Rider --> UC22
Rider --> UC23

' Admin associations
Admin --> UC24
Admin --> UC25
Admin --> UC26
Admin --> UC27

' Include relationships
UC9 ..> UC8 : <<include>>
UC12 ..> UC13 : <<include>>
UC6 ..> UC5 : <<extend>>
UC17 ..> UC16 : <<include>>

@enduml
```

---

## Order Flow Use Case (Detail)

```plantuml
@startuml Order-Flow-UseCase

actor Customer
actor "Restaurant Owner" as Restaurant
actor Rider

rectangle "Order Management System" {
  usecase "Browse & Select Items" as UC1
  usecase "Add to Cart" as UC2
  usecase "Enter Delivery Address" as UC3
  usecase "Select Payment Method" as UC4
  usecase "Place Order" as UC5
  usecase "Confirm Order" as UC6
  usecase "Prepare Order" as UC7
  usecase "Mark Ready for Pickup" as UC8
  usecase "Pick Up Order" as UC9
  usecase "Deliver Order" as UC10
  usecase "Rate & Review" as UC11
}

Customer --> UC1
Customer --> UC2
Customer --> UC3
Customer --> UC4
Customer --> UC5
Customer --> UC11

Restaurant --> UC6
Restaurant --> UC7
Restaurant --> UC8

Rider --> UC9
Rider --> UC10

UC2 ..> UC1 : <<include>>
UC5 ..> UC2 : <<include>>
UC5 ..> UC3 : <<include>>
UC5 ..> UC4 : <<include>>
UC6 ..> UC5 : <<include>>
UC11 ..> UC10 : <<include>>

@enduml
```

---

## Authentication Use Case (Detail)

```plantuml
@startuml Auth-UseCase

actor "Unregistered User" as Guest
actor "Registered User" as User

rectangle "Authentication System" {
  usecase "Register" as UC1
  usecase "Choose Role" as UC2
  usecase "Login" as UC3
  usecase "View Profile" as UC4
  usecase "Update Profile" as UC5
  usecase "Change Password" as UC6
  usecase "Logout" as UC7
}

Guest --> UC1
UC1 ..> UC2 : <<include>>

User --> UC3
User --> UC4
User --> UC5
User --> UC6
User --> UC7

UC5 ..> UC4 : <<extend>>
UC6 ..> UC4 : <<extend>>

@enduml
```

---
*Render these diagrams at: https://www.plantuml.com/plantuml/uml/*
*Or use draw.io / Lucidchart to recreate visually.*
