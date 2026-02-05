# ShareSphere Frontend

A modern, responsive community-based resource sharing platform built with React, Vite, Tailwind CSS, and Redux Toolkit.

## 🚀 Features

- **User Authentication**: Login, Register, and OTP Verification
- **Resource Sharing**: Post, browse, and discover shared resources
- **Real-time Chat**: Message other users
- **Notifications**: Stay updated with activity notifications
- **User Profiles**: View and edit user profiles with verification status
- **Admin Dashboard**: Manage users, verify accounts, and moderate content
- **Dark Mode**: Built-in dark mode support
- **Responsive Design**: Mobile-first, fully responsive UI
- **Smooth Animations**: Framer Motion animations throughout

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **Formik + Yup** - Form handling and validation
- **Framer Motion** - Animations
- **Axios** - HTTP client

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
├── layouts/         # Layout components (Navbar, Footer, Sidebar)
├── features/        # Redux slices
├── services/        # API services
├── hooks/           # Custom React hooks
├── utils/           # Utility functions and dummy data
├── assets/          # Static assets
└── store/           # Redux store configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📄 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Features Overview

### Public Pages
- **Landing Page** - Hero section, stats, featured resources
- **Login** - User authentication
- **Register** - Account creation with password strength indicator
- **OTP Verification** - Email verification

### Protected Pages (Require Login)
- **Home Feed** - Browse resources with filters and search
- **Create Post** - Share resources with image upload
- **Post Details** - View full resource details
- **Profile** - User profile with posts and activity
- **Chat** - Messaging interface
- **Notifications** - Activity notifications

### Admin Pages (Require Admin Role)
- **Dashboard** - Platform statistics
- **User Verification** - Approve/reject verification
- **Reports** - Handle reported content

## 🔐 Authentication Flow

1. User registers → OTP verification → Login
2. JWT token stored in localStorage
3. Token sent with API requests via Axios interceptor

## 🎨 Theming

Supports light/dark modes using Tailwind's `dark:` classes. Toggle via navbar icon.

## 📱 Responsive Design

Fully responsive with mobile-first approach.

## 🚀 Deployment

```bash
npm run build
```

Deploy to Vercel, Netlify, or any static hosting platform.

---

**Note**: Currently uses dummy data. Connect to backend API by updating `src/services/api.js`
