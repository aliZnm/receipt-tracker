# Receipt Tracker App

## Project Overview
This is a React Web application that allows users to track receipts. It uses **Firebase** for authentication, **Firestore** for data storage, and **Firebase Storage** for uploading receipt images. Users can add, edit, and delete receipts, and all data remains in the Firebase backend.

The app is fully functional and connected to a single Firebase project. Users do **not** need to create their own Firebase project to run it.

## Team Members:
- Abdulrahman Ali
- Sabhee Rehman
- Jacob Kahn
- Dean Banzon


## Technologies Used
- **React** (with Vite)
- **Firebase** (Authentication, Firestore, Storage)
- **JavaScript / JSX**
- **CSS**
- **Node.js & npm**
---

## Getting Started
### 1. Install Node.js & npm
The app requires Node.js (v18+) and npm.
Download and install from [https://nodejs.org/](https://nodejs.org)

Verify installation in your terminal:
```bash
node -v
npm -v
```
### 2. Clone the Repository
Clone this repository to your local machine:
```bash
git clone https://github.com/aliZnm/receipt-tracker.git
cd receipt-tracker
```

### 3. Install Dependencies
Install the required npm packages:
```bash
npm install
```

### 4. Run the App Locally
Start the development server:
```bash
npm run dev
```
Open the URL shown in the terminal (usually http://localhost:5173) to access the app.

---

## Features
- User authentification via email/password
- Add, Edit, Delete Receipts
- Upload and display receipt images
- Store and retrieve receipts in Firestore
- Responsive design for desktop and mobile

## Testing & Usage
1. Sign up or log in with your account.
2. Add a new receipt using the "+ Add Receipt" form.
3. Edit or delete receipts as needed.
4. Uploaded images are stored in Firebase Storage and displayed in the app.

## Troubleshooting
- **Cannot log in/Firebase error:** Check your internet connection and make sure your email/password are correctly enabled in Firebase Auth.
- **App does not load:** Ensure Node.js and npm are both installed correctly. Run npm install again if necessary.
- **Development server errors:** Stop any other processing using the same port or restart your terminal

