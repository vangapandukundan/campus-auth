# 🎓 Passwordless Campus Authentication

**Problem → Solution**: Campus environments traditionally rely on passwords, which cause credential‑reuse, phishing risks, and heavy administrative overhead. Students and staff often use low‑cost devices that lack secure password managers, making password‑based authentication fragile. **Campus‑Auth** eliminates passwords by leveraging built‑in biometric sensors (Windows Hello / Fingerprint) and a custom webcam‑based Face ID, combined with push‑code and TOTP fallbacks, delivering a seamless, secure, and device‑agnostic login experience.

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