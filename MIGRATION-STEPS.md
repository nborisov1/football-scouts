# Firebase Migration: videos → challenges

## Steps to run the migration:

### 1. Download Firebase Service Account Key

1. Go to **Firebase Console** → Your Project
2. Click **⚙️ Project Settings** → **Service Accounts** tab
3. Click **"Generate new private key"**
4. Download the JSON file 
5. **Rename it to:** `firebase-service-account-key.json`
6. **Put it in your project root** (same folder as package.json)

### 2. Run the Migration

```bash
cd /Users/lielcohen/Downloads/football-scouts
node migrate-videos-to-challenges.js
```

### 3. What the script does:

1. **Copies all documents** from `videos` collection to `challenges` collection
2. **Adds migration metadata** (migratedFrom, migratedAt, originalId)
3. **Deletes the old** `videos` collection 
4. **Verifies** the migration was successful

### 4. After migration:

1. **Delete the script:** `rm migrate-videos-to-challenges.js`
2. **Delete the service key:** `rm firebase-service-account-key.json` (for security)
3. **Your app will now use** the `challenges` collection instead of `videos`

### 5. If something goes wrong:

- The script includes detailed logging
- Original data is preserved with `originalId` field
- You can restore if needed

## ⚠️ Important:

- **Make sure you have a backup** of your Firebase data first
- **Don't run this script twice** - it will duplicate data
- **Keep the service account key secure** and delete it after migration
