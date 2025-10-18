# Railway Deployment Guide for Vibe Mind

## 🎉 Deployment Complete!

Your Vibe Mind backend has been successfully deployed to Railway.

### **Production URL**
```
https://vibemind-production.up.railway.app
```

---

## 📦 What Was Deployed

### Backend (OpenAI folder)
- **FastAPI server** running on Railway
- **Python 3.x runtime** with all dependencies
- **Environment variable**: `OPENAI_API_KEY` configured in Railway
- **Auto-scaling**: Enabled via Railway

### Files Created/Modified

#### New Configuration Files (in `openai/`)
1. **Procfile** - Tells Railway how to start the server
2. **railway.json** - Railway deployment configuration
3. **.railwayignore** - Excludes unnecessary files from deployment

#### Extension Updates (in `extension/`)
1. **config.js** ⭐ - **Central configuration file** (NEW)
   - Contains all API URLs
   - Easy to update for different environments
   
2. **manifest.json** - Updated with:
   - Railway URL in host_permissions
   - config.js in web_accessible_resources
   
3. **background.js** - Uses config.js for API calls
4. **sidepanel.js** - Uses config.js for API calls
5. **content.js** - Uses config.js for API calls
6. **sidepanel.html** - Loads config.js

---

## 🔧 Configuration Management

### **To Update API URLs** (Development vs Production)

Edit `/extension/config.js`:

```javascript
const CONFIG = {
    // Production (current)
    API_BASE_URL: 'https://vibemind-production.up.railway.app/api',
    API_ROOT_URL: 'https://vibemind-production.up.railway.app',
    FRONTEND_URL: 'http://localhost:3000',
    
    // For local development, comment out above and uncomment below:
    // API_BASE_URL: 'http://localhost:8000/api',
    // API_ROOT_URL: 'http://localhost:8000',
    // FRONTEND_URL: 'http://localhost:3000',
};
```

**That's it!** All extension files now reference this central config.

---

## 🚀 Railway Commands Reference

### Deploy & Monitor
```bash
# Deploy from local directory
railway up

# View live logs
railway logs

# Check deployment status
railway status

# Open Railway dashboard
railway open
```

### Environment Variables
```bash
# Set environment variable
railway variables set KEY=value

# List all variables
railway variables

# Delete a variable
railway variables delete KEY
```

### Domain Management
```bash
# Get current domain
railway domain

# Generate new domain (if needed)
railway domain
```

---

## 🔐 Environment Variables

Current Railway environment variables:
- `OPENAI_API_KEY` - Your OpenAI API key (set in Railway)
- `PORT` - Automatically set by Railway (dynamic)

---

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://vibemind-production.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-12T...",
  "profiles_loaded": 1,
  "platforms_available": 3,
  "openai_configured": true
}
```

### 2. Test API Root
```bash
curl https://vibemind-production.up.railway.app/
```

### 3. Test with Extension
1. Load the extension in Chrome
2. Open sidepanel
3. Enter your OpenAI API key
4. Try analyzing text or image

---

## 📝 Next Steps

### 1. Reload Extension
After updating the extension files:
1. Go to `chrome://extensions/`
2. Find "Vibe Mind"
3. Click the **reload** button 🔄

### 2. Test Production Endpoint
Try using the extension on any supported site:
- v0.dev
- magicpattern.design
- lovable.dev
- claude.ai
- etc.

### 3. Monitor Usage
Check Railway dashboard for:
- Request volume
- Response times
- Error rates
- Resource usage

---

## 💰 Cost Management

### Railway Free Tier
- **$5 credit/month** included
- Covers moderate usage
- ~500 hours of runtime

### Monitor Usage
```bash
# Check current usage
railway status

# View metrics in dashboard
railway open
```

### Cost Optimization Tips
1. Backend only runs when receiving requests
2. No idle costs (serverless-like behavior)
3. Monitor in Railway dashboard
4. Set up billing alerts in Railway settings

---

## 🔄 Deployment Workflow

### For Future Updates

#### Option 1: CLI (Fastest)
```bash
cd openai
railway up
```

#### Option 2: GitHub Integration (Recommended for Production)
1. Push changes to GitHub
2. Connect Railway to your repo
3. Enable auto-deploy on push

To set up GitHub integration:
```bash
# In Railway dashboard
1. Go to Settings
2. Connect to GitHub repo
3. Set root directory: openai
4. Enable auto-deploy
```

---

## 🛠️ Troubleshooting

### Extension Can't Connect
1. Check Railway deployment status: `railway status`
2. Check logs: `railway logs`
3. Verify OPENAI_API_KEY is set: `railway variables`
4. Check CORS in api_server.py includes `chrome-extension://*`

### Railway Deployment Fails
1. Check build logs: `railway logs`
2. Verify requirements.txt is correct
3. Check Python version compatibility
4. Ensure Procfile syntax is correct

### API Key Issues
1. Verify key is set in Railway: `railway variables`
2. Check key is valid in OpenAI dashboard
3. Test with curl using the key directly

---

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
- [FastAPI on Railway](https://docs.railway.app/guides/fastapi)

---

## 🎯 Summary

✅ Backend deployed to Railway  
✅ Environment variables configured  
✅ Extension updated to use production URL  
✅ Central config file created for easy updates  
✅ CORS configured for Chrome extension  
✅ Health check endpoint working  

**Your Vibe Mind extension is now ready to use with the production backend!** 🚀

---

## 📞 Support

For Railway issues:
- Railway Discord: https://discord.gg/railway
- Railway Support: support@railway.app

For deployment questions:
- Check Railway logs: `railway logs`
- Review deployment settings: `railway open`
