# 🎓 Passwordless Campus Authentication

A seamless passwordless login system for campus applications.

## Features
- 🔑 Biometric login (Windows Hello / Face ID / Fingerprint)
- 📲 Push notification code authentication  
- 🔢 TOTP (Google Authenticator) support
- 🛡️ Zero passwords — ever
- 💻 Works on low-cost devices

## Tech Stack
- Frontend: React.js
- Backend: Node.js + Express
- Database: MongoDB
- Auth: WebAuthn (FIDO2) + TOTP + Push

## How to Run
```bash
# Terminal 1 - Server
cd server
npm install
npm run dev

# Terminal 2 - Client  
cd client
npm install
npm start
```

Open http://localhost:3000

VIDEO DEMO 

https://drive.google.com/file/d/1Xi9Aeteku7f3ks_zzYF3TD3a9goRSNtk/view?usp=sharing
