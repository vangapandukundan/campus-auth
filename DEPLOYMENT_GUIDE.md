# 🚀 Campus-Auth Deployment Guide (FREE)

## Overview
- **Backend**: Render (Free tier) - Node.js/Express
- **Frontend**: Vercel (Free) - React
- **Database**: MongoDB Atlas (Free tier)
- **Cost**: $0/month

---

## ✅ STEP 1: Setup MongoDB Atlas (FREE)

### Step 1.1: Create MongoDB Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Start free"
3. Sign up with email
4. Verify email

### Step 1.2: Create Free Cluster
1. Click "Create a Deployment"
2. Select **M0 Cluster (Free)**
3. Choose region closest to your users (e.g., us-east-1)
4. Click "Create Deployment"
5. Set username & password (save these!)

### Step 1.3: Get Connection String
1. Go to Clusters → Connect
2. Click "Drivers"
3. Copy connection string that looks like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/myapp?retryWrites=true&w=majority
   ```
4. Replace `username`, `password`, and `myapp` with your values

### Step 1.4: Whitelist IP (Important!)
1. Go to Security → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0) for testing
   - ⚠️ For production, use specific IPs only

---

## ✅ STEP 2: Deploy Backend to Render (FREE)

### Step 2.1: Push Code to GitHub
```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Campus Auth"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/campus-auth.git
git branch -M main
git push -u origin main
```

### Step 2.2: Deploy to Render
1. Go to https://render.com
2. Sign up (use GitHub for easier deployment)
3. Click "New +" → "Web Service"
4. Select your GitHub repo: `campus-auth`
5. **Configure:**
   - **Name**: `campus-auth-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/server.js`
   - **Plan**: `Free`

### Step 2.3: Add Environment Variables
Click "Advanced" and add:
```
MONGO_URI = mongodb+srv://YOUR_USER:YOUR_PASS@cluster.mongodb.net/campus-auth?retryWrites=true&w=majority
NODE_ENV = production
CLIENT_URL = https://YOUR_VERCEL_DOMAIN.vercel.app
RP_ID = YOUR_VERCEL_DOMAIN.vercel.app
RP_NAME = CampusAuth
JWT_SECRET = any-random-string-12345abcde (use a strong password)
PORT = 4000
```

### Step 2.4: Deploy
Click "Create Web Service" → Wait 3-5 minutes for deployment

✅ **Backend URL**: `https://campus-auth-backend.onrender.com`

---

## ✅ STEP 3: Deploy Frontend to Vercel (FREE)

### Step 3.1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub

### Step 3.2: Import Project
1. Click "Add New..." → "Project"
2. Select your GitHub repo: `campus-auth`
3. **Configure:**
   - **Root Directory**: `client`
   - **Framework Preset**: `Create React App`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### Step 3.3: Add Environment Variable
Click "Environment Variables" and add:
```
REACT_APP_API_URL = https://campus-auth-backend.onrender.com/api
```

### Step 3.4: Deploy
Click "Deploy" → Wait 2-3 minutes

✅ **Frontend URL**: `https://YOUR_PROJECT_NAME.vercel.app`

---

## ✅ STEP 4: Update Environment Variables (IMPORTANT!)

### Go back to Render Dashboard
1. Click on your backend service
2. Go to Environment
3. Update:
   ```
   CLIENT_URL = https://YOUR_PROJECT_NAME.vercel.app
   RP_ID = YOUR_PROJECT_NAME.vercel.app
   ```
4. Click "Save" → Service redeploys

---

## ✅ STEP 5: Test Your Deployment

### Test Backend
```
https://campus-auth-backend.onrender.com/
```
Should show: `{"message":"✅ Campus Auth Server Running"}`

### Test Frontend
Go to: `https://YOUR_PROJECT_NAME.vercel.app`

Should show the login page!

---

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong (not "password123")
- [ ] MongoDB whitelist is updated (or 0.0.0.0 for testing)
- [ ] CORS is configured correctly
- [ ] HTTPS is enabled (automatic)
- [ ] Sensitive data is in environment variables (.env), not in code

---

## ⚠️ Common Issues

### "Cannot connect to MongoDB"
- Check MONGO_URI is correct
- Check IP whitelist on MongoDB Atlas
- Wait 1-2 minutes for deployment

### "CORS Error"
- Go to Render → Environment
- Update `CLIENT_URL` with correct Vercel domain

### "API endpoint not found"
- Check `REACT_APP_API_URL` includes `/api` at the end
- Verify Render backend is running (check logs)

---

## 💰 Costs Summary

| Service | Plan | Cost |
|---------|------|------|
| MongoDB Atlas | M0 Cluster | Free |
| Render | Free Tier | Free |
| Vercel | Free Plan | Free |
| **TOTAL** | | **$0** |

**Limits:**
- Render free spins down after 15 min of inactivity (cold start)
- MongoDB: 512 MB storage, good for testing
- Vercel: 100 GB bandwidth/month

---

## 🚀 What's Next?

### If you want to upgrade later:
- Render: Upgrade to Starter Plan ($7/month)
- MongoDB: Upgrade to M2+ tier ($57/month)
- Vercel: Pro Plan ($20/month) - optional

### Add Custom Domain:
- Buy domain on Namecheap/GoDaddy
- Update DNS to point to Vercel
- Add domain to Render CORS settings
