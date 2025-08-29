# המלצות נגישות - פוטבול סקאוטינג

מסמך זה מפרט המלצות לשיפור הנגישות של אתר פוטבול סקאוטינג בהתאם לתקן WCAG 2.1 ברמה AA.

## עקרונות בסיסיים

### 1. תפיסה (Perceivable)
המידע וממשק המשתמש חייבים להיות מוצגים באופן שהמשתמשים יכולים לתפוס.

### 2. תפעוליות (Operable)
רכיבי הממשק וניווט חייבים להיות תפעוליים.

### 3. הבנה (Understandable)
המידע ותפעול ממשק המשתמש חייבים להיות מובנים.

### 4. יציבות (Robust)
התוכן חייב להיות יציב מספיק כדי שניתן יהיה לפרש אותו באופן אמין על ידי מגוון רחב של סוכני משתמש, כולל טכנולוגיות מסייעות.

## HTML סמנטי

### 1. שימוש בתגים סמנטיים

```html
<!-- לא טוב -->
<div class="header">
  <div class="logo">פוטבול סקאוטינג</div>
  <div class="nav">
    <div class="nav-item">דף הבית</div>
    <div class="nav-item">אתגרים</div>
  </div>
</div>

<!-- טוב -->
<header>
  <h1>פוטבול סקאוטינג</h1>
  <nav>
    <ul>
      <li><a href="index.html">דף הבית</a></li>
      <li><a href="challenges.html">אתגרים</a></li>
    </ul>
  </nav>
</header>
```

### 2. מבנה כותרות הגיוני

```html
<h1>פוטבול סקאוטינג</h1>
<section>
  <h2>אתגרים</h2>
  <article>
    <h3>אתגר בעיטות חופשיות</h3>
    <p>תיאור האתגר...</p>
  </article>
  <article>
    <h3>אתגר כדרור</h3>
    <p>תיאור האתגר...</p>
  </article>
</section>
<section>
  <h2>תוכניות אימון</h2>
  <article>
    <h3>תוכנית למתחילים</h3>
    <p>תיאור התוכנית...</p>
  </article>
</section>
```

### 3. שימוש ב-ARIA כשנדרש

```html
<!-- תפריט נפתח עם ARIA -->
<div class="dropdown">
  <button aria-haspopup="true" aria-expanded="false" aria-controls="dropdown-menu">
    תפריט
  </button>
  <ul id="dropdown-menu" role="menu" aria-hidden="true">
    <li role="menuitem"><a href="#">אפשרות 1</a></li>
    <li role="menuitem"><a href="#">אפשרות 2</a></li>
  </ul>
</div>

<script>
  const button = document.querySelector('.dropdown button');
  const menu = document.getElementById('dropdown-menu');
  
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', !expanded);
    menu.setAttribute('aria-hidden', expanded);
  });
</script>
```

## תמונות נגישות

### 1. תגי alt לכל התמונות

```html
<!-- תמונה אינפורמטיבית -->
<img src="football-technique.jpg" alt="טכניקת בעיטה נכונה: עמידה יציבה עם רגל תומכת ליד הכדור">

<!-- תמונה דקורטיבית -->
<img src="decorative-pattern.jpg" alt="">

<!-- תמונה מורכבת עם תיאור ארוך -->
<img src="training-diagram.jpg" alt="תרשים אימון" aria-describedby="diagram-desc">
<div id="diagram-desc" class="sr-only">
  תרשים מפורט של תרגיל אימון הכולל חמש תחנות: התחלה בקונוס הכחול, כדרור בין קונוסים, מסירה לשחקן בצד, ריצה למרכז וקבלת מסירה חזרה, וסיום בבעיטה לשער.
</div>
```

### 2. SVG נגיש

```html
<svg role="img" aria-labelledby="icon-title">
  <title id="icon-title">אייקון אתגר</title>
  <!-- תוכן ה-SVG -->
</svg>
```

## צבעים וניגודיות

### 1. ניגודיות צבעים מספקת

```css
/* לא טוב - ניגודיות נמוכה */
.text {
  color: #777;
  background-color: #eee;
}

/* טוב - ניגודיות גבוהה */
.text {
  color: #333;
  background-color: #fff;
}
```

### 2. אי-הסתמכות על צבע בלבד

```html
<!-- לא טוב - הסתמכות על צבע בלבד -->
<p>השדות המסומנים באדום הם חובה.</p>

<!-- טוב - שימוש בסמל וצבע -->
<p>השדות המסומנים באדום ומסומנים בכוכבית (*) הם חובה.</p>

<!-- טופס עם סימון ויזואלי וטקסטואלי -->
<label for="name">שם <span class="required" aria-hidden="true">*</span><span class="sr-only">(חובה)</span></label>
<input type="text" id="name" required>
```

### 3. מצב מנוגד (Dark Mode)

```css
/* הגדרת משתני צבע בסיסיים */
:root {
  --text-color: #333;
  --background-color: #fff;
  --primary-color: #1a73e8;
}

/* מצב מנוגד */
@media (prefers-color-scheme: dark) {
  :root {
    --text-color: #eee;
    --background-color: #121212;
    --primary-color: #4dabf7;
  }
}

body {
  color: var(--text-color);
  background-color: var(--background-color);
}

a {
  color: var(--primary-color);
}
```

## טפסים נגישים

### 1. תוויות (Labels) לכל השדות

```html
<!-- לא טוב -->
<input type="text" placeholder="שם משתמש">

<!-- טוב -->
<label for="username">שם משתמש</label>
<input type="text" id="username" name="username">
```

### 2. הודעות שגיאה נגישות

```html
<div class="form-group">
  <label for="email">אימייל</label>
  <input type="email" id="email" name="email" aria-describedby="email-error" aria-invalid="true">
  <div id="email-error" class="error" role="alert">נא להזין כתובת אימייל תקינה</div>
</div>

<script>
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('email-error');
  
  emailInput.addEventListener('input', () => {
    const isValid = emailInput.validity.valid;
    emailInput.setAttribute('aria-invalid', !isValid);
    emailError.style.display = isValid ? 'none' : 'block';
  });
</script>
```

### 3. קיבוץ שדות קשורים

```html
<fieldset>
  <legend>פרטים אישיים</legend>
  
  <div class="form-group">
    <label for="first-name">שם פרטי</label>
    <input type="text" id="first-name" name="first-name">
  </div>
  
  <div class="form-group">
    <label for="last-name">שם משפחה</label>
    <input type="text" id="last-name" name="last-name">
  </div>
</fieldset>

<fieldset>
  <legend>העדפות</legend>
  
  <div class="form-group">
    <input type="checkbox" id="newsletter" name="newsletter">
    <label for="newsletter">הרשמה לניוזלטר</label>
  </div>
</fieldset>
```

## ניווט במקלדת

### 1. סדר טאב הגיוני

```html
<!-- סדר טאב הגיוני -->
<header>
  <a href="#main" class="skip-link">דלג לתוכן הראשי</a>
  <nav>
    <!-- תפריט ניווט -->
  </nav>
</header>

<main id="main" tabindex="-1">
  <!-- תוכן ראשי -->
</main>
```

### 2. מיקוד נראה לעין

```css
/* סגנון מיקוד ברור */
:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* סגנון מיקוד מותאם לרכיבים שונים */
.button:focus {
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.5);
  outline: none;
}
```

### 3. קיצורי מקלדת

```html
<button aria-keyshortcuts="Alt+S" onclick="saveForm()">שמור</button>

<script>
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 's') {
      e.preventDefault();
      saveForm();
    }
  });
  
  function saveForm() {
    // פעולת שמירה
  }
</script>
```

## תוכן דינמי

### 1. עדכונים דינמיים

```html
<div class="notification" role="alert" aria-live="polite"></div>

<script>
  function showNotification(message) {
    const notification = document.querySelector('.notification');
    notification.textContent = message;
    
    // הסרה אוטומטית לאחר 5 שניות
    setTimeout(() => {
      notification.textContent = '';
    }, 5000);
  }
</script>
```

### 2. דיאלוגים נגישים

```html
<button aria-haspopup="dialog" aria-expanded="false" onclick="openDialog()">פתח דיאלוג</button>

<div id="dialog" role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-desc" aria-modal="true" hidden>
  <h2 id="dialog-title">כותרת הדיאלוג</h2>
  <p id="dialog-desc">תיאור הדיאלוג והסבר על מטרתו.</p>
  
  <div class="dialog-content">
    <!-- תוכן הדיאלוג -->
  </div>
  
  <div class="dialog-actions">
    <button onclick="closeDialog()">סגור</button>
    <button onclick="confirmDialog()">אישור</button>
  </div>
</div>

<script>
  const dialog = document.getElementById('dialog');
  const openButton = document.querySelector('button[aria-haspopup="dialog"]');
  
  function openDialog() {
    dialog.hidden = false;
    openButton.setAttribute('aria-expanded', 'true');
    
    // שמירת האלמנט האחרון שהיה במיקוד
    dialog.previousFocus = document.activeElement;
    
    // מיקוד על הדיאלוג
    const firstFocusable = dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    // לכידת מיקוד בתוך הדיאלוג
    dialog.addEventListener('keydown', trapFocus);
  }
  
  function closeDialog() {
    dialog.hidden = true;
    openButton.setAttribute('aria-expanded', 'false');
    
    // החזרת המיקוד לאלמנט הקודם
    if (dialog.previousFocus) {
      dialog.previousFocus.focus();
    }
    
    // הסרת לכידת המיקוד
    dialog.removeEventListener('keydown', trapFocus);
  }
  
  function trapFocus(e) {
    if (e.key === 'Escape') {
      closeDialog();
      return;
    }
    
    if (e.key !== 'Tab') return;
    
    const focusableElements = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
</script>
```

## תמיכה במכשירי מגע

### 1. אזורי לחיצה גדולים מספיק

```css
/* אזורי לחיצה גדולים מספיק למכשירי מגע */
.button, .nav-link, .card-clickable {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 16px;
}

/* הגדלת מרווחים בין אלמנטים לחיצים */
.nav-links li {
  margin: 0 8px;
}
```

### 2. תמיכה במחוות מגע

```javascript
// תמיכה בסוויפ בסליידר
const slider = document.querySelector('.slider');
let startX, endX;

slider.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

slider.addEventListener('touchend', (e) => {
  endX = e.changedTouches[0].clientX;
  handleSwipe();
});

function handleSwipe() {
  const threshold = 50;
  const diff = startX - endX;
  
  if (Math.abs(diff) < threshold) return;
  
  if (diff > 0) {
    // סוויפ שמאלה - הבא
    nextSlide();
  } else {
    // סוויפ ימינה - הקודם
    prevSlide();
  }
}
```

## תמיכה בקוראי מסך

### 1. טקסט חבוי לקוראי מסך

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

```html
<button class="icon-button">
  <img src="icons/edit.svg" alt="">
  <span class="sr-only">ערוך פרופיל</span>
</button>
```

### 2. דילוג על תוכן חוזר

```html
<a href="#main" class="skip-link">דלג לתוכן הראשי</a>

<header>
  <!-- תפריט ניווט -->
</header>

<main id="main" tabindex="-1">
  <!-- תוכן ראשי -->
</main>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px;
  background-color: var(--primary-color);
  color: white;
  z-index: 100;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 0;
}
```

### 3. תיאור אלמנטים מורכבים

```html
<!-- תרשים עם תיאור מפורט -->
<figure>
  <img src="chart.png" alt="תרשים התקדמות" aria-describedby="chart-desc">
  <figcaption id="chart-desc">
    תרשים זה מציג את ההתקדמות שלך בשלושת החודשים האחרונים. ניתן לראות עלייה של 25% בחודש הראשון, 15% בחודש השני, ו-30% בחודש השלישי.
  </figcaption>
</figure>
```

## תמיכה בשפה עברית ו-RTL

### 1. הגדרת כיוון ושפה

```html
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>פוטבול סקאוטינג</title>
</head>
<body>
  <!-- תוכן האתר -->
</body>
</html>
```

### 2. CSS לוגי לתמיכה ב-RTL

```css
/* שימוש במאפייני CSS לוגיים */
.element {
  margin-inline-start: 1rem;
  padding-inline-end: 2rem;
  border-inline-start: 1px solid #ccc;
}

/* מיקום אלמנטים */
.icon {
  inset-inline-start: 1rem;
}
```

### 3. טיפול בתוכן מעורב (עברית ואנגלית)

```html
<p>שמי <span lang="en" dir="ltr">John Smith</span> ואני שחקן כדורגל.</p>

<p>הקבוצה שלי זכתה בגביע ה-<span lang="en" dir="ltr">Champions League</span> בשנה שעברה.</p>
```

## בדיקות נגישות

### 1. כלים אוטומטיים

- [WAVE](https://wave.webaim.org/) - כלי לבדיקת נגישות
- [Axe](https://www.deque.com/axe/) - כלי לבדיקת נגישות
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - כלי לבדיקת ביצועים ונגישות

### 2. בדיקות ידניות

- ניווט באמצעות מקלדת בלבד
- בדיקה עם קוראי מסך (NVDA, VoiceOver)
- בדיקה עם הגדלת טקסט (200%)
- בדיקה במצב ניגודיות גבוהה

### 3. רשימת בדיקות נגישות

- [ ] כל התמונות כוללות תיאורי alt מתאימים
- [ ] מבנה כותרות הגיוני (h1, h2, h3, וכו')
- [ ] ניתן לנווט בכל האתר באמצעות מקלדת בלבד
- [ ] מיקוד נראה לעין בכל האלמנטים האינטראקטיביים
- [ ] ניגודיות צבעים מספקת (יחס של לפחות 4.5:1 לטקסט רגיל, 3:1 לטקסט גדול)
- [ ] לא נעשה שימוש בצבע בלבד להעברת מידע
- [ ] כל הטפסים כוללים תוויות (labels) מקושרות
- [ ] הודעות שגיאה מוצגות באופן נגיש
- [ ] תוכן דינמי מוכרז לקוראי מסך
- [ ] דיאלוגים ותפריטים נגישים למקלדת ולקוראי מסך
- [ ] אזורי לחיצה גדולים מספיק למכשירי מגע
- [ ] קיימת אפשרות לדלג על תוכן חוזר
- [ ] האתר נבדק עם קוראי מסך
- [ ] האתר נבדק במצב ניגודיות גבוהה
- [ ] האתר נבדק עם הגדלת טקסט (200%)

## סיכום

נגישות היא חלק בלתי נפרד מפיתוח אתרים איכותי. יישום ההמלצות במסמך זה יסייע לא רק למשתמשים עם מוגבלויות, אלא ישפר את חוויית המשתמש עבור כל המשתמשים. חשוב לשלב שיקולי נגישות מתחילת תהליך הפיתוח ולא כתוספת בסוף.