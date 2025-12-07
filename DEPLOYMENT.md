# Deployment Guide

## Netlify Deployment (Frontend)

### Step 1: Build Frontend
```bash
cd frontend
npm run build
```

### Step 2: Deploy to Netlify
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub repository
4. Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`
5. Click "Deploy site"

### Step 3: Environment Variables
Add in Netlify dashboard:
- `REACT_APP_API_URL` = Your backend URL

## Backend Deployment Options

### Option 1: Heroku
```bash
cd backend
heroku create your-app-name
git push heroku main
```

### Option 2: Railway
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select backend folder
4. Add environment variables

### Option 3: Render
1. Go to https://render.com
2. New Web Service
3. Connect GitHub repository
4. Build command: `npm install`
5. Start command: `node server.js`

## Update API URL

After backend deployment, update frontend:
```javascript
// frontend/src/App.js
const API_BASE = 'https://your-backend-url.com/api';
```

## GitHub Push Commands

```bash
cd "D:\Agentic AI Loan Sales Assistant Project"
git init
git add .
git commit -m "Initial commit: Agentic AI Loan Assistant"
git branch -M main
git remote add origin https://github.com/Tejesh141/Agentic-AI-Project-for-Banking-System.git
git push -u origin main
```

## Post-Deployment Checklist

- [ ] Frontend deployed on Netlify
- [ ] Backend deployed (Heroku/Railway/Render)
- [ ] API URL updated in frontend
- [ ] Environment variables configured
- [ ] Test all features
- [ ] Voice features working
- [ ] File upload working
- [ ] PDF generation working
- [ ] Dark mode working

## Troubleshooting

### CORS Issues
Add your Netlify URL to backend CORS:
```javascript
app.use(cors({
  origin: ['https://your-netlify-app.netlify.app']
}));
```

### API Not Found
Check netlify.toml redirects configuration

### Build Fails
- Clear node_modules and reinstall
- Check Node version compatibility
- Review build logs

## Custom Domain (Optional)

1. Go to Netlify → Domain settings
2. Add custom domain
3. Update DNS records
4. Enable HTTPS

## Monitoring

- Netlify Analytics: Built-in
- Backend Logs: Check hosting platform dashboard
- Error Tracking: Consider Sentry integration
