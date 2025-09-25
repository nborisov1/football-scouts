/**
 * Challenge Generation Script
 * Generates 700 realistic challenges for the Firebase challenges collection
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDOkPWnTT6wGn_KCjHaFBcszPQj0Bz3gVQ",
  authDomain: "football-5e360.firebaseapp.com",
  projectId: "football-5e360",
  storageBucket: "football-5e360.firebasestorage.app",
  messagingSenderId: "970172747699",
  appId: "1:970172747699:web:8f8a3b2e5d3c1f9a8b5c4d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Constants for generating realistic data
const AGE_GROUPS = ['u8', 'u10', 'u12', 'u14', 'u16', 'u18', 'u21', 'adult'];
const CATEGORIES = ['fitness-training', 'football-training'];
const EXERCISE_TYPES = ['shooting', 'dribbling', 'passing', 'ball-control', 'defending', 'goalkeeping', 'fitness', 'agility', 'tactics'];
const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'professional'];
const TARGET_AUDIENCES = ['youth', 'amateur', 'professional'];
const POSITIONS = ['goalkeeper', 'defender', 'midfielder', 'striker', 'center-back', 'fullback', 'winger'];
const TRAINING_TYPES = ['general-training', 'power-training', 'position-specific', 'skill-development', 'tactical-training', 'fitness-conditioning'];

// Equipment options
const EQUIPMENT_OPTIONS = [
  'כדורי כדורגל',
  'קונוסים',
  'סולמות זריזות',
  'גולים קטנים',
  'חבלים',
  'מחסומים',
  'כדורי מדיצינה',
  'משקולות',
  'רצועות התנגדות',
  'מזרנים',
  'חרוטים',
  'סולמות ריצה',
  'כדורי שיווי משקל',
  'מדדי מהירות',
  'מחסומי גובה',
  'רשתות'
];

// Goals by exercise type
const GOALS_BY_TYPE = {
  shooting: ['שיפור דיוק', 'פיתוח כוח', 'שיפור טכניקה', 'הגברת ביטחון'],
  dribbling: ['שיפור שליטה בכדור', 'פיתוח זריזות', 'שיפור איזון', 'פיתוח יצירתיות'],
  passing: ['שיפור דיוק מסירות', 'פיתוח חזון משחק', 'שיפור טכניקה', 'פיתוח מהירות חשיבה'],
  defending: ['שיפור עמידה', 'פיתוח זמן תערבות', 'שיפור קריאת משחק', 'חיזוק גופני'],
  goalkeeping: ['שיפור רפלקסים', 'פיתוח זריזות', 'שיפור עמידה', 'חיזוק ליבה'],
  fitness: ['פיתוח סיבולת', 'חיזוק שרירים', 'שיפור כושר', 'פיתוח מהירות'],
  agility: ['פיתוח זריזות', 'שיפור קואורדינציה', 'פיתוח איזון', 'הגברת מהירות'],
  tactics: ['שיפור הבנת משחק', 'פיתוח חשיבה טקטית', 'שיפור עבודת צוות', 'פיתוח מנהיגות']
};

// Challenge titles by type and level
const CHALLENGE_TITLES = {
  shooting: {
    beginner: [
      'בעיטות בסיסיות למטרה',
      'אימון דיוק למתחילים',
      'בעיטות מרחק קצר',
      'טכניקת בעיטה נכונה'
    ],
    intermediate: [
      'בעיטות מזוויות שונות',
      'בעיטות תחת לחץ',
      'שילוב כדרור ובעיטה',
      'בעיטות מרחק בינוני'
    ],
    advanced: [
      'בעיטות מרחק ארוך',
      'בעיטות וולה מורכבות',
      'בעיטות תחת לחץ זמן',
      'בעיטות חופשיות מתקדמות'
    ],
    professional: [
      'בעיטות ברמה מקצועית',
      'סיום מצבים מורכבים',
      'בעיטות תחת לחץ עליון',
      'טכניקות מתקדמות'
    ]
  },
  dribbling: {
    beginner: [
      'כדרור בסיסי עם קונוסים',
      'שליטה בכדור למתחילים',
      'כדרור במהירות איטית',
      'טכניקת כדרור נכונה'
    ],
    intermediate: [
      'כדרור במהירות בינונית',
      'שינויי כיוון עם הכדור',
      'כדרור תחת לחץ קל',
      'שילוב כדרור ומסירה'
    ],
    advanced: [
      'כדרור במהירות גבוהה',
      'כדרור במרחב מצומצם',
      'כדרור תחת לחץ רב',
      'טכניקות כדרור מתקדמות'
    ],
    professional: [
      'כדרור ברמה מקצועית',
      'כדרור בתנאי משחק',
      'כדרור מול יריבים',
      'טכניקות מורכבות'
    ]
  },
  fitness: {
    beginner: [
      'אימון כושר בסיסי',
      'חיזוק שרירי ליבה',
      'אימון סיבולת קל',
      'גמישות ומתיחות'
    ],
    intermediate: [
      'אימון כוח בינוני',
      'אימון אינטרבלים',
      'חיזוק רגליים',
      'שיפור מהירות'
    ],
    advanced: [
      'אימון כוח מתקדם',
      'אימון פליומטרי',
      'אימון סיבולת גבוה',
      'אימון מהירות מורכב'
    ],
    professional: [
      'אימון ברמה מקצועית',
      'אימון כוח מרבי',
      'אימון תחרותי',
      'הכנה פיזית עליונה'
    ]
  }
  // Add more types as needed
};

// Hebrew descriptions by exercise type
const DESCRIPTIONS = {
  shooting: [
    'תרגיל מתמקד בשיפור דיוק הבעיטות ופיתוח כוח הבעיטה.',
    'אימון טכניקת בעיטה נכונה עם דגש על עמידה ותנועת הרגל.',
    'תרגיל בעיטות למטרה מזוויות ומרחקים שונים.',
    'פיתוח בטחון עצמי בסיום מצבים תקפיים.'
  ],
  dribbling: [
    'תרגיל לשיפור שליטה בכדור וזריזות עם הכדור.',
    'אימון כדרור במרחבים מצומצמים ותחת לחץ.',
    'פיתוח יכולת שינוי כיוון מהיר עם שמירה על השליטה.',
    'תרגיל שילוב כדרור עם מסירה ובעיטה.'
  ],
  fitness: [
    'אימון כושר גופני כללי לשיפור הכנה פיזית.',
    'תרגיל חיזוק שרירי ליבה ויציבות.',
    'אימון סיבולת לשיפור יכולת המשך במשחק.',
    'פיתוח מהירות וזריזות בתנועה.'
  ],
  defending: [
    'תרגיל לשיפור טכניקת הגנה ועמידה נכונה.',
    'אימון זמן תערבות וקריאת התקפת היריב.',
    'פיתוח יכולת הגנה קבוצתית ותיאום.',
    'תרגיל הגנה אישית ומעבר למתקפה.'
  ]
};

// Instructions by exercise type
const INSTRUCTIONS = {
  shooting: [
    'התחל בחימום של 10 דקות. בצע בעיטות מרחק קצר למטרה. הקפד על טכניקה נכונה - עמידה יציבה, מבט על המטרה, בעיטה במרכז הכדור.',
    'חמם היטב לפני התחלת התרגיל. מקם קונוסים במרחקים שונים מהשער. בצע בעיטות מכל נקודה, התמקד בדיוק על פני כוח.',
    'בצע חימום דינמי. תרגל בעיטות מזוויות שונות לשער. שמור על איזון גוף ובצע בעיטה חלקה.',
    'חימום מלא כולל מתיחות. תרגל בעיטות תחת לחץ זמן. ספור זמן מהרגע קבלת הכדור עד הבעיטה.'
  ],
  dribbling: [
    'חמם עם ריצה קלה וכדרור חופשי. סדר קונוסים בקו ישר ובצע כדרור ביניהם. התחל במהירות איטית והגבר בהדרגה.',
    'חימום של 15 דקות. בצע כדרור במרחב מסומן עם מטרה לא לצאת מהגבולות. הוסף אלמנטים של שינוי כיוון.',
    'חימום מלא כולל גמישות. תרגל כדרור עם שתי רגליים. בצע תרגילי כדרור מורכבים עם שילוב פיקות.',
    'חימום דינמי מורחב. בצע כדרור תחת לחץ עם מגבלות זמן. שלב אלמנטים של הונאה ושינויי קצב.'
  ],
  fitness: [
    'התחל בחימום של 10 דקות ריצה קלה. בצע תרגילי חיזוק בסיסיים - שכיבות סמיכה, כפיפות בטן, סקוואטים. 3 סטים של 10-15 חזרות כל תרגיל.',
    'חימום של 15 דקות כולל מתיחות דינמיות. בצע תרגילי אינטרבלים - ריצת מהירות 30 שניות, מנוחה 30 שניות. חזור 10 פעמים.',
    'חימום מלא 20 דקות. בצע אימון פליומטרי - קפיצות על קופסה, קפיצות כדור, בורפיז. התמקד בכוח ומהירות.',
    'חימום מורחב כולל הכנה לאימון עז. בצע תרגילי כוח מקסימלי עם משקולות. פעל תחת פיקוח מאמן מוסמך.'
  ]
};

// Generate random number in range
function randomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get random item from array
function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Get random items from array
function randomItemsFromArray(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// Generate age-appropriate skill level
function getAgeAppropriateSkillLevels(ageGroup) {
  switch (ageGroup) {
    case 'u8':
    case 'u10':
      return ['beginner'];
    case 'u12':
    case 'u14':
      return ['beginner', 'intermediate'];
    case 'u16':
    case 'u18':
      return ['beginner', 'intermediate', 'advanced'];
    case 'u21':
    case 'adult':
      return ['beginner', 'intermediate', 'advanced', 'professional'];
    default:
      return ['beginner', 'intermediate'];
  }
}

// Generate challenge
function generateChallenge() {
  const ageGroup = randomFromArray(AGE_GROUPS);
  const category = randomFromArray(CATEGORIES);
  const exerciseType = randomFromArray(EXERCISE_TYPES);
  const skillLevel = randomFromArray(getAgeAppropriateSkillLevels(ageGroup));
  const targetAudience = ['u8', 'u10', 'u12', 'u14', 'u16', 'u18'].includes(ageGroup) ? 'youth' : randomFromArray(TARGET_AUDIENCES);
  
  // Get difficulty based on skill level
  const difficultyByLevel = {
    beginner: randomInRange(1, 3),
    intermediate: randomInRange(4, 6),
    advanced: randomInRange(7, 8),
    professional: randomInRange(9, 10)
  };
  
  const difficulty = difficultyByLevel[skillLevel];
  
  // Generate title
  const titlesByType = CHALLENGE_TITLES[exerciseType] || CHALLENGE_TITLES.fitness;
  const titleOptions = titlesByType[skillLevel] || titlesByType.beginner;
  const baseTitle = randomFromArray(titleOptions);
  const title = `${baseTitle} - רמה ${skillLevel} - ${ageGroup}`;
  
  // Generate description
  const descriptionOptions = DESCRIPTIONS[exerciseType] || DESCRIPTIONS.fitness;
  const description = randomFromArray(descriptionOptions);
  
  // Generate instructions
  const instructionOptions = INSTRUCTIONS[exerciseType] || INSTRUCTIONS.fitness;
  const instructions = randomFromArray(instructionOptions);
  
  // Generate goals
  const goalOptions = GOALS_BY_TYPE[exerciseType] || GOALS_BY_TYPE.fitness;
  const goals = randomItemsFromArray(goalOptions, randomInRange(2, 4));
  
  // Generate equipment
  const equipment = randomItemsFromArray(EQUIPMENT_OPTIONS, randomInRange(1, 4));
  
  // Generate positions (some exercises are for all positions)
  const positions = Math.random() > 0.3 ? randomItemsFromArray(POSITIONS, randomInRange(1, 3)) : [];
  
  // Generate tags
  const tags = [
    exerciseType,
    skillLevel,
    ageGroup,
    category.split('-')[0], // 'fitness' or 'football'
    ...goals.slice(0, 2).map(goal => goal.split(' ')[1] || goal.split(' ')[0]) // Extract key words
  ];
  
  // Expected duration based on difficulty and age
  const baseDuration = {
    'u8': randomInRange(15, 25),
    'u10': randomInRange(20, 30),
    'u12': randomInRange(25, 35),
    'u14': randomInRange(30, 40),
    'u16': randomInRange(35, 45),
    'u18': randomInRange(40, 50),
    'u21': randomInRange(45, 55),
    'adult': randomInRange(50, 60)
  };
  
  const expectedDuration = baseDuration[ageGroup] + (difficulty * 2);
  
  return {
    title,
    description,
    instructions,
    category,
    exerciseType,
    skillLevel,
    ageGroup,
    targetAudience,
    difficultyLevel: difficulty,
    expectedDuration,
    duration: randomInRange(300, 600), // Video duration in seconds
    trainingType: randomFromArray(TRAINING_TYPES),
    goals,
    requiredEquipment: equipment,
    positionSpecific: positions,
    tags,
    
    // Technical fields
    fileName: "1757411151069_Screen_Recording_2025-09-04_at_20.57.17.mov",
    fileSize: randomInRange(150000000, 200000000),
    format: "mov",
    resolution: "1080p",
    videoUrl: "https://firebasestorage.googleapis.com/v0/b/football-5e360.firebasestorage.app/o/videos%2F1757411151069_Screen_Recording_2025-09-04_at_20.57.17.mov?alt=media",
    
    // Status and meta
    status: "approved",
    uploadedBy: "admin",
    uploadedAt: serverTimestamp(),
    lastModified: serverTimestamp(),
    moderatedAt: serverTimestamp(),
    moderatedBy: "admin",
    
    // Engagement metrics
    views: randomInRange(50, 500),
    likes: randomInRange(10, 100),
    downloads: randomInRange(20, 150),
    
    // New personalization fields
    isActive: true,
    requiredLevel: Math.max(1, difficulty - 2), // Require slightly lower level
    points: difficulty * 10, // Points based on difficulty
    metrics: [], // Will be populated by service
    prerequisites: [], // No prerequisites for now
    isLevelSpecific: Math.random() > 0.7 // 30% are level-specific
  };
}

// Main function to generate and upload challenges
async function generateChallenges() {
  console.log('🚀 Starting challenge generation...');
  console.log('📊 Target: 700 challenges');
  
  const challengesRef = collection(db, 'challenges');
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < 700; i++) {
    try {
      const challenge = generateChallenge();
      await addDoc(challengesRef, challenge);
      successCount++;
      
      if (successCount % 50 === 0) {
        console.log(`✅ Generated ${successCount} challenges...`);
      }
      
      // Small delay to avoid overwhelming Firebase
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.error(`❌ Error generating challenge ${i + 1}:`, error);
      errorCount++;
    }
  }
  
  console.log('\n🎉 Challenge generation complete!');
  console.log(`✅ Successfully created: ${successCount} challenges`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('\n📊 Summary:');
  console.log(`- Total challenges in database: ${successCount}`);
  console.log(`- Age groups covered: ${AGE_GROUPS.join(', ')}`);
  console.log(`- Exercise types: ${EXERCISE_TYPES.join(', ')}`);
  console.log(`- Skill levels: ${SKILL_LEVELS.join(', ')}`);
  
  process.exit(0);
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

// Run the script
generateChallenges().catch(console.error);
