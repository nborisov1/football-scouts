# 🔥 Firebase Database Structure - Football Scouts Platform

## 📋 **Table of Contents**
1. [Overview](#overview)
2. [Core Collections](#core-collections)
3. [User Data Structure](#user-data-structure)
4. [Exercise & Assessment System](#exercise--assessment-system)
5. [Challenge Management](#challenge-management)
6. [Admin & Content Management](#admin--content-management)
7. [Storage Structure](#storage-structure)
8. [Security Rules](#security-rules)
9. [Implementation Examples](#implementation-examples)

---

## 🎯 **Overview**

This document defines the complete Firebase Firestore database structure for the Football Scouts Platform. The structure is designed to support:

- **User Management**: Players, scouts, and admins
- **Assessment System**: Real video-based skill assessments
- **Challenge Platform**: Progressive training challenges
- **Progress Tracking**: User advancement and completion status
- **Content Management**: Admin-uploaded videos and challenges

---

## 📊 **Core Collections**

### **Root Collections:**
```
📁 users/                    # User accounts & profiles
📁 videos/                   # Admin-uploaded training videos
📁 assessments/              # User assessment submissions
📁 challenges/               # Admin-created challenges
📁 videoCollections/         # Organized video groups
📁 leaderboards/             # Global rankings
📁 analytics/                # Platform analytics
```

---

## 👤 **User Data Structure**

### **users/{userId}**
```javascript
{
  // Authentication & Basic Info
  uid: "user123",
  email: "player@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  userType: "player" | "scout" | "admin",
  
  // Profile Data
  profile: {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "2005-03-15",
    ageGroup: "u18",           // from AGE_GROUPS constant
    position: "midfielder",     // from POSITIONS constant
    skillLevel: "intermediate", // from SKILL_LEVELS constant
    preferredFoot: "right" | "left" | "both",
    height: 175,               // cm
    weight: 70,                // kg
    location: {
      country: "Israel",
      city: "Tel Aviv"
    }
  },
  
  // Platform Settings
  settings: {
    language: "he",
    notifications: true,
    privacy: "public" | "private" | "friends",
    trainingReminders: true
  },
  
  // Progress Tracking
  progress: {
    currentLevel: "intermediate",
    totalPoints: 150,
    assessmentCompleted: true,
    assessmentScore: 85,
    lastActivity: "2024-01-15T10:30:00Z",
    joinDate: "2024-01-01T00:00:00Z"
  },
  
  // Metadata
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  isActive: true
}
```

### **users/{userId}/submissions/** (Subcollection)
```javascript
{
  submissionId: "sub123",
  challengeId: "ch456",        // Reference to challenge
  exerciseId: "ex789",         // Reference to original video
  type: "assessment" | "challenge",
  
  // Submission Data
  videoUrl: "https://storage...",
  videoPath: "assessments/user123/video.mp4",
  videoDuration: 45,           // seconds
  count: 12,                   // User's performance count
  
  // Scoring
  autoScore: 8.5,              // Auto-calculated score
  manualScore: null,           // Scout/admin review score
  totalScore: 8.5,
  
  // Metadata
  submittedAt: "2024-01-15T10:30:00Z",
  status: "completed" | "under_review" | "approved",
  notes: "Great improvement in technique",
  reviewedBy: "scout456",      // Optional
  reviewedAt: "2024-01-15T12:00:00Z"
}
```

### **users/{userId}/completions/** (Subcollection)
```javascript
{
  exerciseId: "ex789",
  challengeId: "ch456",
  type: "assessment" | "challenge",
  completedAt: "2024-01-15T10:30:00Z",
  score: 8.5,
  attempts: 2,                 // Number of attempts before completion
  bestScore: 8.5,
  submissionId: "sub123"       // Reference to best submission
}
```

---

## 🎯 **Exercise & Assessment System**

### **videos/{videoId}**
```javascript
{
  // Basic Info
  title: "Advanced Dribbling Challenge",
  description: "Master the step-over technique...",
  videoUrl: "https://storage.googleapis.com/...",
  thumbnailUrl: "https://storage.googleapis.com/...",
  
  // Classification
  exerciseType: "dribbling",   // from CHALLENGE_TYPES
  category: "football-training", // from CHALLENGE_CATEGORIES
  skillLevel: "advanced",      // from SKILL_LEVELS
  ageGroup: ["u16", "u18", "adult"], // Array of suitable ages
  position: ["midfielder", "winger"], // Array of suitable positions
  
  // Technical Details
  duration: 120,               // seconds
  difficulty: 7,               // 1-10 scale
  equipment: ["football", "cones"], // Required equipment
  
  // Metadata
  uploadedBy: "admin123",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-05T15:20:00Z",
  status: "approved" | "pending" | "rejected",
  viewCount: 1205,
  
  // Goals & Objectives
  goals: ["improve-technique", "increase-agility"],
  instructions: [
    "Set up 5 cones in a straight line",
    "Dribble through using step-over technique",
    "Complete 3 rounds for time"
  ],
  
  // Success Metrics
  metrics: {
    type: "count",             // "count" | "time" | "accuracy"
    unit: "successful_dribbles",
    targetValue: 10,
    description: "Number of successful dribbles completed"
  }
}
```

### **assessments/{assessmentId}**
```javascript
{
  // User & Exercise Reference
  userId: "user123",
  challengeId: "vid456",       // Reference to videos collection
  exerciseType: "dribbling",
  
  // Submission Data
  videoUrl: "https://storage...",
  videoPath: "assessments/user123/assessment_vid456_1642234567.mp4",
  videoDuration: 45,
  count: 12,                   // User's actual performance
  
  // Scoring & Evaluation
  autoScore: 8.5,              // Based on count vs target
  totalScore: 8.5,
  notes: "Good technique, needs more speed",
  
  // Status & Timestamps
  type: "assessment",
  status: "completed",
  submittedAt: "2024-01-15T10:30:00Z",
  
  // Optional Review Data
  reviewedBy: null,
  reviewedAt: null,
  feedback: null
}
```

---

## 🏆 **Challenge Management**

### **challenges/{challengeId}**
```javascript
{
  // Basic Info
  title: "Weekly Dribbling Challenge",
  description: "Complete 3 dribbling exercises this week",
  type: "weekly" | "daily" | "special" | "tournament",
  
  // Challenge Configuration
  exercises: [                 // Array of exercise IDs
    "vid123",
    "vid456", 
    "vid789"
  ],
  
  // Requirements
  requiredLevel: "intermediate",
  minAge: "u14",
  maxAge: "adult",
  positions: ["all"],          // or specific positions
  
  // Timing
  startDate: "2024-01-15T00:00:00Z",
  endDate: "2024-01-22T23:59:59Z",
  duration: "7d",              // Duration to complete
  
  // Rewards & Points
  points: 50,
  badge: "dribbling_master",
  rewards: {
    completion: 50,            // Points for completion
    ranking: {                 // Bonus points for ranking
      "1": 100,
      "2": 75,
      "3": 50
    }
  },
  
  // Participation
  participants: 0,             // Count updated via cloud function
  completions: 0,
  
  // Metadata
  createdBy: "admin123",
  createdAt: "2024-01-10T00:00:00Z",
  isActive: true,
  featured: false
}
```

### **users/{userId}/challengeProgress/** (Subcollection)
```javascript
{
  challengeId: "ch123",
  enrolledAt: "2024-01-15T08:00:00Z",
  
  // Progress Tracking
  exercisesCompleted: ["vid123", "vid456"], // Completed exercise IDs
  totalExercises: 3,
  progressPercentage: 66.7,
  
  // Current Status
  status: "in_progress" | "completed" | "expired" | "abandoned",
  completedAt: null,           // Set when status becomes "completed"
  
  // Performance
  totalScore: 42.5,
  averageScore: 8.5,
  attempts: {
    "vid123": 2,
    "vid456": 1
  },
  
  // Ranking (updated via cloud function)
  currentRank: null,
  finalRank: null
}
```

---

## 🔧 **Admin & Content Management**

### **videoCollections/{collectionId}**
```javascript
{
  // Collection Info
  name: "Beginner Dribbling Series",
  description: "Complete dribbling course for beginners",
  type: "course" | "series" | "assessment" | "challenge",
  
  // Content
  videos: [                    // Ordered array of video IDs
    "vid123",
    "vid456",
    "vid789"
  ],
  totalVideos: 3,
  totalDuration: 360,          // Total seconds
  
  // Classification
  skillLevel: "beginner",
  ageGroup: ["u8", "u10", "u12"],
  category: "football-training",
  
  // Settings
  isPublic: true,
  isPremium: false,
  price: 0,                    // For future monetization
  
  // Metadata
  createdBy: "admin123",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-15T10:30:00Z",
  viewCount: 234,
  enrollmentCount: 45
}
```

### **leaderboards/{period}** (e.g., "weekly", "monthly", "alltime")
```javascript
{
  period: "weekly",
  startDate: "2024-01-15T00:00:00Z",
  endDate: "2024-01-22T23:59:59Z",
  
  // Rankings by Category
  rankings: {
    overall: [
      {
        userId: "user123",
        displayName: "John Doe",
        points: 450,
        rank: 1,
        avatar: "https://..."
      },
      // ... more entries
    ],
    
    dribbling: [
      // Category-specific rankings
    ],
    
    fitness: [
      // Category-specific rankings  
    ]
  },
  
  // Metadata
  lastUpdated: "2024-01-20T10:30:00Z",
  totalParticipants: 128
}
```

### **analytics/{document}**
```javascript
// Document: "platformStats"
{
  totalUsers: 1234,
  activeUsers: 892,
  totalVideos: 156,
  totalAssessments: 2341,
  totalChallenges: 45,
  
  // Daily/Weekly/Monthly breakdowns
  userGrowth: {
    daily: { "2024-01-15": 12, "2024-01-16": 8 },
    weekly: { "2024-W03": 45, "2024-W04": 52 },
    monthly: { "2024-01": 203 }
  },
  
  assessmentStats: {
    completionRate: 78.5,
    averageScore: 7.2,
    popularExercises: ["vid123", "vid456", "vid789"]
  },
  
  lastUpdated: "2024-01-20T23:59:59Z"
}
```

---

## 📁 **Storage Structure**

### **Firebase Storage Buckets:**

```
📁 videos/                           # Admin-uploaded training videos
   📁 originals/                     # Original high-quality videos
      📄 exercise_1642234567.mp4
   📁 compressed/                    # Compressed for web delivery
      📄 exercise_1642234567_720p.mp4
   📁 thumbnails/                    # Auto-generated thumbnails
      📄 exercise_1642234567.jpg

📁 assessments/                      # User assessment submissions
   📁 {userId}/                      # User-specific folder
      📄 assessment_vid123_1642234567.mp4
      📄 assessment_vid456_1642234578.mp4

📁 challenges/                       # User challenge submissions
   📁 {userId}/                      # User-specific folder
      📁 weekly_challenge_123/       # Challenge-specific folder
         📄 submission_vid123_1642234567.mp4

📁 profiles/                         # User profile images
   📁 avatars/
      📄 {userId}.jpg
   📁 covers/
      📄 {userId}_cover.jpg

📁 collections/                      # Collection-related media
   📁 thumbnails/
      📄 collection_123.jpg
```

---

## 🔒 **Security Rules**

### **Firestore Rules Highlights:**

```javascript
// Users can read/write their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Videos are publicly readable, admin writable
match /videos/{videoId} {
  allow read: if true;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'admin';
}

// Assessments are private to user and admins
match /assessments/{assessmentId} {
  allow read, write: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType in ['admin', 'scout']);
}

// Challenges are publicly readable, admin writable
match /challenges/{challengeId} {
  allow read: if true;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'admin';
}
```

---

## 💻 **Implementation Examples**

### **Fetching User Assessment Progress:**
```javascript
// Get user's completed assessments
const getCompletedAssessments = async (userId) => {
  const completionsRef = collection(db, `users/${userId}/completions`)
  const q = query(
    completionsRef,
    where('type', '==', 'assessment'),
    orderBy('completedAt', 'desc')
  )
  
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}
```

### **Creating a Challenge Submission:**
```javascript
// Submit user challenge attempt
const submitChallenge = async (userId, challengeId, exerciseId, videoFile, count) => {
  // 1. Upload video to Storage
  const videoPath = `challenges/${userId}/challenge_${challengeId}_${Date.now()}.mp4`
  const videoUrl = await uploadVideo(videoFile, videoPath)
  
  // 2. Create submission document
  const submissionData = {
    userId,
    challengeId,
    exerciseId,
    videoUrl,
    videoPath,
    count,
    autoScore: calculateScore(count),
    submittedAt: serverTimestamp(),
    status: 'completed'
  }
  
  // 3. Add to user's submissions
  const submissionRef = await addDoc(
    collection(db, `users/${userId}/submissions`),
    submissionData
  )
  
  // 4. Update completion status
  await setDoc(doc(db, `users/${userId}/completions`, exerciseId), {
    exerciseId,
    challengeId,
    type: 'challenge',
    completedAt: serverTimestamp(),
    score: submissionData.autoScore,
    submissionId: submissionRef.id
  })
  
  return submissionRef.id
}
```

### **Getting User Dashboard Data:**
```javascript
// Get comprehensive user dashboard
const getUserDashboard = async (userId) => {
  const [userDoc, completions, submissions] = await Promise.all([
    getDoc(doc(db, 'users', userId)),
    getDocs(collection(db, `users/${userId}/completions`)),
    getDocs(query(
      collection(db, `users/${userId}/submissions`),
      orderBy('submittedAt', 'desc'),
      limit(5)
    ))
  ])
  
  return {
    profile: userDoc.data(),
    totalCompletions: completions.size,
    recentSubmissions: submissions.docs.map(doc => doc.data()),
    completedExercises: completions.docs.map(doc => doc.data().exerciseId)
  }
}
```

---

## 📈 **Performance Considerations**

1. **Indexes Required:**
   - `videos`: `status`, `exerciseType`, `skillLevel`
   - `assessments`: `userId`, `type`, `status`
   - `users/{userId}/submissions`: `challengeId`, `submittedAt`
   - `users/{userId}/completions`: `type`, `completedAt`

2. **Pagination:**
   - Use `startAfter()` for large video lists
   - Implement cursor-based pagination for leaderboards

3. **Caching:**
   - Cache popular videos and collections
   - Use Firestore offline persistence
   - Cache user completion status locally

4. **Cloud Functions:**
   - Auto-generate thumbnails on video upload
   - Update leaderboards on challenge completion
   - Send notifications for new challenges
   - Clean up expired challenge submissions

---

## 🎯 **Next Steps**

1. ✅ **Validate current implementation** against this structure
2. 🔄 **Update existing services** to match proposed schema
3. 📝 **Create migration scripts** for existing data
4. 🔧 **Implement missing collections** (challenges, leaderboards)
5. 🔒 **Update security rules** to match new structure
6. 📊 **Add analytics tracking** and dashboard
7. ⚡ **Optimize queries** and add proper indexes

---

*This structure provides a solid foundation for scaling the Football Scouts Platform while maintaining data integrity and performance.*
