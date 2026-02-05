# Security Best Practices

This document outlines security best practices implemented in the AdminLTE React application and recommendations for maintaining security.

## 🔐 Authentication & Authorization

### Current Implementation

✅ **JWT-Based Authentication**

- Tokens stored in localStorage
- Automatic token attachment via Axios interceptors
- Auto-logout on 401 responses

✅ **Role-Based Access Control (RBAC)**

- Granular permission system
- Route-level protection
- Component-level permission checks

### Recommendations

#### 1. Token Storage

**Current**: localStorage  
**Recommended**: httpOnly cookies

```typescript
// Future improvement: Use httpOnly cookies
// Backend should set cookies with:
// - httpOnly: true
// - secure: true (HTTPS only)
// - sameSite: 'strict'
```

**Why?**

- httpOnly cookies are not accessible via JavaScript
- Prevents XSS attacks from stealing tokens
- More secure for production environments

#### 2. Token Refresh

Implement token refresh mechanism:

```typescript
// Pseudo-code for token refresh
const refreshToken = async () => {
  const response = await axios.post("/auth/refresh");
  // Backend sets new token in httpOnly cookie
  return response.data;
};

// Add to axios interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await refreshToken();
        return axiosInstance.request(error.config);
      } catch {
        // Logout user
      }
    }
    return Promise.reject(error);
  },
);
```

#### 3. Password Requirements

Enforce strong passwords:

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

```typescript
const passwordSchema = yup
  .string()
  .min(8, "Password must be at least 8 characters")
  .matches(/[a-z]/, "Password must contain lowercase letter")
  .matches(/[A-Z]/, "Password must contain uppercase letter")
  .matches(/[0-9]/, "Password must contain number")
  .matches(/[^a-zA-Z0-9]/, "Password must contain special character")
  .required("Password is required");
```

## 🛡️ XSS Protection

### Current Implementation

✅ **React's Built-in Protection**

- React escapes content by default
- Prevents XSS in most cases

### Recommendations

#### 1. Avoid dangerouslySetInnerHTML

```typescript
// ❌ Dangerous
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe
<div>{userInput}</div>

// ✅ If HTML is needed, sanitize it
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

#### 2. Content Security Policy (CSP)

Add CSP headers in `next.config.mjs`:

```javascript
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' ${process.env.API_BASE_URL};
    `
      .replace(/\s{2,}/g, " ")
      .trim(),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};
```

## 🔒 CSRF Protection

### Recommendations

#### 1. CSRF Tokens

Implement CSRF tokens for state-changing operations:

```typescript
// Backend should provide CSRF token
// Frontend should include it in requests

const csrfToken = getCsrfToken(); // From cookie or meta tag

axios.post("/api/users", data, {
  headers: {
    "X-CSRF-Token": csrfToken,
  },
});
```

#### 2. SameSite Cookies

Ensure cookies have SameSite attribute:

```
Set-Cookie: token=...; SameSite=Strict; Secure; HttpOnly
```

## 🌐 API Security

### Current Implementation

✅ **Axios Interceptors**

- Automatic token attachment
- Global error handling

### Recommendations

#### 1. Rate Limiting

Implement client-side rate limiting:

```typescript
import { debounce } from "lodash";

const debouncedSearch = debounce(async (query) => {
  await axios.get(`/api/search?q=${query}`);
}, 300);
```

#### 2. Input Validation

Always validate and sanitize user input:

```typescript
// Using Yup
const userSchema = yup.object({
  email: yup.string().email().required(),
  name: yup.string().min(2).max(50).required(),
  age: yup.number().positive().integer().min(18).max(120),
});

// Using Zod
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  age: z.number().positive().int().min(18).max(120),
});
```

#### 3. Prevent SQL Injection

Always use parameterized queries on backend:

```typescript
// ❌ Vulnerable
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Safe (Backend)
const query = "SELECT * FROM users WHERE email = ?";
db.query(query, [email]);
```

## 📝 Data Protection

### Sensitive Data Handling

#### 1. Never Log Sensitive Data

```typescript
// ❌ Bad
console.log("User password:", password);
console.log("Credit card:", cardNumber);

// ✅ Good
console.log("Login attempt for user:", email);
```

#### 2. Mask Sensitive Information

```typescript
const maskEmail = (email: string) => {
  const [name, domain] = email.split("@");
  return `${name[0]}***@${domain}`;
};

const maskPhone = (phone: string) => {
  return phone.replace(/(\d{3})\d{4}(\d{3})/, "$1****$2");
};
```

#### 3. Secure File Uploads

```typescript
const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
const maxSize = 5 * 1024 * 1024; // 5MB

const validateFile = (file: File) => {
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type");
  }
  if (file.size > maxSize) {
    throw new Error("File too large");
  }
};
```

## 🔍 Security Monitoring

### Recommendations

#### 1. Error Tracking

Integrate error tracking service:

```typescript
// Install Sentry
npm install @sentry/nextjs

// Configure in sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### 2. Audit Logging

Already implemented via Activity Logs module:

- Track all user actions
- Log authentication attempts
- Monitor permission changes

#### 3. Security Headers Monitoring

Use tools like:

- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

## 🚨 Common Vulnerabilities

### 1. Dependency Vulnerabilities

Regularly audit dependencies:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Update dependencies
npm update
```

### 2. Environment Variables

✅ **DO:**

- Use `.env.example` for templates
- Keep `.env.local` in `.gitignore`
- Use different credentials per environment
- Rotate secrets regularly

❌ **DON'T:**

- Commit `.env` files to git
- Share credentials via email/chat
- Use production credentials in development
- Hardcode secrets in code

### 3. Third-Party Scripts

Be cautious with third-party scripts:

```typescript
// ✅ Load from trusted CDNs only
// ✅ Use Subresource Integrity (SRI)
<script
  src="https://cdn.example.com/script.js"
  integrity="sha384-..."
  crossOrigin="anonymous"
/>
```

## 📋 Security Checklist

### Development

- [ ] Use HTTPS in production
- [ ] Implement CSP headers
- [ ] Enable CORS properly
- [ ] Validate all user inputs
- [ ] Sanitize outputs
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Use httpOnly cookies for tokens
- [ ] Implement token refresh
- [ ] Add security headers
- [ ] Enable audit logging

### Deployment

- [ ] Remove console.logs in production
- [ ] Minify and obfuscate code
- [ ] Use HTTPS/SSL certificates
- [ ] Configure firewall rules
- [ ] Set up DDoS protection
- [ ] Enable security monitoring
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Backup sensitive data
- [ ] Implement disaster recovery plan

### Ongoing

- [ ] Regular dependency updates
- [ ] Security patch management
- [ ] Penetration testing
- [ ] Code security reviews
- [ ] Monitor security logs
- [ ] Incident response plan
- [ ] Security training for team

## 🛠️ Security Tools

### Recommended Tools

1. **npm audit** - Dependency vulnerability scanning
2. **Snyk** - Continuous security monitoring
3. **OWASP ZAP** - Security testing
4. **Sentry** - Error tracking
5. **Lighthouse** - Security audits

### Running Security Audit

```bash
# NPM audit
npm audit

# Check for outdated packages
npm outdated

# Update packages
npm update

# Check bundle size
npm run build
```

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## 🆘 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security@yourdomain.com
3. Include detailed description
4. Provide steps to reproduce
5. Wait for response before disclosure

---

**Security is everyone's responsibility. Stay vigilant! 🛡️**
