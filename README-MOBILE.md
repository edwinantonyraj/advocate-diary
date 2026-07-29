# Advocate Diary → Android App: Step-by-Step

Your app is a **web app** (React + Express backend that calls Gemini AI).
To turn it into an installable Android app, you need two things:

1. **A live backend** — because the AI drafting, legal brief, and import
   features call your server, which needs your `GEMINI_API_KEY`.
2. **A native shell (Capacitor)** that opens that live app inside an
   installable Android app, so it behaves like a real app (icon, no browser
   bar, camera access, etc).

I've already added the Capacitor config and a GitHub Actions workflow that
builds the APK automatically. You just need to do the two steps below.

---

## Step 1 — Host the backend (free, ~10 minutes)

We'll use **Render.com** (free tier, no credit card needed for this use case).

1. Go to https://render.com and sign up (you can use your GitHub account).
2. First, push this project folder to a **new GitHub repository**:
   ```bash
   cd advocate-diary
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/advocate-diary.git
   git push -u origin main
   ```
3. In Render, click **New +** → **Web Service** → connect the GitHub repo you
   just created.
4. Configure it:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:** add `GEMINI_API_KEY` = *your Gemini API key*
     (get one free at https://aistudio.google.com/apikey if you don't have
     one)
5. Click **Create Web Service**. Render will give you a URL like:
   `https://advocate-diary.onrender.com`
6. Visit that URL in your browser to confirm the app loads.

   > Note: Render's free tier "sleeps" after inactivity and takes ~30-50
   > seconds to wake up on the first request. Fine for personal/small use;
   > upgrade to a paid instance later if that delay is a problem.

---

## Step 2 — Point the app at your live URL

1. Open `capacitor.config.ts` in the project.
2. Replace:
   ```ts
   const DEPLOYED_APP_URL = 'https://REPLACE-WITH-YOUR-DEPLOYED-URL.onrender.com';
   ```
   with your real Render URL from Step 1.
3. Commit and push that change:
   ```bash
   git add capacitor.config.ts
   git commit -m "Point app at deployed backend"
   git push
   ```

---

## Step 3 — Build the APK automatically (GitHub Actions)

Pushing to `main` automatically triggers the included workflow
(`.github/workflows/build-android.yml`), which builds the Android APK on
GitHub's servers — you don't need Android Studio installed.

1. Go to your repo on GitHub → **Actions** tab.
2. You'll see a "Build Android APK" run in progress (or click **Run
   workflow** to trigger it manually).
3. When it finishes (a few minutes), open the run → scroll to **Artifacts**
   → download `advocate-diary-debug-apk`.
4. Unzip it — you'll have `app-debug.apk`.

---

## Step 4 — Install it on your phone

1. Transfer `app-debug.apk` to your Android phone (email it to yourself,
   Google Drive, USB, etc).
2. Open the file on your phone. Android will ask you to allow installs from
   this source the first time — allow it.
3. Tap **Install**. The "Advocate Diary" app icon will appear on your home
   screen.

This is a **debug build**, which is fine for personal use or testing. If you
ever want to publish it on the Google Play Store, that build needs to be
signed with a release key and go through Play Console — a separate step I
can help with when you're ready.

---

## About the camera feature

The app requests camera access for document scanning. Capacitor's WebView
supports the browser's camera APIs out of the box, so this should keep
working inside the app. If you run into camera permission issues once it's
installed, let me know — there's a small native permissions tweak
(`AndroidManifest.xml`) I can add.

---

## If anything in this process errors out

Copy the exact error message from the GitHub Actions log or Render build log
and share it with me — I can update the workflow or config files directly.
