# 🛒 MyStore - Full Stack E-Commerce Website

A modern full-stack E-Commerce application built with Angular, Node.js, Express.js, and MongoDB Atlas.

## 🚀 Features

### Frontend (Angular)

* Modern responsive UI
* Product catalog display
* Product search functionality
* Category filtering
* Product sorting
* Product details page
* Authentication UI (Sign In / Sign Up)
* Mobile-friendly design

### Backend (Node.js + Express)

* RESTful API
* Product management
* MongoDB Atlas integration
* Product seeding functionality
* JSON-based API responses
* CORS enabled

### Database (MongoDB Atlas)

* Cloud database storage
* Product collections
* Fast data retrieval
* Scalable architecture

---

## 🛠️ Tech Stack

### Frontend

* Angular
* TypeScript
* HTML5
* CSS3

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

---

## 📂 Project Structure

```bash
ecommerce-project
│
├── backend
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
└── frontend
    └── frontend
        ├── src
        ├── public
        ├── angular.json
        ├── package.json
        └── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/Sumeet1021/Ecommerce_website.git
cd Ecommerce_website
```

---

## Backend Setup

```bash
cd backend
npm install
node server.js
```

Backend runs on:

```text
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend/frontend
npm install
ng serve
```

Frontend runs on:

```text
http://localhost:4200
```

---

## Database Setup

1. Create MongoDB Atlas Cluster
2. Create Database User
3. Add IP Address to Network Access
4. Update MongoDB Connection String

Example:

```javascript
mongoose.connect("mongodb+srv://username:password@cluster.mongodb.net/ecommerce")
```

---

## Seed Products

To populate the database with sample products:

```text
http://localhost:5000/api/products/seed
```

---

## API Endpoints

### Get All Products

```http
GET /api/products
```

### Seed Products

```http
GET /api/products/seed
```

---

## Screenshots

### Home Page

* Product Listing
* Search Functionality
* Category Filtering
* Responsive Design

### Authentication Page

* Sign In Form
* Create Account UI

---

## Future Enhancements

* User Authentication
* JWT Authorization
* Shopping Cart
* Wishlist
* Order Management
* Payment Gateway Integration
* Admin Dashboard
* Product Reviews
* Order Tracking

---

## Author

**Sumeet Gupta**

* AI & Data Science Student
* Full Stack Developer
* Python & Java Developer

GitHub: https://github.com/Sumeet1021

---

## License

This project is created for educational and learning purposes.
