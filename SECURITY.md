# Security Policy & Hardening Guide

This document describes the security model, vulnerability mitigation practices, and reporting procedures for the ApexKit Sports E-commerce Platform.

---

## 1. Security Architecture & Threat Model

ApexKit implements defense-in-depth principles across all application layers:

```
[ Client Browser / Admin UI ]
           │  HTTPS / Strict Origin
           ▼
[ Security Headers & CORS Layer ]
           │  X-Content-Type-Options: nosniff
           │  X-Frame-Options: SAMEORIGIN
           │  Referrer-Policy: strict-origin-when-cross-origin
           ▼
[ Rate Limiting & DoS Shield ]
           │  IP/Identifier-based login attempt tracking
           │  5 failed attempts per 15-minute window lockout
           ▼
[ Authentication & Access Control (RBAC) ]
           │  Public Routes: Products, Match Center, Cart
           │  Protected Routes: Admin Stats, Order Management, Product CRUD
           │  Cryptographic JWT Token Verification (HS256)
           ▼
[ Input Validation & NoSQL Defense ]
           │  Type validation on requests, safe string parsing
           │  Strict schema casting prevents operator injection ($where, $ne)
           ▼
[ Storage & Persistence Layer ]
   MongoDB Connection Pool (SSL/TLS enabled) / Graceful Fallback
```

---

## 2. Authentication & Credential Storage

### A. Password Hashing (Bcrypt)
- Passwords are **never** stored in plaintext.
- The platform uses `bcryptjs` with a cost factor (salt rounds) of **12**.
- Passwords and password hashes are **never returned in API responses**. The `sanitizeUser` helper explicitly removes `password`, `hash`, `salt`, and `__v` before JSON serialization.
- Passwords are never placed in URLs, query strings, logs, or client-side storage.

### B. JSON Web Tokens (JWT)
- Authenticated admin sessions are issued cryptographically signed HMAC-SHA256 tokens (`jsonwebtoken`).
- Secrets are sourced from `process.env.JWT_ACCESS_SECRET` with zero hardcoded defaults in production.
- Expiration is enforced via `JWT_EXPIRES_IN` (defaults to `24h`).
- Tokens must be sent in the standard HTTP header:
  ```http
  Authorization: Bearer <jwt-token>
  ```
- If an invalid, expired, or malformed token is presented, a 401 Unauthorized response is returned with no stack traces or server internals.

---

## 3. Rate Limiting & Brute Force Prevention

To mitigate credential-stuffing and brute-force dictionary attacks against admin credentials:
- The `/api/auth/admin-login` endpoint tracks failed attempts per client identifier (email + IP address).
- **Threshold**: 5 consecutive failed login attempts within a 15-minute window.
- **Action**: Further login attempts are immediately blocked with HTTP `429 Too Many Requests` and a message specifying how many minutes remain in the cooldown period.
- **Successful Authentication**: Resets the failure counter to zero immediately.

---

## 4. Customer Data & Privacy Protection

### A. Personal Identifiable Information (PII)
- Customer order information (name, email, phone number, delivery address) is restricted exclusively to authorized administrators with valid Bearer tokens.
- Ordinary website visitors cannot query other customers' orders or accounts.
- Product reviews and match center updates do not expose user emails or billing details.

### B. Database URI Sanitization
- MongoDB connection strings frequently contain credentials (`mongodb+srv://user:password@cluster...`).
- ApexKit implements `DatabaseManager.sanitizeUri()` which regex-strips credentials (`mongodb+srv://*****:*****@cluster...`) before emitting any startup, diagnostic, or health log.

---

## 5. Network & HTTP Hardening

### A. HTTP Security Headers
Every HTTP response issued by Express includes:
- `X-Content-Type-Options: nosniff` (Prevents MIME-sniffing exploits).
- `X-Frame-Options: SAMEORIGIN` (Mitigates clickjacking within untrusted frames).
- `X-XSS-Protection: 1; mode=block` (Enforces legacy browser XSS filtering).
- `Referrer-Policy: strict-origin-when-cross-origin` (Protects path information in cross-origin requests).

### B. CORS (Cross-Origin Resource Sharing)
- Cross-origin requests are checked against an allowlist (`FRONTEND_URL`, `APP_URL`, and localhost origins in development).
- Requests from unauthorized external domains are blocked.

### C. Body Parser Limit
- Request payloads are capped at `2mb` to prevent payload-bomb memory exhaustion attacks.

---

## 6. NoSQL Injection Prevention

MongoDB query injection occurs when user-supplied objects containing MongoDB operators (`$gt`, `$ne`, `$regex`, `$where`) are passed directly into driver query objects.
- In ApexKit, query parameters (e.g., `id`, `category`, `status`) are strictly coerced into primitive JavaScript strings (`String(req.params.id)`) before being passed into database queries.
- Raw JSON objects from user input are never directly merged into query filters without explicit property sanitization.

---

## 7. Vulnerability Reporting

If you identify a security vulnerability in this project:
1. **Do not open a public issue.**
2. Send an email with details, reproduction steps, and potential impact to the security team or maintainer: `security@apexkit-sports.internal` (or repository owner).
3. We will acknowledge receipt within 24–48 hours and work on a patch before public disclosure.
