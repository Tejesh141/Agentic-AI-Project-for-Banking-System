# Netlify Deployment Steps

## Quick Deploy to Netlify

### Step 1: Login to Netlify
Go to: https://app.netlify.com

### Step 2: Import Project
1. Click "Add new site"
2. Choose "Import an existing project"
3. Select "GitHub"
4. Authorize Netlify to access your GitHub
5. Select repository: `Tejesh141/Agentic-AI-Project-for-Banking-System`

### Step 3: Configure Build Settings
```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/build
```

### Step 4: Deploy
Click "Deploy site"

## Important Notes

### Backend Deployment Required
The frontend needs a backend API. Deploy backend separately:

**Option 1: Render.com (Recommended)**
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Root directory: `backend`
5. Build command: `npm install`
6. Start command: `node server.js`
7. Copy the deployed URL

**Option 2: Railway.app**
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select backend folder
4. Copy the deployed URL

### Update API URL
After backend deployment, update frontend:

1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Add: `REACT_APP_API_URL` = `https://your-backend-url.com`
4. Redeploy site

OR update in code:
```javascript
// frontend/src/App.js line 3
const API_BASE = 'https://your-backend-url.com/api';
```

## Features Included

✓ Voice Assistant (Speech-to-Text, Text-to-Speech)
✓ File Upload (Images & Documents)
✓ Dark Mode
✓ Chat History & Export
✓ Professional UI with Financial Pattern Background
✓ Rose-Red-Pink Gradient Theme
✓ Responsive Design
✓ 5 AI Agents (Master, Sales, Verification, Underwriting, Sanction)
✓ Deterministic Underwriting Rules
✓ PDF Sanction Letter Generation

## Test After Deployment

Use demo phone numbers:
- 9876543210 (John Doe - Instant Approval)
- 8765432109 (Jane Smith - Low Credit)
- 7654321098 (Raj Kumar - High Score)

## Troubleshooting

### Build Fails
- Check Node version (use Node 18+)
- Clear cache and retry

### API Not Working
- Verify backend is deployed
- Check CORS settings in backend
- Update API_BASE URL

### Voice Features Not Working
- Requires HTTPS (Netlify provides this)
- Check browser permissions

## Custom Domain (Optional)

1. Netlify → Domain settings
2. Add custom domain
3. Update DNS records
4. SSL auto-configured

## Repository
https://github.com/Tejesh141/Agentic-AI-Project-for-Banking-System

## Support
Check DEPLOYMENT.md for detailed instructions
