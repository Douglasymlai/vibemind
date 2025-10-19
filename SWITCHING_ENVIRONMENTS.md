# Quick Reference: Switching Between Local and Production

## 🔄 Single File to Update

To switch between local development and production, edit **ONE FILE ONLY**:

**`/extension/config.js`**

---

## 🏭 Production Mode (Railway)

```javascript
const CONFIG = {
    API_BASE_URL: 'https://vibemind-production.up.railway.app/api',
    API_ROOT_URL: 'https://vibemind-production.up.railway.app',
    FRONTEND_URL: 'http://localhost:3000',
};
```

---

## 💻 Local Development Mode

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:8000/api',
    API_ROOT_URL: 'http://localhost:8000',
    FRONTEND_URL: 'http://localhost:3000',
};
```

---

## ⚡ After Changing Config

1. Save `config.js`
2. Go to `chrome://extensions/`
3. Click reload 🔄 on Vibe Mind extension
4. Done! ✅

---

## 📍 Current Status

**Currently configured for**: ✅ **PRODUCTION (Railway)**

Your extension is pointing to:
- `https://vibemind-production.up.railway.app`

---

## 🧪 Quick Test

After reloading extension:

1. Open any supported site (v0.dev, claude.ai, etc.)
2. Click Vibe Mind icon
3. Check connection status in sidepanel
4. Should show "Connected" if Railway backend is running

---

## 🚨 Remember

- Production backend is always running on Railway
- Local backend needs to be started manually: `./start_openai_backend.sh`
- Extension only connects to URL specified in `config.js`
