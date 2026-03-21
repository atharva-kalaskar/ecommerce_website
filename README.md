# 🛒 E-Commerce Website

A full-stack E-Commerce web application built using React (frontend) and Node.js + Express (backend) with MySQL database.

---

## 🚀 Features

- User Authentication (Login / Register)
- Product Management
- Add to Cart functionality
- REST API backend
- MySQL database integration

---

## 🛠️ Tech Stack

- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MySQL

---

## 📂 Project Structure

ecommerce_website/

├── client/        # React frontend  
├── server/        # Node.js backend  
├── database/      # SQL files (schema & queries)  
├── .gitignore  
└── README.md  

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

git clone https://github.com/atharva-kalaskar/ecommerce_website.git  
cd ecommerce_website  

---

### 2️⃣ Setup Backend

cd server  
npm install  

Create a `.env` file inside `server/`:

PORT=5000  
DB_HOST=your_host  
DB_USER=your_user  
DB_PASSWORD=your_password  
DB_NAME=your_database  

Start backend:

npm start  

---

### 3️⃣ Setup Frontend

cd client  
npm install  
npm start  

---

## 🗄️ Database Setup

- Import `database/ecommerce_cp.sql` into MySQL
- Use queries from `query.txt` if needed

---

## 🔐 Important Note

- `.env` file is not uploaded for security reasons  
- Never expose database credentials publicly  

---

## 📌 Author

- GitHub: https://github.com/atharva-kalaskar