# Deployment Guide for Herb & Veda MERN Application

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free)
- Gmail account with App Password for SMTP
- GitHub account

## Quick Deployment Options

### 🚀 Option 1: Railway (Recommended)

1. **Push to GitHub** (if not done yet):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Railway**:
   - Visit [railway.app](https://railway.app)
   - Connect your GitHub account
   - Select your `Herb-Veda` repository
   - Railway will auto-detect your MERN stack

3. **Configure Environment Variables**:
   ```bash
   # In Railway dashboard, add these variables:
   NODE_ENV=production
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_long_random_string_64_chars_min
   RESET_PASSWORD_SECRET=another_long_random_string
   CLIENT_URL=https://your-railway-app.railway.app
   ADMIN_EMAIL=your-admin@email.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=your_gmail_app_password
   SMTP_FROM="Herb & Veda <your-gmail@gmail.com>"
   INVOICE_EMAIL_ENABLED=true
   ```

### 🌐 Option 2: Vercel + Backend on Railway

1. **Frontend on Vercel**:
   - Connect GitHub to Vercel
   - Deploy from `client` folder
   - Set `VITE_API_URL` to your backend URL

2. **Backend on Railway**:
   - Deploy `server` folder separately
   - Use the Railway backend URL in frontend

### 🔧 Option 3: Render (Free Tier)

1. **Backend Service**:
   - Create Web Service from GitHub
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Frontend Service**:
   - Create Static Site
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Publish Directory: `dist`

## Environment Setup

### MongoDB Atlas Setup:
1. Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create database user
3. Whitelist IP addresses (0.0.0.0/0 for all)
4. Get connection string

### Gmail App Password:
1. Enable 2-Factor Authentication
2. Go to Google Account Settings
3. Security > App Passwords
4. Generate password for "Mail"
5. Use this password in SMTP_PASS

## Production Checklist

- [ ] MongoDB Atlas configured
- [ ] Environment variables set
- [ ] SMTP credentials working
- [ ] CLIENT_URL points to frontend domain
- [ ] CORS configured for production domains
- [ ] Build process successful
- [ ] Test all features in production

## Troubleshooting

### Common Issues:
1. **CORS errors**: Update CLIENT_URL in server .env
2. **Database connection**: Check MongoDB whitelist and credentials
3. **Email not sending**: Verify Gmail App Password
4. **Build failures**: Check Node.js version compatibility

### Support:
- Railway: Great documentation and community
- Vercel: Excellent for React apps
- Render: Good free tier but slower cold starts

## Cost Estimates:
- **Railway**: Free tier, then $5/month
- **Vercel**: Free for personal projects
- **Render**: Free tier available
- **MongoDB Atlas**: Free tier (512MB)
- **Total**: $0-5/month for small applications