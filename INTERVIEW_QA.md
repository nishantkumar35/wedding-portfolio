# Interview Preparation: Questions & Answers (Wedding Portfolio Project)

This document contains a structured set of interview questions and answers regarding the architecture, performance, security, and rendering engine of this wedding portfolio project.

---

## 1. System Architecture & Tech Stack

### Q1: Can you walk us through the high-level architecture of this application?
**Answer:**
The application is a full-stack portfolio site built with **Next.js 16 (App Router)** and **React 19**. It follows a server-client split:
- **Public Portfolio**: Server-side rendered (SSR) or statically generated with revalidation (`revalidate = 3600` on the Home page and `60` on the Gallery page) for maximum speed and SEO.
- **Admin Dashboard**: Secured client-side app (`AdminApp`) that acts as a Single Page Application (SPA) once loaded. It interfaces with specialized admin Next.js Route Handlers.
- **Database & Media Storage**: MongoDB is the primary database for structured metadata (albums, photos, YouTube links, highlights, and contact forms). High-resolution image assets are offloaded to Cloudinary, while longer cinematic films are loaded via YouTube embeds.
- **Rate-Limiting & Security**: A Redis cache is integrated via `ioredis` to manage client rate limits, and security headers are enforced via `next.config.ts`.

---

## 3. Database Design & Data Modeling

### Q4: How did you design the database schemas, and what are the relationships between them?
**Answer:**
We designed five Mongoose schemas in `app/models/`:
- **One-to-Many**: `Album` to `Photo`. A photo schema requires an `albumId` (Mongoose reference) to group photos under a specific folder.
- **Ordered List (Mixed Types)**: `Highlight` to `HighlightItem`. To represent Instagram-style stories, the `Highlight` document contains a nested array of `HighlightItem` subdocuments. Each item can be either a `photo` (referencing Cloudinary properties) or a `youtube` video link.
- **Independent Tables**: `Video` stores YouTube references (for the dedicated videos tab), and `ContactInquiry` logs booking details submitted by users.

### Q5: How do you handle database connections in serverless environments (like Vercel deployment)?
**Answer:**
In serverless environments, functions are stateless and spin up/down frequently. If you open a new database connection on every request, you will quickly exhaust the MongoDB connection pool.
We solved this by using a global caching strategy in `app/lib/db.ts`:
```typescript
let cached = (global as any).mongoose ?? { conn: null, promise: null };
(global as any).mongoose = cached

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false })
  }
  cached.conn = await cached.promise
  return cached.conn
}
```
This reuse pattern checks if a connection promise already exists in the Node.js global state. If so, it returns it; otherwise, it initiates a single connection and saves it to the global cache, preventing multiple connections from piling up.

---

## 4. Performance & Frontend Optimization

### Q6: Wedding portfolio websites are image-heavy. How did you optimize page loading times and performance?
**Answer:**
- **Dual-Asset Pipeline**: We separate images into low-resolution and high-resolution assets.
- **Eager Upload Processing**: When an admin uploads a photo, our Cloudinary stream upload pre-generates a 400px optimized thumbnail.
- **Inline Placeholders**: We generate a tiny 20px blur placeholder image. The base64 URL is stored in the database.
- **Eager/Lazy Loading Separation**:
  - We use Next.js `<Image>` with the `placeholder="blur"` attribute.
  - The first four photos in any grid view use `loading="eager"` to speed up First Contentful Paint (FCP). The remaining photos use native browser lazy loading (`loading="lazy"`).
  - The grid uses the lightweight 400px `thumbnailUrl` (saving significant network bandwidth). The browser requests the heavy, full-resolution file *only* if the user opens the Lightbox modal.
- **Batching & Infinite Scroll**: The album detail view uses an `IntersectionObserver` sentinel. When a user scrolls to the bottom of the page, the client loads the next batch of 16 photos rather than fetching all of them at once.

---

## 5. Security & Error Handling

### Q7: How is the Admin Dashboard protected from unauthorized access?
**Answer:**
We implement security at three separate levels:
1. **Next.js Middleware**: Enforces an auth-guard on all routes starting with `/admin` (except `/admin/login`). It reads the NextAuth JWT token and redirects unauthenticated users to `/admin/login`.
2. **Server-Side Checks**: Page layouts (like `app/admin/(dashboard)/layout.tsx`) perform a server-side session check via `getServerSession(authOptions)` and call `redirect('/admin/login')` if empty.
3. **Route Handler Checks**: Backend API endpoints check the session via `getServerSession(authOptions)` and return `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })` immediately before executing any database operations.

### Q8: Explain how you implemented rate-limiting in the application. Why did you use Redis?
**Answer:**
We implemented a custom, IP-based fixed-window rate limiter in `app/lib/ratelimit.ts` using **Redis** (via `ioredis`). We chose Redis because serverless API handlers are stateless and cannot store request counters in memory.
- **Limiting Metrics**:
  - **Login Route**: Limited to 10 login attempts per 15 minutes per IP/email combination to prevent credential brute-forcing.
  - **Contact Form**: Limited to 5 submissions per hour per IP to block inquiry spam.
  - **General API**: Limited to 60 queries per minute per IP.
- **Algorithm**: We calculate the window key based on time: `${prefix}:${ip}:${currentWindow}`. We increment the value in Redis using the `INCR` command. If the result is `1`, we apply an expiry using `EXPIRE` so the key cleans up automatically. If the count exceeds our threshold, we block the request and return an HTTP `429 Too Many Requests` status with standard headers (`Retry-After`).

### Q9: What security headers were configured, and why?
**Answer:**
We configured headers in `next.config.ts` to harden client security:
- `X-Frame-Options: DENY`: Prevents the portfolio from being loaded in an iframe on other websites, mitigating clickjacking attacks.
- `X-Content-Type-Options: nosniff`: Enforces the browser to respect matching MIME types.
- `Referrer-Policy: strict-origin-when-cross-origin`: Minimizes metadata exposure in referrer headers.
- `Content-Security-Policy (CSP)`: Defines a strict whitelist of where the page can load scripts, frames, images, styles, and fonts. For example, scripts are limited to the website domain and EmailJS; images are restricted to local assets, YouTube thumbnails, and Cloudinary.

---

## 6. Integrations & Forms

### Q10: How does the client booking inquiry flow work? Why is it a dual-channel design?
**Answer:**
The booking form in `ContactForm.tsx` uses a two-step process:
1. **Primary Persistence (MongoDB)**: The client inputs are validated on the server using a Zod schema (`ContactSchema`). If valid, the submission is recorded in the MongoDB `ContactInquiry` table. This is the source of truth.
2. **Real-time Alerting (EmailJS)**: Once saved, the client runs a client-side JavaScript request via EmailJS to email the admin immediately. If EmailJS fails, the booking is still stored in the database, allowing the admin to view it from the Dashboard. This prevents lead loss due to SMTP outages.
