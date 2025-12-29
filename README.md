# 🌍 Atlasly - Interactive Geography Learning Game

**Atlasly** is a modern, interactive geography learning game with beautiful 3D maps, user authentication, and profile management. Test your knowledge, track countries you've visited, and compete with friends!

---

## ✨ Features

### 🎮 Core Game
- **Geography Quiz**: Guess countries based on their silhouette
- **Progressive Difficulty**: Hints and distance-based feedback
- **Bonus Rounds**: Special challenges and extra content
- **Streak System**: Build combos for bonus XP

### 🗺️ 3D Interactive Maps
- **Solved Countries Map**: View all countries you've correctly guessed
- **Ashwin Mode**: Track real-life travel with an immersive 3D world map
- **Touch & Mouse Controls**: Pan, rotate, and zoom on all devices

### 👤 User Authentication
- **Google Sign-In**: One-click authentication
- **GitHub Sign-In**: Developer-friendly login
- **Email/Password**: Traditional credential-based auth
- **Profile Syncing**: Progress saved across devices

### 📊 Profile & Progress
- **Level System**: Earn XP and level up
- **Statistics**: Track visited countries and solved challenges
- **Customizable**: Edit your display name
- **Themes**: Light, Dark, and Ocean modes

### 🛡️ Admin Panel
- **User Management**: View and manage all users
- **Role Control**: Assign admin privileges
- **Analytics**: Track user engagement and activity
- **Search & Filter**: Find users quickly

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase account (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashwinsrinivasan-git/Atlasly.git
   cd Atlasly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**

   a. Go to [Firebase Console](https://console.firebase.google.com/)
   
   b. Create a new project or use existing
   
   c. Enable Authentication:
      - Go to **Authentication** → **Sign-in method**
      - Enable **Google**, **GitHub**, and **Email/Password**
   
   d. Create Firestore Database:
      - Go to **Firestore Database** → **Create database**
      - Start in **production mode**
   
   e. Get your config:
      - Go to **Project Settings** → **Your apps**
      - Copy the Firebase configuration

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_ADMIN_EMAIL=your-email@example.com
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:5173

---

## 📦 Deployment

### Deploy to GitHub Pages

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy**
   ```bash
   npm run deploy
   ```

   Or push to `main` branch - GitHub Actions will auto-deploy!

### Manual Deployment

Build and upload the `dist` folder to any static hosting service (Vercel, Netlify, etc.)

---

## 🔧 Configuration

### Firebase Security Rules

Add these rules to Firestore for secure data access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can update their own data
      allow update: if request.auth != null && request.auth.uid == userId;
      
      // Only authenticated users can create profiles
      allow create: if request.auth != null;
      
      // Admins can read and write all user data
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### GitHub OAuth Setup

1. Go to GitHub **Settings** → **Developer settings** → **OAuth Apps**
2. Create new OAuth App
3. Set **Authorization callback URL** to:
   ```
   https://your-project.firebaseapp.com/__/auth/handler
   ```
4. Copy **Client ID** and **Client Secret**
5. Add to Firebase Console: **Authentication** → **Sign-in method** → **GitHub**

---

## 🎯 Secret Features

### Unlock Ashwin Mode

**Method 1**: Triple-click the Atlasly logo (within 2 seconds)

**Method 2**: Type "ashwin" anywhere on the page

**Method 3**: Use the unlock button on the profile page

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **3D Graphics**: Three.js, React Three Fiber
- **Maps**: D3.js, TopoJSON
- **Animation**: Framer Motion
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Styling**: CSS Variables, Responsive Design
- **Icons**: Lucide React
- **Deployment**: GitHub Pages, GitHub Actions

---

## 📁 Project Structure

```
Atlasly/
├── src/
│   ├── components/
│   │   ├── Auth/          # Authentication components
│   │   ├── Admin/         # Admin panel
│   │   ├── Map/           # 3D map components
│   │   ├── UI/            # Reusable UI components
│   │   ├── Game.jsx       # Main game component
│   │   ├── Landing.jsx    # Home screen
│   │   ├── Profile.jsx    # User profile
│   │   └── Layout.jsx     # App layout wrapper
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React contexts (Auth)
│   ├── config/            # Firebase configuration
│   ├── utils/             # Utility functions
│   └── assets/            # Images, textures
├── public/
│   └── data/              # TopoJSON world data
└── .github/
    └── workflows/         # GitHub Actions CI/CD
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👨‍💻 Author

**Naveen**
- GitHub: [@ashwinsrinivasan-git](https://github.com/ashwinsrinivasan-git)

---

## 🙏 Acknowledgments

- Country data from [REST Countries API](https://restcountries.com/)
- Map data from [Natural Earth](https://www.naturalearthdata.com/)
- Built with assistance from Google Deepmind's Antigravity AI

---

## 📞 Support

Having issues? Check out:
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)
- [Three.js Documentation](https://threejs.org/docs/)

Or open an issue on GitHub!

---

**Enjoy exploring the world with Atlasly! 🌍✈️**
