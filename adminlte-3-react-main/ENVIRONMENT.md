# Environment Configuration Guide

This document explains how to configure environment variables for different environments.

## 📋 Environment Files

### Development (`.env.local`)

Used for local development. This file is **NOT** committed to git.

```env
# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# API Configuration
API_BASE_URL=http://localhost:5000/api

# Node Environment
NODE_ENV=development
```

### Production (`.env.production`)

Used for production deployments. Set these in your hosting platform (Vercel, AWS, etc.).

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret

# API Configuration
API_BASE_URL=https://api.yourdomain.com/api

# Node Environment
NODE_ENV=production
```

### Staging (`.env.staging`)

Used for staging/testing environment.

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-staging-google-client-id
GOOGLE_CLIENT_SECRET=your-staging-google-client-secret

# API Configuration
API_BASE_URL=https://staging-api.yourdomain.com/api

# Node Environment
NODE_ENV=staging
```

## 🔐 Security Best Practices

### ✅ DO:

- Use different credentials for each environment
- Store production secrets in your hosting platform's environment variables
- Rotate secrets regularly
- Use strong, unique values for each secret
- Keep `.env.local` in `.gitignore`

### ❌ DON'T:

- Commit `.env.local` or any file with secrets to git
- Share environment files via email or chat
- Use production credentials in development
- Hardcode secrets in your code
- Expose API keys in client-side code

## 🚀 Deployment Platforms

### Vercel

1. Go to Project Settings → Environment Variables
2. Add each variable with appropriate environment (Production/Preview/Development)
3. Redeploy your application

### AWS (Elastic Beanstalk)

```bash
eb setenv GOOGLE_CLIENT_ID=xxx API_BASE_URL=xxx
```

### Docker

Use `.env` file or pass via `-e` flag:

```bash
docker run -e API_BASE_URL=xxx -e GOOGLE_CLIENT_ID=xxx your-image
```

### Kubernetes

Create a ConfigMap or Secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  GOOGLE_CLIENT_ID: <base64-encoded-value>
  API_BASE_URL: <base64-encoded-value>
```

## 📝 Environment Variables Reference

| Variable               | Type   | Required | Description                               |
| ---------------------- | ------ | -------- | ----------------------------------------- |
| `API_BASE_URL`         | string | Yes      | Backend API base URL                      |
| `GOOGLE_CLIENT_ID`     | string | No       | Google OAuth Client ID for social login   |
| `GOOGLE_CLIENT_SECRET` | string | No       | Google OAuth Client Secret                |
| `NODE_ENV`             | string | Auto     | Environment mode (development/production) |

## 🔄 Loading Environment Variables

### In Next.js Components

```typescript
// Client-side (must be prefixed with NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Server-side (no prefix needed)
const secret = process.env.GOOGLE_CLIENT_SECRET;
```

### In next.config.mjs

```javascript
env: {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
}
```

## 🧪 Testing Environment Setup

For testing, create `.env.test`:

```env
API_BASE_URL=http://localhost:5000/api
NODE_ENV=test
```

## 🆘 Troubleshooting

**Environment variables not loading?**

1. Restart the development server
2. Check file name is exactly `.env.local`
3. Verify no spaces around `=` sign
4. Check if variable is properly exported in `next.config.mjs`

**Different values in production?**

1. Check hosting platform environment variables
2. Verify deployment environment is set correctly
3. Clear build cache and redeploy

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [12-Factor App Config](https://12factor.net/config)
