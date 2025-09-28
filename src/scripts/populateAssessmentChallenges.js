/**
 * Script to populate Firebase with 10 assessment challenges
 * Run this once to set up your assessment challenges in Firebase
 */

const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore')

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCajKv0i81Fjw_Vv_DDQs1co3GDcsjVeyU",
  authDomain: "football-5e360.firebaseapp.com",
  projectId: "football-5e360",
  storageBucket: "football-5e360.firebasestorage.app",
  messagingSenderId: "1035428109661",
  appId: "1:1035428109661:web:b41e0e45728f762bfb1cb4",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// 10 Assessment Challenges
const assessmentChallenges = [
  {
    title: 'שליטה בכדור בסיסית',
    description: 'אתגר שליטה בכדור עם כף הרגל',
    instructions: [
      'עמוד במקום עם כדור',
      'בצע שליטה בכדור עם כף הרגל הימנית',
      'נסה לשמור על הכדור באוויר ללא נפילה',
      'ספור כמה נגיעות רצופות הצלחת לבצע',
      'צלם את עצמך מבצע את התרגיל למשך דקה'
    ],
    type: 'assessment',
    category: 'technical',
    order: 1,
    metrics: {
      type: 'count',
      target: 15,
      passingScore: 8,
      excellentScore: 20,
      unit: 'נגיעות רצופות',
      description: 'מספר הנגיעות ברצף ללא נפילת הכדור'
    },
    demonstrationVideoUrl: '',
    thumbnailUrl: '',
    equipment: ['כדור כדורגל'],
    spaceRequired: '2x2 מטרים',
    duration: 60,
    maxAttempts: 3,
    createdBy: 'system',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    title: 'דיוק מסירות קצרות',
    description: 'אתגר דיוק מסירות למטרה קרובה',
    instructions: [
      'הצב מטרה (קונוס או סמן) במרחק של 5 מטר',
      'עמוד עם הכדור מול המטרה',
      'בצע 10 מסירות עם הרגל הימנית למטרה',
      'ספור כמה מסירות פגעו במטרה או עברו במרחק של עד מטר ממנה',
      'צלם את עצמך מבצע את התרגיל'
    ],
    type: 'assessment',
    category: 'technical',
    order: 2,
    metrics: {
      type: 'count',
      target: 10,
      passingScore: 6,
      excellentScore: 9,
      unit: 'מסירות מדויקות',
      description: 'מספר המסירות שפגעו במטרה או קרוב אליה'
    },
    demonstrationVideoUrl: '',
    thumbnailUrl: '',
    equipment: ['כדור כדורגל', 'קונוס או סמן'],
    spaceRequired: '8x3 מטרים',
    duration: 90,
    maxAttempts: 3,
    createdBy: 'system',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    title: 'בעיטות דיוק לשער',
    description: 'אתגר בעיטות מדויקות לפינות השער',
    instructions: [
      'עמוד במרחק של 10 מטר מהשער (או מטרה מאולתרת)',
      'סמן שתי פינות בשער',
      'בצע 8 בעיטות - 4 לכל פינה',
      'ספור כמה בעיטות פגעו באזור המטרה',
      'צלם את עצמך מבצע את התרגיל'
    ],
    type: 'assessment',
    category: 'technical',
    order: 3,
    metrics: {
      type: 'count',
      target: 8,
      passingScore: 4,
      excellentScore: 7,
      unit: 'בעיטות מדויקות',
      description: 'מספר הבעיטות שפגעו באזור המטרה'
    },
    demonstrationVideoUrl: '',
    thumbnailUrl: '',
    equipment: ['כדור כדורגל', 'שער או מטרה מאולתרת', 'סמנים'],
    spaceRequired: '15x8 מטרים',
    duration: 120,
    maxAttempts: 3,
    createdBy: 'system',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    title: 'כדרור בין קונוסים',
    description: 'אתגר כדרור מהיר וזריז בין מכשולים',
    instructions: [
      'הצב 5 קונוסים בקו ישר במרחק של מטר וחצי בין כל קונוס',
      'התחל עם הכדור מול הקונוס הראשון',
      'בצע כדרור בין הקונוסים הלוך ושוב',
      'השתמש בשתי הרגליים',
      'ספור כמה מעברים מלאים (הלוך ושוב) הצלחת לבצע ב-60 שניות'
    ],
    type: 'assessment',
    category: 'technical',
    order: 4,
    metrics: {
      type: 'count',
      target: 6,
      passingScore: 3,
      excellentScore: 8,
      unit: 'מעברים מלאים',
      description: 'מספר המעברים המלאים בין הקונוסים'
    },
    demonstrationVideoUrl: '',
    thumbnailUrl: '',
    equipment: ['כדור כדורגל', '5 קונוסים'],
    spaceRequired: '10x3 מטרים',
    duration: 60,
    maxAttempts: 3,
    createdBy: 'system',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    title: 'קפיצות וזריזות',
    description: 'אתגר כושר גופני וזריזות',
    instructions: [
      'בצע 20 קפיצות על מקום עם הרמת ברכיים',
      'מיד לאחר מכן רוץ 10 מטר קדימה',
      'חזור אחורה בריצה',
      'בצע עוד 20 קפיצות',
      'ספור כמה סיבובים מלאים הצלחת לבצע ב-2 דקות'
    ],
    type: 'assessment',
    category: 'physical',
    order: 5,
    metrics: {
      type: 'count',
      target: 4,
      passingScore: 2,
      excellentScore: 6,
      unit: 'סיבובים מלאים',
      description: 'מספר הסיבובים המלאים של התרגיל'
    },
    demonstrationVideoUrl: '',
    thumbnailUrl: '',
    equipment: [],
    spaceRequired: '15x3 מטרים',
    duration: 120,
    maxAttempts: 3,
    createdBy: 'system',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    title: 'מסירות ארוכות',
    description: 'אתגר דיוק במסירות למרחק בינוני',
    instructions: [
      'הצב מטרה במרחק של 15 מטר',
      'בצע 8 מסירות ארוכות עם הרגל החזקה',
      'נסה לגרום לכדור לעצור קרוב למטרה (במרחק של עד 3 מטר)',
      'ספור כמה מסירות הצליחו',
      'צלם את עצמך מבצע את התרגיל'
    ],
    type: 'assessment',
    category: 'technical',
    order: 6,
    metrics: {
      type: 'count',
      target: 8,
      passingScore: 4,
      excellentScore: 7,
      unit: 'מסירות מוצלחות',
      description: 'מספר המסירות שהגיעו לאזור המטרה'
    },
    demonstrationVideoUrl: '',
    thumbnailUrl: '',
    equipment: ['כדור כדורגל', 'סמן למטרה'],
    spaceRequired: '20x5 מטרים',
    duration: 90,
    maxAttempts: 3,
    createdBy: 'system',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    title: 'שליטה בכדור עם שתי רגליים',
    description: 'אתגר שליטה מתקדם עם החלפת רגליים',
    instructions: [
      'התחל עם הכדור באוויר',
      'בצע שליטה בכדור תוך החלפה בין הרגל הימנית והשמאלית',
      'כל נגיעה צריכה להיות עם רגל אחרת',
      'נסה לשמור על הכדור באוויר',
      'ספור כמה נגיעות רצופות הצלחת עם החלפת רגליים'
    ],
    type: 'assessment',
    category: 'technical',
    order: 7,
    metrics: {
      type: 'count',
      target: 12,
      passingScore: 6,
      excellentScore: 18,
      unit: 'נגיעות מתחלפות',
      description: 'מספר הנגיעות הרצופות עם החלפת רגליים'
    },
    demonstrationVideoUrl: '',
    thumbnailUrl: '',
    equipment: ['כדור כדורגל'],
    spaceRequired: '3x3 מטרים',
    duration: 90,
    maxAttempts: 3,
    createdBy: 'system',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    title: 'ריצת זיגזג',
    description: 'אתגר זריזות וכיוון ללא כדור',
    instructions: [
      'הצב 4 קונוסים בצורת זיגזג במרחק של 3 מטר בין כל קונוס',
      'רוץ בזיגזג בין הקונוסים במהירות מקסימלית',
      'גע בכל קונוס ביד',
      'חזור לנקודת ההתחלה',
      'ספור כמה מעברים מלאים הצלחת לבצע ב-60 שניות'
    ],
    type: 'assessment',
    category: 'physical',
    order: 8,
    metrics: {
      type: 'count',
      target: 8,
      passingScore: 5,
      excellentScore: 12,
      unit: 'מעברים מלאים',
      description: 'מספר המעברים המלאים בזיגזג'
    },
    demonstrationVideoUrl: '',
    thumbnailUrl: '',
    equipment: ['4 קונוסים'],
    spaceRequired: '12x8 מטרים',
    duration: 60,
    maxAttempts: 3,
    createdBy: 'system',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    title: 'הגנה ויירוט',
    description: 'אתגר תנועות הגנתיות בסיסיות',
    instructions: [
      'דמיין שאתה מגן מול תוקף',
      'בצע 10 תנועות הגנתיות: צעד צידה ימינה ושמאלה',
      'בכל תנועה, שמור על עמדת הגנה נמוכה עם ברכיים כפופות',
      'הוסף תנועת ידיים כאילו אתה מנסה ליירט כדור',
      'ספור כמה סטים של 10 תנועות הצלחת לבצע ב-90 שניות'
    ],
    type: 'assessment',
    category: 'tactical',
    order: 9,
    metrics: {
      type: 'count',
      target: 3,
      passingScore: 2,
      excellentScore: 5,
      unit: 'סטים מלאים',
      description: 'מספר הסטים של 10 תנועות הגנתיות'
    },
    demonstrationVideoUrl: '',
    thumbnailUrl: '',
    equipment: [],
    spaceRequired: '5x5 מטרים',
    duration: 90,
    maxAttempts: 3,
    createdBy: 'system',
    isActive: true,
    createdAt: serverTimestamp()
  },
  {
    title: 'בעיטות מהירות',
    description: 'אתגר בעיטות מהירות ורצופות',
    instructions: [
      'הצב כדור מול קיר או רשת (במרחק של 3 מטר)',
      'בצע בעיטות מהירות ורצופות לקיר',
      'תפוס את הכדור כשהוא חוזר ובעט שוב מיד',
      'השתמש בשתי הרגליים לסירוגין',
      'ספור כמה בעיטות הצלחת לבצע ב-60 שניות'
    ],
    type: 'assessment',
    category: 'technical',
    order: 10,
    metrics: {
      type: 'count',
      target: 30,
      passingScore: 20,
      excellentScore: 40,
      unit: 'בעיטות',
      description: 'מספר הבעיטות הרצופות לקיר'
    },
    demonstrationVideoUrl: '',
    thumbnailUrl: '',
    equipment: ['כדור כדורגל', 'קיר או רשת'],
    spaceRequired: '5x5 מטרים',
    duration: 60,
    maxAttempts: 3,
    createdBy: 'system',
    isActive: true,
    createdAt: serverTimestamp()
  }
]

async function populateAssessmentChallenges() {
  try {
    console.log('🚀 Starting to populate assessment challenges...')
    
    const challengesRef = collection(db, 'assessmentChallenges')
    
    for (let i = 0; i < assessmentChallenges.length; i++) {
      const challenge = assessmentChallenges[i]
      console.log(`📝 Adding challenge ${i + 1}/10: ${challenge.title}`)
      
      const docRef = await addDoc(challengesRef, challenge)
      console.log(`✅ Added challenge with ID: ${docRef.id}`)
    }
    
    console.log('🎉 Successfully populated all 10 assessment challenges!')
    console.log('💡 You can now run your assessment flow and the exercises will load from Firebase.')
    
  } catch (error) {
    console.error('❌ Error populating assessment challenges:', error)
  }
}

// Run the script
populateAssessmentChallenges()
  .then(() => {
    console.log('✨ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })
