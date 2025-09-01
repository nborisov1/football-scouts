# API Documentation - Football Scouting Platform

This document provides comprehensive API documentation for the Football Scouting Platform, covering both the current localStorage-based implementation and the planned Firebase-based API structure.

## Current Implementation (localStorage)

The current prototype uses localStorage for data persistence. This section documents the data structures and methods currently implemented.

### Data Storage Keys

| Key | Description | Data Type |
|-----|-------------|-----------|
| `footballScout_users` | User accounts (players, scouts, admins) | Array |
| `footballScout_currentUser` | Currently logged-in user | Object |
| `footballScout_challenges` | Available challenges | Array |
| `footballScout_videos` | Uploaded videos metadata | Array |
| `footballScout_trainingPrograms` | Training programs | Array |
| `footballScout_messages` | Internal messages | Array |
| `footballScout_notifications` | System notifications | Array |

### Current Auth API

```javascript
// auth/auth.js
class Auth {
  
  // Register new user
  static register(userData) {
    // Creates new user in localStorage
    // Returns: { success: boolean, user?: object, error?: string }
  }
  
  // Login user
  static login(email, password) {
    // Authenticates user against localStorage data
    // Returns: { success: boolean, user?: object, error?: string }
  }
  
  // Logout user
  static logout() {
    // Removes current user from localStorage
    // Returns: { success: boolean }
  }
  
  // Check if user is logged in
  static isLoggedIn() {
    // Returns: boolean
  }
  
  // Get current user
  static getCurrentUser() {
    // Returns: object | null
  }
  
  // Check user type
  static isUserType(type) {
    // Returns: boolean
  }
}
```

---

## Firebase API Structure (Target Implementation)

The following section outlines the planned Firebase-based API structure that will replace the localStorage implementation.

## Authentication API

### User Registration

**Endpoint**: Firebase Authentication  
**Method**: `createUserWithEmailAndPassword`

```javascript
// POST /auth/register
const registerUser = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'securePassword123',
      name: 'John Doe',
      type: 'player', // 'player' | 'scout' | 'admin'
      // Additional user-specific fields
      age: 20,
      position: 'midfielder',
      dominantFoot: 'right'
    })
  });
  
  return response.json();
  // Returns: { success: boolean, user?: object, error?: string }
};
```

### User Login

```javascript
// POST /auth/login
const loginUser = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'securePassword123'
    })
  });
  
  return response.json();
  // Returns: { success: boolean, user?: object, token?: string, error?: string }
};
```

### Password Reset

```javascript
// POST /auth/reset-password
const resetPassword = async (email) => {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  });
  
  return response.json();
  // Returns: { success: boolean, message?: string, error?: string }
};
```

## User Management API

### Get User Profile

```javascript
// GET /users/{userId}
const getUserProfile = async (userId) => {
  const response = await fetch(`/api/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, user?: object, error?: string }
};
```

### Update User Profile

```javascript
// PATCH /users/{userId}
const updateUserProfile = async (userId, updates) => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  
  return response.json();
  // Returns: { success: boolean, user?: object, error?: string }
};
```

### Get Players List (for Scouts)

```javascript
// GET /users/players?filters
const getPlayers = async (filters = {}) => {
  const queryParams = new URLSearchParams({
    position: filters.position || '',
    ageMin: filters.ageMin || '',
    ageMax: filters.ageMax || '',
    level: filters.level || '',
    page: filters.page || 1,
    limit: filters.limit || 20
  });
  
  const response = await fetch(`/api/users/players?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, players?: array, total?: number, error?: string }
};
```

## Training Programs API

### Get Training Programs

```javascript
// GET /training-programs
const getTrainingPrograms = async (level = null) => {
  const url = level 
    ? `/api/training-programs?level=${level}`
    : '/api/training-programs';
    
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, programs?: array, error?: string }
};
```

### Get Personalized Training Program

```javascript
// GET /training-programs/personalized
const getPersonalizedProgram = async () => {
  const response = await fetch('/api/training-programs/personalized', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, program?: object, error?: string }
};
```

### Complete Training Exercise

```javascript
// POST /training-programs/{programId}/exercises/{exerciseId}/complete
const completeExercise = async (programId, exerciseId, completionData) => {
  const response = await fetch(`/api/training-programs/${programId}/exercises/${exerciseId}/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      score: completionData.score,
      notes: completionData.notes,
      videoUrl: completionData.videoUrl
    })
  });
  
  return response.json();
  // Returns: { success: boolean, points?: number, error?: string }
};
```

## Challenges API

### Get Available Challenges

```javascript
// GET /challenges
const getChallenges = async (level = null) => {
  const url = level 
    ? `/api/challenges?level=${level}`
    : '/api/challenges';
    
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, challenges?: array, error?: string }
};
```

### Submit Challenge

```javascript
// POST /challenges/{challengeId}/submit
const submitChallenge = async (challengeId, submissionData) => {
  const formData = new FormData();
  formData.append('video', submissionData.videoFile);
  formData.append('notes', submissionData.notes);
  
  const response = await fetch(`/api/challenges/${challengeId}/submit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData
  });
  
  return response.json();
  // Returns: { success: boolean, submission?: object, error?: string }
};
```

## Video Management API

### Upload Video

```javascript
// POST /videos/upload
const uploadVideo = async (videoFile, metadata) => {
  const formData = new FormData();
  formData.append('video', videoFile);
  formData.append('title', metadata.title);
  formData.append('description', metadata.description);
  formData.append('challengeId', metadata.challengeId);
  
  const response = await fetch('/api/videos/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: formData
  });
  
  return response.json();
  // Returns: { success: boolean, video?: object, error?: string }
};
```

### Get User Videos

```javascript
// GET /videos/user/{userId}
const getUserVideos = async (userId) => {
  const response = await fetch(`/api/videos/user/${userId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, videos?: array, error?: string }
};
```

### Approve/Reject Video (Admin)

```javascript
// PATCH /videos/{videoId}/review
const reviewVideo = async (videoId, reviewData) => {
  const response = await fetch(`/api/videos/${videoId}/review`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'approved', // 'approved' | 'rejected'
      feedback: reviewData.feedback
    })
  });
  
  return response.json();
  // Returns: { success: boolean, video?: object, error?: string }
};
```

## Messaging API

### Send Message

```javascript
// POST /messages
const sendMessage = async (messageData) => {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      receiverId: messageData.receiverId,
      content: messageData.content,
      type: messageData.type || 'text'
    })
  });
  
  return response.json();
  // Returns: { success: boolean, message?: object, error?: string }
};
```

### Get Conversations

```javascript
// GET /messages/conversations
const getConversations = async () => {
  const response = await fetch('/api/messages/conversations', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, conversations?: array, error?: string }
};
```

### Get Messages in Conversation

```javascript
// GET /messages/conversation/{userId}
const getConversationMessages = async (userId, page = 1) => {
  const response = await fetch(`/api/messages/conversation/${userId}?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, messages?: array, error?: string }
};
```

## Leaderboards API

### Get Leaderboards

```javascript
// GET /leaderboards
const getLeaderboards = async (filters = {}) => {
  const queryParams = new URLSearchParams({
    category: filters.category || 'overall',
    timeframe: filters.timeframe || 'all-time',
    position: filters.position || '',
    limit: filters.limit || 50
  });
  
  const response = await fetch(`/api/leaderboards?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, leaderboard?: array, userRank?: number, error?: string }
};
```

## Scout Features API

### Watchlist Management

```javascript
// POST /scouts/watchlist/{playerId}
const addToWatchlist = async (playerId) => {
  const response = await fetch(`/api/scouts/watchlist/${playerId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, error?: string }
};

// DELETE /scouts/watchlist/{playerId}
const removeFromWatchlist = async (playerId) => {
  const response = await fetch(`/api/scouts/watchlist/${playerId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, error?: string }
};

// GET /scouts/watchlist
const getWatchlist = async () => {
  const response = await fetch('/api/scouts/watchlist', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, players?: array, error?: string }
};
```

### Video Evaluation

```javascript
// POST /scouts/evaluations
const createVideoEvaluation = async (evaluationData) => {
  const response = await fetch('/api/scouts/evaluations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      videoId: evaluationData.videoId,
      tags: evaluationData.tags, // Array of timestamped tags
      notes: evaluationData.notes,
      overallRating: evaluationData.overallRating
    })
  });
  
  return response.json();
  // Returns: { success: boolean, evaluation?: object, error?: string }
};
```

## Admin API

### User Management

```javascript
// GET /admin/users
const getAllUsers = async (filters = {}) => {
  const queryParams = new URLSearchParams({
    type: filters.type || '',
    status: filters.status || '',
    page: filters.page || 1,
    limit: filters.limit || 50
  });
  
  const response = await fetch(`/api/admin/users?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, users?: array, total?: number, error?: string }
};

// PATCH /admin/users/{userId}/status
const updateUserStatus = async (userId, status) => {
  const response = await fetch(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status }) // 'active' | 'suspended' | 'banned'
  });
  
  return response.json();
  // Returns: { success: boolean, user?: object, error?: string }
};
```

### Analytics

```javascript
// GET /admin/analytics
const getAnalytics = async (timeframe = '30d') => {
  const response = await fetch(`/api/admin/analytics?timeframe=${timeframe}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  return response.json();
  // Returns: { success: boolean, analytics?: object, error?: string }
};
```

## Real-time Features (Firebase)

### Real-time Listeners

```javascript
// Listen to user profile changes
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase.js';

const subscribeToUserUpdates = (userId, callback) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (doc) => {
    callback(doc.data());
  });
};

// Listen to new messages
const subscribeToMessages = (conversationId, callback) => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};
```

## Error Handling

### Standard Error Response Format

```javascript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR', // Error code
    message: 'Invalid email format', // Human-readable message
    details: { // Additional error details
      field: 'email',
      value: 'invalid-email'
    }
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `UNAUTHORIZED` | Authentication required | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `CONFLICT` | Resource already exists | 409 |
| `RATE_LIMITED` | Too many requests | 429 |
| `SERVER_ERROR` | Internal server error | 500 |

## Rate Limiting

### Current Limits (Target Implementation)

| Endpoint Category | Limit | Window |
|------------------|-------|---------|
| Authentication | 5 requests | 15 minutes |
| Video Upload | 10 uploads | 1 hour |
| Messaging | 100 messages | 1 hour |
| General API | 1000 requests | 1 hour |

## SDK Usage Examples

### Initialization

```javascript
import { FootballScoutingAPI } from './api/football-scouting-sdk.js';

// Initialize SDK
const api = new FootballScoutingAPI({
  apiUrl: 'https://api.football-scouting.com',
  apiKey: 'your-api-key'
});

// Set authentication token
api.setAuthToken(userToken);
```

### Usage Examples

```javascript
// Register new player
try {
  const result = await api.auth.register({
    email: 'player@example.com',
    password: 'securePassword123',
    name: 'John Doe',
    type: 'player',
    age: 20,
    position: 'midfielder'
  });
  
  if (result.success) {
    console.log('User registered:', result.user);
  }
} catch (error) {
  console.error('Registration failed:', error);
}

// Get personalized training program
const program = await api.training.getPersonalized();

// Submit challenge with video
const submission = await api.challenges.submit('challenge-id', {
  videoFile: videoFile,
  notes: 'Great performance!'
});

// Add player to watchlist (scout)
await api.scouts.addToWatchlist('player-id');
```

This API documentation will evolve as the platform migrates from localStorage to Firebase and additional features are implemented.
