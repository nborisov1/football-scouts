# מדריך פריסה - פוטבול סקאוטינג

מסמך זה מפרט את השלבים הנדרשים לפריסת האתר לסביבת ייצור.

## הכנה לפריסה

### 1. אופטימיזציה של קבצים

#### קבצי JavaScript
- [ ] מינימיזציה של כל קבצי JavaScript
- [ ] איחוד קבצי JavaScript לפי קטגוריות (כללי, אימות, אתגרים וכו')
- [ ] הוספת גרסה לקבצים (למשל `main.min.js?v=1.0.0`)

```bash
# דוגמה לשימוש ב-Terser לדחיסת קבצי JavaScript
npm install -g terser
terser js/main.js -o js/main.min.js -c -m
```

#### קבצי CSS
- [ ] מינימיזציה של כל קבצי CSS
- [ ] איחוד קבצי CSS לפי קטגוריות (כללי, אתגרים, פרופיל וכו')
- [ ] הוספת גרסה לקבצים (למשל `main.min.css?v=1.0.0`)

```bash
# דוגמה לשימוש ב-CleanCSS לדחיסת קבצי CSS
npm install -g clean-css-cli
cleancss -o css/main.min.css css/main.css
```

#### תמונות
- [ ] דחיסת כל התמונות
- [ ] המרת תמונות ל-WebP במידת האפשר
- [ ] יצירת גרסאות שונות לתמונות גדולות (עבור מכשירים שונים)

```bash
# דוגמה לשימוש ב-ImageMagick לדחיסת תמונות
convert image.jpg -quality 85% image_optimized.jpg

# דוגמה להמרה ל-WebP
cwebp -q 80 image.jpg -o image.webp
```

### 2. עדכון קישורים

- [ ] עדכון כל הקישורים לקבצי JavaScript לגרסאות המדוחסות
- [ ] עדכון כל הקישורים לקבצי CSS לגרסאות המדוחסות
- [ ] וידוא שכל הקישורים הפנימיים תקינים
- [ ] וידוא שכל הקישורים החיצוניים תקינים

### 3. הגדרות אבטחה

- [ ] הוספת מדיניות Content Security Policy (CSP)
- [ ] הוספת כותרות אבטחה נוספות (X-Content-Type-Options, X-Frame-Options וכו')
- [ ] וידוא שאין מידע רגיש בקוד (מפתחות API, סיסמאות וכו')

## פריסה לשרת

### 1. בחירת שרת אירוח

אפשרויות מומלצות:
- **שרת סטטי**: Netlify, GitHub Pages, Vercel
- **שרת דינמי**: DigitalOcean, AWS, Heroku

### 2. הגדרת דומיין

- [ ] רכישת דומיין (אם עדיין לא קיים)
- [ ] הגדרת רשומות DNS
- [ ] הגדרת SSL/TLS (HTTPS)

### 3. העלאת קבצים

#### אפשרות 1: FTP/SFTP
```bash
# דוגמה לשימוש ב-SFTP
sftp username@your-server.com
cd /path/to/website
put -r *
```

#### אפשרות 2: Git
```bash
# דוגמה לשימוש ב-Git
git init
git add .
git commit -m "Initial deployment"
git remote add origin your-repository-url
git push -u origin master
```

#### אפשרות 3: CLI של ספק האירוח
```bash
# דוגמה לשימוש ב-Netlify CLI
npm install -g netlify-cli
netlify deploy --prod
```

### 4. הגדרת שרת

#### הגדרת NGINX (אם רלוונטי)
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # הפניה ל-HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /path/to/website;
    index index.html;
    
    # הגדרות קאש
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
    
    # הגדרות אבטחה
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self';";
    
    # טיפול בשגיאות
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

#### הגדרת Apache (אם רלוונטי)
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    # הפניה ל-HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    ServerAlias www.yourdomain.com
    
    DocumentRoot /path/to/website
    
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # הגדרות קאש
    <FilesMatch "\.(css|js|jpg|jpeg|png|gif|ico|svg|webp)$">
        Header set Cache-Control "max-age=2592000, public"
    </FilesMatch>
    
    # הגדרות אבטחה
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self';"
    
    # טיפול בשגיאות
    ErrorDocument 404 /404.html
    ErrorDocument 500 /50x.html
    ErrorDocument 502 /50x.html
    ErrorDocument 503 /50x.html
    ErrorDocument 504 /50x.html
</VirtualHost>
```

## בדיקות לאחר פריסה

- [ ] בדיקת תקינות כל הדפים
- [ ] בדיקת תקינות כל הפונקציונליות
- [ ] בדיקת זמני טעינה
- [ ] בדיקת תאימות לדפדפנים שונים
- [ ] בדיקת תאימות למכשירים שונים
- [ ] בדיקת תקינות SSL/TLS
- [ ] בדיקת ביצועים באמצעות Google PageSpeed Insights
- [ ] בדיקת SEO באמצעות כלים כמו Lighthouse

## ניטור ותחזוקה

### 1. הגדרת כלי ניטור

- [ ] הגדרת Google Analytics או כלי ניטור אחר
- [ ] הגדרת התראות על שגיאות (למשל באמצעות Sentry)
- [ ] הגדרת ניטור זמינות (למשל באמצעות UptimeRobot)

### 2. גיבוי

- [ ] הגדרת גיבוי אוטומטי של האתר
- [ ] בדיקת תקינות הגיבוי באופן תקופתי

### 3. עדכונים

- [ ] תכנון לוח זמנים לעדכונים תקופתיים
- [ ] הגדרת תהליך לפריסת עדכונים

## הערות נוספות

- יש לתעד את כל השינויים שנעשו במהלך הפריסה
- יש לשמור על גרסאות קודמות של האתר למקרה של בעיות
- יש לבדוק את האתר באופן תקופתי לוודא שהכל עובד כראוי