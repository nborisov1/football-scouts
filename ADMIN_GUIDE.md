# Admin Guide - Football Scouting Platform

## Admin Account Access

### Default Admin Credentials
- **Email**: `admin@example.com`
- **Password**: `admin123`

### How to Access Admin Panel

1. **Login as Admin**:
   - Go to the homepage
   - Click "התחברות" (Login)
   - Enter admin credentials
   - Click "התחבר"

2. **Access Admin Features**:
   - Once logged in, click on your name in the top-right corner
   - You'll see additional red menu items:
     - **פאנל ניהול** (Admin Dashboard) - `/admin`
     - **ניהול סרטונים** (Video Management) - `/admin/videos`

## Admin Features

### 🏠 Admin Dashboard (`/admin`)
**Purpose**: Main admin control center

**Features**:
- **Statistics Overview**: Total users, players, scouts, pending videos
- **Quick Actions**: Direct links to management pages
- **Recent Activity**: Latest platform activity
- **Pending Items**: Items requiring admin attention
- **Export Reports**: Download data reports (coming soon)

### 🎥 Video Management (`/admin/videos`)
**Purpose**: Approve or reject player-uploaded videos

**Features**:
- **Video Queue**: View all uploaded videos by status
- **Filter Options**: All, Pending, Approved, Rejected
- **Video Preview**: Watch videos before making decisions
- **Approval Actions**: 
  - ✅ Approve videos
  - ❌ Reject videos
  - 👁️ Preview with detailed view
- **Player Information**: See who uploaded each video
- **Bulk Actions**: Handle multiple videos efficiently

### 👥 User Management (Coming Soon)
**Purpose**: Manage all platform users

**Planned Features**:
- View all users (players, scouts)
- Edit user profiles
- Suspend/activate accounts
- User statistics and activity
- Search and filter users

### 📊 Reports & Analytics (Coming Soon)
**Purpose**: Platform insights and data

**Planned Features**:
- User growth reports
- Video upload statistics
- Challenge completion rates
- Export data to CSV/Excel
- Performance metrics

### ⚙️ Settings (Coming Soon)
**Purpose**: Platform configuration

**Planned Features**:
- Site-wide settings
- Challenge management
- Training program editor
- System maintenance

## Technical Details

### Admin Account Creation
- Admin account is automatically created in development mode
- Uses Firebase Authentication with custom user type
- Admin data stored in Firestore with `type: 'admin'`
- Protected routes check user type before allowing access

### Security
- Admin routes check authentication status
- User type verification on all admin pages
- Firebase security rules protect admin operations
- Session management via Firebase Auth

### Development
- Admin account auto-created in development environment
- Logs admin creation attempts to console
- Handles existing admin gracefully
- Integrates with existing Firebase setup

## Troubleshooting

### Can't Access Admin Panel
1. Verify you're logged in with admin credentials
2. Check that user type is 'admin' in the console
3. Refresh the page if admin menu doesn't appear
4. Clear browser cache if issues persist

### Admin Account Not Working
1. Try registering a new account manually
2. Check Firebase console for admin user
3. Verify Firebase configuration
4. Check browser console for errors

### Missing Admin Features
1. Confirm you're using the latest version
2. Check that all admin components are created
3. Verify routing is set up correctly
4. Ensure proper TypeScript types are defined

## Contact

For admin-related issues or feature requests, please check:
- Browser console for error messages
- Firebase console for authentication status
- Network tab for failed requests
- Component props and state in React DevTools
