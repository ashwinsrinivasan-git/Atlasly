# Atlasly Admin Panel - Testing Instructions

## ✅ AUTHENTICATION SETUP COMPLETE!

Your Atlasly application now has Firebase Authentication fully integrated with Admin Panel support.

### 🔐 Your Admin Account
- **Email:** ashwin.srinivasan.mail@gmail.com
- **Role:** admin
- **Status:** Configured in Firestore

### 🚀 How to Access the Admin Panel

1. **Open the app:**
   ```
   http://localhost:5173/Atlasly/
   ```

2. **Login** (if not already logged in):
   - Click "Sign in with Google"
   - Select your `ashwin.srinivasan.mail@gmail.com` account

3. **Wait for the app to load** (about 10-15 seconds):
   - The app will try to load your profile from Firestore
   - If Firestore is offline, it will use a fallback profile
   - Either way, you'll get admin access!

4. **Navigate to Profile:**
   - Click the "Profile Lv X" button in the top-right corner
   - Wait a few seconds for the profile page to load

5. **Access Admin Panel:**
   - Look for a **GOLD/YELLOW button** with a **shield icon** labeled **"Admin Panel"**
   - Click it to access the admin dashboard

### 📊 Admin Panel Features

Once inside the Admin Panel, you'll have access to:

1. **User Management Dashboard**
   - View all registered users
   - See user details: avatar, name, email, role, level, XP
   - Track join dates and last login times

2. **Administrative Actions**
   - **Toggle Admin Role**: Promote or demote users to/from admin
   - **Delete Users**: Remove user accounts permanently

3. **Real-time Statistics**
   - **Total Users**: Count of all registered users
   - **Admin Count**: Number of users with admin privileges
   - **Active Today**: Users who logged in within the last 24 hours

4. **Search & Filter**
   - Real-time search bar to filter users by name or email

### 🛠️ Troubleshooting

#### If the page is blank:
- Wait 15 seconds (there's a 5-second timeout + 3-second retry)
- Check the browser console for "[AuthContext]" logs
- Hard refresh the page (Cmd+Shift+R on Mac)

#### If you don't see the Admin Panel button:
1. **Check the console logs** - you should see:
   ```
   [AuthContext] Using fallback profile: { role: "admin", ... }
   ```
2. **Verify your email** - make sure you're logged in with `ashwin.srinivasan.mail@gmail.com`
3. **Check Firestore** - your role should be set to "admin" in the users collection

#### Firestore "client is offline" error:
- **This is now handled!** The app will use a fallback profile based on your email
- The app will automatically retry the Firestore connection after 3 seconds
- You should still get admin access even if Firestore fails

### 🔍 How the Fallback Works

The app now has intelligent error handling:

1. **First attempt**: Try to load your profile from Firestore
2. **If it fails**: Create a fallback profile using your email address
   - If your email matches `VITE_ADMIN_EMAIL`, you get `role: "admin"`
   - Otherwise, you get `role: "user"`
3. **Retry**: After 3 seconds, try again to fetch from Firestore
4. **Success**: If the retry works, your real profile replaces the fallback

This means **you'll always have access**, even if Firestore has connectivity issues!

### 📝 Next Steps

1. **Test the admin panel** - verify all features work correctly
2. **Add more users** - invite colleagues to test the app
3. **Customize permissions** - decide which features admins can access
4. **Add analytics** - track user engagement and game statistics

---

**Your admin panel is ready to use! Open the app and navigate to Profile → Admin Panel.**
