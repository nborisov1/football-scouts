/**
 * Firebase Configuration for Football Scouting Website
 * This file contains the Firebase configuration and initialization
 */

'use strict';

// Firebase configuration object - REPLACE WITH YOUR OWN FIREBASE PROJECT CREDENTIALS
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Set language to Hebrew for authentication messages
auth.languageCode = 'he';

// Enable offline persistence for Firestore
db.enablePersistence()
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required for persistence
      console.warn('Firestore persistence is not available in this browser');
    }
  });

// Export Firebase services
export { auth, db, storage };