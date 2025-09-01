# המלצות אבטחה - פוטבול סקאוטינג

מסמך זה מפרט המלצות אבטחה עבור אתר פוטבול סקאוטינג. למרות שהאתר הנוכחי פועל בצד הלקוח בלבד (עם localStorage), המלצות אלו חשובות במיוחד בעת מעבר לפתרון עם שרת אמיתי.

## אבטחת צד לקוח

### 1. אימות משתמשים

#### מצב נוכחי (localStorage)
כרגע, האתר משתמש ב-localStorage לשמירת נתוני משתמשים ואימות. זהו פתרון זמני שמתאים לדמו, אך אינו מאובטח לסביבת ייצור.

```javascript
// דוגמה לקוד הנוכחי
class Auth {
  static login(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  }
}
```

#### המלצות לשיפור (גם במצב הנוכחי)

1. **הצפנת סיסמאות**:
   אפילו בפתרון מבוסס localStorage, יש להצפין סיסמאות:

```javascript
class Auth {
  static hashPassword(password) {
    // שימוש ב-SHA-256 כפתרון בסיסי (לא מושלם אך עדיף על טקסט גלוי)
    return CryptoJS.SHA256(password).toString();
  }
  
  static register(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const hashedPassword = this.hashPassword(password);
    users.push({ email, password: hashedPassword });
    localStorage.setItem('users', JSON.stringify(users));
  }
  
  static login(email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const hashedPassword = this.hashPassword(password);
    const user = users.find(u => u.email === email && u.password === hashedPassword);
    
    if (user) {
      // אל תשמור את הסיסמה בנתוני המשתמש המחובר
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  }
}
```

2. **ולידציה של קלט משתמש**:

```javascript
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  // לפחות 8 תווים, אות גדולה, אות קטנה ומספר
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return re.test(password);
}

function sanitizeInput(input) {
  // הסרת תווים מסוכנים
  return input.replace(/[<>&"']/g, '');
}
```

3. **הגנה מפני XSS**:
   סניטציה של כל קלט משתמש לפני הצגתו:

```javascript
function displayUserContent(content) {
  const sanitized = DOMPurify.sanitize(content);
  document.getElementById('content').innerHTML = sanitized;
}
```

4. **הגבלת גישה לדפים מאובטחים**:

```javascript
function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// בכל דף מאובטח
document.addEventListener('DOMContentLoaded', function() {
  if (!checkAuth()) return;
  // המשך טעינת הדף
});
```

### 2. אבטחת טפסים

1. **הגנה מפני CSRF**:
   למרות שזה פחות רלוונטי בפתרון מבוסס localStorage, זה חשוב לעתיד:

```javascript
function generateCSRFToken() {
  const token = Math.random().toString(36).substring(2);
  localStorage.setItem('csrfToken', token);
  return token;
}

function setupForm() {
  const form = document.getElementById('myForm');
  const csrfToken = generateCSRFToken();
  const csrfInput = document.createElement('input');
  csrfInput.type = 'hidden';
  csrfInput.name = 'csrf';
  csrfInput.value = csrfToken;
  form.appendChild(csrfInput);
}
```

2. **הגבלת קצב בקשות**:
   הגבלת מספר ניסיונות התחברות:

```javascript
class LoginLimiter {
  static checkLimit(email) {
    const attempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
    const now = Date.now();
    
    if (!attempts[email]) {
      attempts[email] = { count: 0, timestamp: now };
    }
    
    // איפוס לאחר שעה
    if (now - attempts[email].timestamp > 3600000) {
      attempts[email] = { count: 0, timestamp: now };
    }
    
    // בדיקת מגבלה (5 ניסיונות)
    if (attempts[email].count >= 5) {
      return false;
    }
    
    // עדכון מונה
    attempts[email].count++;
    attempts[email].timestamp = now;
    localStorage.setItem('loginAttempts', JSON.stringify(attempts));
    return true;
  }
}
```

### 3. אבטחת נתונים

1. **הצפנת נתונים רגישים**:

```javascript
class SecureStorage {
  static encryptData(data, key) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
  }
  
  static decryptData(encryptedData, key) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }
  
  static saveSecureData(key, data, encryptionKey) {
    const encrypted = this.encryptData(data, encryptionKey);
    localStorage.setItem(key, encrypted);
  }
  
  static getSecureData(key, encryptionKey) {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return this.decryptData(encrypted, encryptionKey);
  }
}
```

2. **מדיניות סיסמאות חזקה**:

```javascript
function checkPasswordStrength(password) {
  let strength = 0;
  
  // אורך
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // מורכבות
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  return {
    score: strength,
    isStrong: strength >= 4,
    feedback: getStrengthFeedback(strength)
  };
}

function getStrengthFeedback(strength) {
  switch(strength) {
    case 0:
    case 1: return "סיסמה חלשה מאוד";
    case 2: return "סיסמה חלשה";
    case 3: return "סיסמה בינונית";
    case 4:
    case 5: return "סיסמה חזקה";
    default: return "סיסמה חזקה מאוד";
  }
}
```

## המלצות לפיתוח עתידי (עם שרת)

### 1. אימות משתמשים

1. **שימוש ב-HTTPS**:
   - כל התקשורת עם השרת חייבת להיות מוצפנת באמצעות HTTPS
   - הגדרת HSTS (HTTP Strict Transport Security)

2. **הצפנת סיסמאות בשרת**:
   - שימוש באלגוריתמים כמו bcrypt, Argon2 או PBKDF2
   - שמירת salt ייחודי לכל משתמש

3. **אימות דו-שלבי (2FA)**:
   - הוספת אפשרות לאימות דו-שלבי באמצעות SMS או אפליקציה

4. **ניהול סשנים**:
   - שימוש בטוקנים מאובטחים (JWT)
   - הגדרת זמן תפוגה לטוקנים
   - אפשרות להתנתק מכל המכשירים

### 2. אבטחת API

1. **הגבלת קצב בקשות**:
   - הגבלת מספר הבקשות מכל IP
   - הגבלת מספר ניסיונות התחברות כושלים

2. **ולידציה של קלט**:
   - בדיקת כל הקלט בצד השרת
   - שימוש בספריות ולידציה מאובטחות

3. **הרשאות גישה**:
   - הגדרת מערכת הרשאות מפורטת
   - בדיקת הרשאות לכל פעולה

### 3. אבטחת נתונים

1. **הצפנת נתונים רגישים**:
   - הצפנת נתונים רגישים במסד הנתונים
   - שימוש במפתחות הצפנה מאובטחים

2. **גיבוי נתונים**:
   - גיבוי קבוע של כל הנתונים
   - בדיקת תקינות הגיבויים

3. **מדיניות שמירת נתונים**:
   - הגדרת זמן שמירה לכל סוג נתונים
   - מחיקה בטוחה של נתונים ישנים

### 4. הגנה מפני התקפות נפוצות

1. **XSS (Cross-Site Scripting)**:
   - סניטציה של כל קלט משתמש
   - הגדרת Content Security Policy (CSP)
   - שימוש ב-HttpOnly ו-Secure flags בעוגיות

2. **CSRF (Cross-Site Request Forgery)**:
   - שימוש בטוקנים CSRF
   - בדיקת מקור הבקשה (Origin/Referer)

3. **SQL Injection**:
   - שימוש בפרמטרים מוכנים (Prepared Statements)
   - הימנעות משאילתות דינמיות

4. **DDoS (Distributed Denial of Service)**:
   - שימוש בשירותי הגנה כמו Cloudflare
   - הגדרת מערכת ניטור וזיהוי התקפות

## רשימת בדיקות אבטחה

### צד לקוח (מצב נוכחי)

- [ ] ולידציה של כל קלט משתמש
- [ ] סניטציה של תוכן לפני הצגתו
- [ ] הצפנת סיסמאות (אפילו ב-localStorage)
- [ ] בדיקת חוזק סיסמאות
- [ ] הגבלת גישה לדפים מאובטחים
- [ ] הסרת מידע רגיש מקוד JavaScript
- [ ] הגנה מפני XSS

### צד שרת (לפיתוח עתידי)

- [ ] שימוש ב-HTTPS בלבד
- [ ] הצפנת סיסמאות בשרת
- [ ] ולידציה של כל קלט בצד השרת
- [ ] הגדרת מערכת הרשאות
- [ ] הגבלת קצב בקשות
- [ ] הגנה מפני CSRF
- [ ] הגנה מפני SQL Injection
- [ ] ניטור פעילות חשודה
- [ ] גיבוי נתונים קבוע

## סיכום

אבטחה היא תהליך מתמשך ולא מוצר מוגמר. יש לבצע בדיקות אבטחה באופן קבוע ולעדכן את האמצעים בהתאם לאיומים החדשים. למרות שהאתר הנוכחי פועל בצד הלקוח בלבד, חשוב ליישם אמצעי אבטחה בסיסיים כבר עכשיו ולתכנן את המעבר לפתרון מאובטח יותר בעתיד.