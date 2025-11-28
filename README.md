# Agri - Farming Tutorials Mobile App

A mobile application for sharing and discovering agricultural knowledge through bite-sized tutorials.

---

## 📌 Идея / Project Idea

**Agri** is a community-driven platform where farmers, gardeners, and agricultural enthusiasts can:
- Share tutorials about farming techniques, soil health, irrigation, and more
- Browse and search educational content from other users
- Create, edit, and manage their own tutorials

The goal is to make agricultural knowledge accessible and easy to share in a modern mobile experience.

---

## ⚙️ Как работи / How It Works

The application consists of two main parts:

1. **Mobile App (React Native / Expo)**
   - Cross-platform mobile application
   - Communicates with the backend via REST API
   - Stores authentication tokens securely using `expo-secure-store`

2. **Backend API (.NET 8)**
   - RESTful API built with ASP.NET Core
   - SQLite database for data persistence
   - JWT-based authentication
   - Clean Architecture with CQRS pattern (MediatR)

### Key Features:
- **User Authentication**: Register, login, logout with JWT tokens
- **CRUD Operations**: Create, read, update, delete tutorials
- **Search & Filter**: Find tutorials by keyword or tag
- **Dark/Light Theme**: Toggle between themes with persistence
- **Pull-to-Refresh**: Refresh feed to get latest content

---

## 🏗️ Архитектура / Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE APP (Expo)                       │
├─────────────────────────────────────────────────────────────┤
│  app/                    │  src/                            │
│  ├── (tabs)/             │  ├── api/                        │
│  │   ├── index.tsx       │  │   ├── agent.ts (HTTP client)  │
│  │   └── feed.tsx        │  │   └── models.ts               │
│  ├── auth/               │  ├── contexts/                   │
│  │   ├── login.tsx       │  │   ├── AuthContext.tsx         │
│  │   └── register.tsx    │  │   └── ThemeContext.tsx        │
│  └── post/               │  ├── components/                 │
│      ├── create.tsx      │  │   └── ThemeToggle.tsx         │
│      ├── [id].tsx        │  └── utils/                      │
│      └── [id]/edit.tsx   │      └── sessionStorage.ts       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (HTTP/HTTPS)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (.NET 8)                          │
├─────────────────────────────────────────────────────────────┤
│  Agri.API           → Controllers, DTOs, Services           │
│  Agri.Application   → CQRS Handlers (MediatR), Validators   │
│  Agri.Domain        → Entities (Post, Tag, AppUser)         │
│  Agri.Infrastructure→ Security (UserAccessor)               │
│  Agri.Persistence   → DataContext, Migrations, Seed         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  SQLite Database │
                    │  (agri_blog.db)  │
                    └─────────────────┘
```

### Technologies Used:
- **Frontend**: React Native, Expo, Expo Router, NativeBase, Axios
- **Backend**: .NET 8, ASP.NET Core, Entity Framework Core, MediatR, FluentValidation
- **Database**: SQLite
- **Auth**: ASP.NET Core Identity + JWT

---

## 👤 Потребителски поток / User Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Welcome    │────▶│    Login/    │────▶│   Home/Feed  │
│    Screen    │     │   Register   │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
        ┌─────────────────────────────────────────┼─────────────────┐
        │                                         │                 │
        ▼                                         ▼                 ▼
┌──────────────┐                         ┌──────────────┐   ┌──────────────┐
│    Browse    │                         │    Create    │   │    View      │
│    Posts     │                         │    Post      │   │    Post      │
└──────────────┘                         └──────────────┘   └──────┬───────┘
                                                                   │
                                                    ┌──────────────┴──────────────┐
                                                    │                             │
                                                    ▼                             ▼
                                           ┌──────────────┐              ┌──────────────┐
                                           │    Edit      │              │    Delete    │
                                           │    Post      │              │    Post      │
                                           └──────────────┘              └──────────────┘
```

1. User opens the app → sees welcome screen with highlights
2. User can browse feed without logging in (read-only)
3. To create/edit/delete content, user must register or login
4. Authenticated users can create new tutorials
5. Post owners can edit or delete their own tutorials

---

## 🚀 Стъпки за стартиране / Getting Started

### Prerequisites
- Node.js (v18+)
- .NET 8 SDK
- Expo CLI (`npm install -g expo-cli`)
- Android/iOS emulator or Expo Go app

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/MobileApps2025-YOUR_FN.git
cd Agri
```

### 2. Start the Backend API
```bash
cd agri-api/Agri.API
dotnet restore
dotnet run
```
The API will start at `http://localhost:5000`

### 3. Configure the Mobile App
Create a `.env` file in the root directory (or set in `app.json`):
```
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api
```

### 4. Start the Mobile App
```bash
npm install
npx expo start
```

### 5. Run on Device/Emulator
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app for physical device

---

## 🔑 Тестови акаунти / Test Accounts

The database is seeded with the following test users:

| Email | Username | Password | Description |
|-------|----------|----------|-------------|
| `farmer.tom@example.com` | `farmer.tom` | `FarmerTom123!` | Organic farmer sharing greenhouse tips |
| `ana.soil@example.com` | `ana.soil` | `SoilAna123!` | Agronomist focused on soil care |

Or register a new account through the app.

---

## 📱 Скрийншотове / Screenshots

| Home Screen | Feed | Post Details |
|:-----------:|:----:|:------------:|
| ![Home](screenshots/home.png) | ![Feed](screenshots/feed.png) | ![Details](screenshots/details.png) |

| Create Post | Dark Mode | Login |
|:-----------:|:---------:|:-----:|
| ![Create](screenshots/create.png) | ![Dark](screenshots/dark.png) | ![Login](screenshots/login.png) |

> Note: Add screenshots to `/screenshots` folder

---

## 📦 APK

The release APK can be found at:

```
/apk/app-release.apk
```

To build the APK yourself:
```bash
npx eas build --platform android --profile preview
# or
npx expo build:android -t apk
```

---

## 📁 Project Structure

```
Agri/
├── app/                    # Expo Router screens
├── src/                    # Source code
│   ├── api/               # API client and models
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts (Auth, Theme)
│   └── utils/             # Utility functions
├── agri-api/              # .NET Backend
│   ├── Agri.API/          # Web API layer
│   ├── Agri.Application/  # Business logic (CQRS)
│   ├── Agri.Domain/       # Domain entities
│   ├── Agri.Infrastructure/ # External services
│   └── Agri.Persistence/  # Database context
├── assets/                # Images and icons
└── apk/                   # Release APK
```

---

## ✨ Features Implemented

- [x] User registration and login (JWT authentication)
- [x] Create, read, update, delete tutorials
- [x] Search tutorials by keyword
- [x] Filter by tags
- [x] Light/Dark theme toggle with persistence
- [x] Pull-to-refresh on feed
- [x] Responsive mobile UI with NativeBase
- [x] REST API communication
- [x] Secure token storage

---

## 👨‍💻 Author

**Faculty Number**: 2301321029
**Course**: Mobile Applications 2025

---

## 📄 License

This project is for educational purposes.
