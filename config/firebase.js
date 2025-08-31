/**
 * Firebase Configuration for Football Scouting Website
 * This file contains the Firebase configuration and initialization
 */

'use strict';

// Firebase configuration object - REPLACE WITH YOUR OWN FIREBASE PROJECT CREDENTIALS
const firebaseConfig = {
  apiKey: "AIzaSyCajKv0i81Fjw_Vv_DDQs1co3GDcsjVeyU",
  authDomain: "football-5e360.firebaseapp.com",
  projectId: "football-5e360",
  storageBucket: "football-5e360.appspot.com",
  messagingSenderId: "1035428109661",
  appId: "1:1035428109661:web:b41e0e45728f762bfb1cb4",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Set language to Hebrew for authentication messages
auth.languageCode = 'he';

// Set authentication persistence to LOCAL (persists across browser sessions)
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    console.log('Firebase Auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

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