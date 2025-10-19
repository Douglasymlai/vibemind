# Pre-Publication Checklist - Vibe Mind Chrome Extension

## 🎯 Quick Action Items

Use this checklist to prepare for Chrome Web Store publication.

---

## ✅ Phase 1: Clean Up Extension (30 minutes)

### Remove Development Files
- [ ] Remove `INSTALLATION.md` from extension folder (keep in root for GitHub)
- [ ] Remove `TROUBLESHOOTING.md` from extension folder (keep in root)
- [ ] Remove `SWITCHING_ENVIRONMENTS.md` from extension folder
- [ ] Remove `reload-extension.js` (development only)
- [ ] Keep only production-necessary files

### Update config.js
- [ ] Open `/extension/config.js`
- [ ] Remove or comment out localhost URLs
- [ ] Keep only production Railway URL
- [ ] Remove FRONTEND_URL if not using deployed frontend

**Updated config.js should look like:**
```javascript
const CONFIG = {
    API_BASE_URL: 'https://vibemind-production.up.railway.app/api',
    API_ROOT_URL: 'https://vibemind-production.up.railway.app',
};
```

### Update manifest.json
- [ ] Open `/extension/manifest.json`
- [ ] Remove `"http://localhost:8000/*"` from host_permissions
- [ ] Verify version is `"1.0.0"`
- [ ] Double-check all permissions are needed

**Clean host_permissions:**
```json
"host_permissions": [
    "https://vibemind-production.up.railway.app/*",
    "https://api.openai.com/*"
]
```

---

## ✅ Phase 2: Create Required Documents (2 hours)

### Privacy Policy
- [ ] Copy `/PRIVACY_POLICY.md` content
- [ ] Update `[YOUR EMAIL HERE]` with your real email
- [ ] Update `[YOUR SUPPORT EMAIL/LINK]` with support contact
- [ ] Host privacy policy publicly:
  
**Option A: GitHub Pages (Recommended)**
```bash
# Enable GitHub Pages on your repo
# Privacy policy will be at: https://douglasymlai.github.io/vibemind/PRIVACY_POLICY
```

**Option B: Add to Railway Backend**
```python
# Add to api_server.py
@app.get("/privacy")
async def privacy_policy():
    return FileResponse("PRIVACY_POLICY.md")
```

- [ ] Test privacy policy URL is accessible
- [ ] Copy final URL for Chrome Web Store listing

### Store Listing Copy
- [ ] Review `/STORE_LISTING.md`
- [ ] Customize description if needed
- [ ] Update support email/links
- [ ] Verify all URLs are correct

---

## ✅ Phase 3: Create Visual Assets (3 hours)

### Screenshots (Required - minimum 1, recommended 5)

**Screenshot 1: Extension in Action** ⭐ REQUIRED
- [ ] Open extension on V0.dev or Claude.ai
- [ ] Show sidepanel with a prompt being enhanced
- [ ] Capture at 1280x800 or 640x400
- [ ] Save as `screenshot-1-extension-in-action.png`

**Screenshot 2: Image Analysis**
- [ ] Upload a UI screenshot
- [ ] Show the analysis result
- [ ] Capture clear, readable result
- [ ] Save as `screenshot-2-image-analysis.png`

**Screenshot 3: Supported Platforms**
- [ ] Create a visual showing platform icons
- [ ] Include V0, Claude, ChatGPT, Magic Pattern, Lovable
- [ ] Save as `screenshot-3-platforms.png`

**Screenshot 4: Before/After**
- [ ] Show a basic prompt
- [ ] Show the enhanced version
- [ ] Highlight the improvement
- [ ] Save as `screenshot-4-before-after.png`

**Screenshot 5: Settings/API Key**
- [ ] Show the sidepanel settings
- [ ] Show API key input (blur the actual key!)
- [ ] Save as `screenshot-5-settings.png`

### Icon Verification
- [ ] Verify `/extension/icons/icon-128.png` exists
- [ ] Verify it's exactly 128x128 pixels
- [ ] Verify it looks good (will be shown in store)

### Promotional Images (Optional but recommended)

**Small Tile (440x280)**
- [ ] Create with Canva, Figma, or Photoshop
- [ ] Include extension icon
- [ ] Add "Vibe Mind - AI Prompt Enhancer" text
- [ ] Save as `promo-small-tile-440x280.png`

**Large Tile (920x680)**
- [ ] Create larger promotional image
- [ ] Include key features
- [ ] Save as `promo-large-tile-920x680.png`

---

## ✅ Phase 4: Testing (1 hour)

### Functional Testing
- [ ] Clear extension data completely
- [ ] Test fresh install flow
- [ ] Test on V0.dev
- [ ] Test on Claude.ai
- [ ] Test on ChatGPT
- [ ] Test image upload
- [ ] Test text enhancement
- [ ] Test context menu
- [ ] Test clipboard copy
- [ ] Test with fresh API key
- [ ] Test in incognito mode

### Error Handling
- [ ] Test with invalid API key
- [ ] Test with no API key
- [ ] Test with network offline
- [ ] Verify error messages are user-friendly

### Performance
- [ ] Test cold start (first use after install)
- [ ] Test response time
- [ ] Check Railway backend is responding
- [ ] Verify no console errors

---

## ✅ Phase 5: Package Extension (15 minutes)

### Create Clean Extension Folder
```bash
# Create a clean copy for submission
cd /Users/zoeyzuo/Documents/personal/side-projects/vibemind
mkdir extension-clean
cp -r extension/* extension-clean/

# Remove development files
cd extension-clean
rm INSTALLATION.md TROUBLESHOOTING.md SWITCHING_ENVIRONMENTS.md reload-extension.js

# Verify contents
ls -la
```

### Files that should be included:
- [ ] manifest.json
- [ ] config.js
- [ ] background.js
- [ ] content.js
- [ ] content.css
- [ ] sidepanel.html
- [ ] sidepanel.js
- [ ] sidepanel.css
- [ ] offscreen.html
- [ ] lottie.min.js
- [ ] icons/ folder (with all 4 icon sizes)
- [ ] public/ folder (if needed)
- [ ] README.md (basic user-facing instructions)

### Create ZIP file
```bash
cd extension-clean
zip -r ../vibe-mind-extension-v1.0.0.zip .
```

- [ ] Verify ZIP file is created
- [ ] Verify ZIP size is reasonable (<10MB)
- [ ] Test: Extract ZIP and verify all files are there

---

## ✅ Phase 6: Chrome Web Store Account (30 minutes)

### Register Developer Account
- [ ] Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [ ] Sign in with Google account
- [ ] Pay $5 one-time registration fee
- [ ] Verify email address
- [ ] Accept developer agreement

### Developer Information
- [ ] Set developer name: `[Your Name]`
- [ ] Set developer email: `[your-email@example.com]`
- [ ] Set developer website: `https://github.com/Douglasymlai/vibemind`

---

## ✅ Phase 7: Submit to Chrome Web Store (1 hour)

### Upload Extension
- [ ] Click "New Item" in developer dashboard
- [ ] Upload `vibe-mind-extension-v1.0.0.zip`
- [ ] Wait for upload to complete
- [ ] Verify no errors in upload

### Store Listing Tab
- [ ] **Name:** `Vibe Mind - AI Prompt Enhancer`
- [ ] **Summary:** Copy from STORE_LISTING.md (132 chars max)
- [ ] **Description:** Copy detailed description from STORE_LISTING.md
- [ ] **Category:** Productivity
- [ ] **Language:** English (United States)

### Graphic Assets Tab
- [ ] Upload icon (128x128) - extension/icons/icon-128.png
- [ ] Upload Screenshot 1 (extension in action) ⭐ REQUIRED
- [ ] Upload Screenshot 2 (image analysis)
- [ ] Upload Screenshot 3 (platforms)
- [ ] Upload Screenshot 4 (before/after)
- [ ] Upload Screenshot 5 (settings)
- [ ] Upload Small promotional tile (optional)
- [ ] Upload Large promotional tile (optional)

### Privacy Tab
- [ ] Click "Privacy practices"
- [ ] **Single purpose description:** Copy from STORE_LISTING.md
- [ ] **Permission justifications:** Copy from STORE_LISTING.md
- [ ] **Privacy policy URL:** `[Your hosted privacy policy URL]`
- [ ] Declare data usage:
  - [ ] Check "Personally identifiable information" → API keys (stored locally)
  - [ ] Check "User activity" → Analysis requests
  - [ ] Explain: "Stored locally on user's device only"

### Distribution Tab
- [ ] **Visibility:** Public
- [ ] **Regions:** All regions (or select specific countries)
- [ ] **Pricing:** Free

---

## ✅ Phase 8: Final Review Before Submit (15 minutes)

### Double-Check Everything
- [ ] All required fields filled
- [ ] At least 1 screenshot uploaded
- [ ] Privacy policy URL works
- [ ] Extension ZIP uploaded successfully
- [ ] No spelling/grammar errors in description
- [ ] Permissions justified
- [ ] Single purpose clearly stated

### Preview Listing
- [ ] Click "Preview" to see how it looks
- [ ] Check screenshots display correctly
- [ ] Check description formatting
- [ ] Verify icon looks good

### Submit
- [ ] Click "Submit for Review"
- [ ] Confirm submission
- [ ] Save confirmation number
- [ ] Wait for email confirmation

---

## ✅ Phase 9: Post-Submission (Ongoing)

### Monitor Review Status
- [ ] Check dashboard daily for review status
- [ ] Check email for Chrome Web Store notifications
- [ ] Expected review time: 1-3 business days

### If Rejected
- [ ] Read rejection reason carefully
- [ ] Fix identified issues
- [ ] Re-submit with changes explained

### After Approval
- [ ] Test installation from Chrome Web Store
- [ ] Share link on social media
- [ ] Post on Product Hunt
- [ ] Share on Reddit (r/SideProject, r/webdev)
- [ ] Share on LinkedIn
- [ ] Add to GitHub README
- [ ] Monitor initial reviews
- [ ] Respond to user feedback

---

## 📊 Timeline Estimate

| Phase                  | Time         | When              |
| ---------------------- | ------------ | ----------------- |
| Clean up extension     | 30 min       | Day 1             |
| Create documents       | 2 hours      | Day 1             |
| Create screenshots     | 3 hours      | Day 1-2           |
| Testing                | 1 hour       | Day 2             |
| Package extension      | 15 min       | Day 2             |
| Create account         | 30 min       | Day 2             |
| Submit                 | 1 hour       | Day 2             |
| **Total work time**    | **~8 hours** | **Over 1-2 days** |
| Chrome review          | N/A          | 1-3 business days |
| **Total to published** |              | **3-5 days**      |

---

## 🚨 Common Rejection Reasons to Avoid

- [ ] ❌ Missing or inadequate privacy policy
- [ ] ❌ Requesting unnecessary permissions
- [ ] ❌ Poor quality screenshots
- [ ] ❌ Misleading description or name
- [ ] ❌ Broken functionality
- [ ] ❌ Missing justification for permissions
- [ ] ❌ Keyword stuffing
- [ ] ❌ Using trademarked names improperly

---

## ✅ Success Criteria

You're ready to submit when:
- ✅ All required documents created and hosted
- ✅ Extension tested thoroughly
- ✅ At least 3-5 good screenshots
- ✅ Privacy policy is public and accessible
- ✅ Developer account registered
- ✅ Extension package is clean (no dev files)
- ✅ All permissions justified
- ✅ Description is clear and accurate

---

## 🎯 Your Next Action

**Start here:** 
1. ☑️ Clean up `/extension/config.js` and `/extension/manifest.json`
2. ☑️ Take 3-5 screenshots of extension working
3. ☑️ Host privacy policy on GitHub Pages or Railway
4. ☑️ Register Chrome Web Store developer account ($5)
5. ☑️ Submit!

**Need help?** Refer to:
- `CHROME_WEB_STORE_PUBLISHING.md` - Detailed guide
- `STORE_LISTING.md` - All copy for store listing
- `PRIVACY_POLICY.md` - Privacy policy template

**Good luck!** 🚀
