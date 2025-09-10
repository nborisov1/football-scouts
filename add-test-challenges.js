/**
 * Quick script to add test challenges to Firebase
 * Run with: node add-test-challenges.js
 */

const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore')

// Your Firebase config (from src/lib/firebase.ts)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDOgYFBT5PJp1FIKOdZIRD7DRVQC2yp7vQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "football-scouts-db.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "football-scouts-db",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "football-scouts-db.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1032594194075",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1032594194075:web:7b9b234567890123"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const testChallenges = [
  {
    title: "כדורי העברה בסיסי",
    description: "תרגיל העברות בסיסי עם כדור. בצע 10 העברות מדויקות למטרה.",
    instructions: "1. הגדר שתי כיוונים במרחק 5 מטר\n2. בצע 10 העברות מדויקות\n3. צלם את עצמך מבצע את התרגיל",
    category: "passing",
    difficulty: "beginner",
    level: 1,
    status: "available",
    ageGroup: "u14",
    positions: ["midfielder", "defender"],
    attempts: 3,
    timeLimit: 300, // 5 minutes
    isMonthlyChallenge: false,
    rewards: {
      points: 50,
      xp: 25
    },
    metrics: [
      {
        id: "accuracy",
        name: "דיוק העברות",
        description: "כמה העברות פגעו במטרה מתוך 10",
        type: "numeric",
        unit: "פגיעות",
        required: true,
        min: 0,
        max: 10
      },
      {
        id: "time",
        name: "זמן ביצוע",
        description: "כמה זמן לקח לבצע את כל ההעברות",
        type: "time",
        unit: "שניות",
        required: true,
        min: 30,
        max: 300
      }
    ]
  },
  {
    title: "ריצה עם כדור",
    description: "תרגיל הובלת כדור במהירות. בצע ריצה של 20 מטר עם כדור.",
    instructions: "1. סמן מסלול של 20 מטר\n2. בצע ריצה עם כדור תוך שמירה על שליטה\n3. צלם את הביצוע",
    category: "dribbling",
    difficulty: "beginner",
    level: 1,
    status: "available",
    ageGroup: "u16",
    positions: ["forward", "midfielder"],
    attempts: 3,
    timeLimit: 180,
    isMonthlyChallenge: false,
    rewards: {
      points: 60,
      xp: 30
    },
    metrics: [
      {
        id: "speed",
        name: "מהירות",
        description: "זמן הריצה ב-20 מטר",
        type: "time",
        unit: "שניות",
        required: true,
        min: 5,
        max: 15
      },
      {
        id: "touches",
        name: "מגעי כדור",
        description: "כמה פעמים נגעת בכדור",
        type: "numeric",
        unit: "מגעים",
        required: true,
        min: 5,
        max: 30
      }
    ]
  },
  {
    title: "בעיטות למרחק",
    description: "תרגיל בעיטות למרחק. בצע 5 בעיטות ארוכות.",
    instructions: "1. עמוד ברגל התחמה\n2. בצע 5 בעיטות למרחק מקסימלי\n3. מדוד את המרחק של הבעיטה הטובה ביותר",
    category: "shooting",
    difficulty: "intermediate",
    level: 2,
    status: "available",
    ageGroup: "u16",
    positions: ["defender", "midfielder"],
    attempts: 2,
    timeLimit: 600,
    isMonthlyChallenge: false,
    rewards: {
      points: 80,
      xp: 40
    },
    metrics: [
      {
        id: "distance",
        name: "מרחק בעיטה",
        description: "המרחק של הבעיטה הטובה ביותר",
        type: "numeric",
        unit: "מטרים",
        required: true,
        min: 10,
        max: 50
      },
      {
        id: "accuracy",
        name: "דיוק בעיטות",
        description: "כמה בעיטות מתוך 5 היו בכיוון הנכון",
        type: "numeric", 
        unit: "בעיטות מדויקות",
        required: true,
        min: 0,
        max: 5
      }
    ]
  },
  {
    title: "שמירת שער בסיסית",
    description: "תרגיל שמירה על השער. עצור 10 כדורים שנבעטו לעברך.",
    instructions: "1. עמוד בשער\n2. בקש ממישהו לבעוט 10 כדורים לעברך\n3. נסה לעצור כמה שיותר",
    category: "goalkeeping",
    difficulty: "beginner",
    level: 1,
    status: "available",
    ageGroup: "u14",
    positions: ["goalkeeper"],
    attempts: 3,
    timeLimit: 600,
    isMonthlyChallenge: false,
    rewards: {
      points: 70,
      xp: 35
    },
    metrics: [
      {
        id: "saves",
        name: "הצלות",
        description: "כמה כדורים עצרת מתוך 10",
        type: "numeric",
        unit: "הצלות",
        required: true,
        min: 0,
        max: 10
      },
      {
        id: "reflexes",
        name: "זמן תגובה",
        description: "ציון סובייקטיבי לזמן התגובה (1-10)",
        type: "numeric",
        unit: "ציון",
        required: false,
        min: 1,
        max: 10
      }
    ]
  },
  {
    title: "אתגר חודשי - כישורי כדורגל מתקדמים",
    description: "אתגר חודשי מקיף הכולל מספר תרגילים. הזדמנות לזכות בנקודות רבות!",
    instructions: "1. בצע את כל התרגילים ברצף\n2. תעד את הביצוע בסרטון אחד\n3. שמור על רמה גבוהה לאורך כל התרגיל",
    category: "combination",
    difficulty: "advanced",
    level: 3,
    status: "available",
    ageGroup: "u16",
    positions: ["forward", "midfielder", "defender"],
    attempts: 1,
    timeLimit: 1800, // 30 minutes
    isMonthlyChallenge: true,
    rewards: {
      points: 200,
      xp: 100
    },
    metrics: [
      {
        id: "overall_score",
        name: "ציון כללי",
        description: "ציון כללי לביצוע (1-100)",
        type: "numeric",
        unit: "נקודות",
        required: true,
        min: 1,
        max: 100
      },
      {
        id: "creativity",
        name: "יצירתיות",
        description: "ציון ליצירתיות בביצוע (1-10)",
        type: "numeric",
        unit: "ציון",
        required: false,
        min: 1,
        max: 10
      }
    ]
  }
]

async function addChallenges() {
  console.log('🔥 Adding test challenges to Firebase...')
  
  try {
    for (let i = 0; i < testChallenges.length; i++) {
      const challenge = testChallenges[i]
      console.log(`Adding challenge ${i + 1}/${testChallenges.length}: ${challenge.title}`)
      
      const docRef = await addDoc(collection(db, 'challenges'), {
        ...challenge,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      console.log(`✅ Added challenge with ID: ${docRef.id}`)
    }
    
    console.log('🎉 All test challenges added successfully!')
    console.log('👉 Now go to your app and check the challenges page!')
    
  } catch (error) {
    console.error('❌ Error adding challenges:', error)
  }
}

addChallenges()
