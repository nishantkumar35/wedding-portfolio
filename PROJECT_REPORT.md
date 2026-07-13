# Technical Project Report: Aarsh Wedding Videography Portfolio

This document provides a comprehensive technical analysis of the **Aarsh Wedding Videography Portfolio** web application. It outlines the system architecture, database models, API endpoint structures, custom interactive components, security design, and SEO/performance practices.

---

## 1. Project Overview

Aarsh Wedding Videography is a premium, full-stack portfolio website built for a professional wedding videographer and photographer (based in Begusarai, Bihar). The application provides:
- **A public-facing showcase** featuring a WebGL-based curved image carousel, video galleries, and Instagram-style highlight stories.
- **A client inquiry capture pipeline** with dual-channel persistence: MongoDB storage for admin tracking and instant email dispatch via the EmailJS client-side SDK.
- **A fully responsive, role-protected Administration Dashboard** allowing folder (album) organization, photo/video uploads, highlight stories management, and client inquiries tracking.

---

## 2. Technology Stack & Architecture

### Core Architecture
The system is built on **Next.js 16 (App Router)** and **React 19**, deploying a combination of Server Components (for fast initial data loads, server-side DB connection, and SEO benefits) and Client Components (for complex WebGL visual interactions and state-driven dashboard widgets).

```
+-------------------------------------------------------------------+
|                        Client's Browser                           |
+------------------+-----------------------------+------------------+
                   |                             |
                   | (Client Actions)            | (Inquiries)
                   v                             v
+------------------+-----------------------------+------------------+
|                    Next.js App Router Server                      |
|  [Server Components]                 [Route Handlers / API]       |
+------------------+-----------------------------+------------------+
                   |                             |
                   | (Reads/Writes)              | (Uploads/Deletes)
                   v                             v
+------------------+-------------+     +---------+------------------+
|      MongoDB (Mongoose)        |     |        Cloudinary          |
|  Albums, Photos, Videos,       |     |  High-Res Media, Eager     |
|  Highlights, Inquiries         |     |  Thumbnails, Blur Images   |
+------------------+-------------+     +----------------------------+
                   |
                   | (Rate-Limit Counts)
                   v
+------------------+-------------+
|        Redis (ioredis)         |
|  Fixed-Window IP Rate Limits   |
+--------------------------------+
```

### Detailed Tech Stack Breakdown
* **Framework**: Next.js 16.2.6 (App Router)
* **Library**: React 19.2.4, React DOM 19.2.4
* **Styling**: Tailwind CSS v4, PostCSS (`@tailwindcss/postcss`), Class Variance Authority, Tailwind Merge, `tw-animate-css` (^1.4.0)
* **Interactive Components & UI Utilities**: `@use-gesture/react` (^10.3.1), `@base-ui/react` (^1.4.1), `ogl` (^1.0.11), `lucide-react` (^1.16.0), `sonner` (^2.0.7)
* **Database**: MongoDB with Mongoose ODM (mongoose ^9.6.2)
* **Caching & Rate Limiting**: Redis via `ioredis` (^5.11.1)
* **Authentication**: NextAuth.js (^4.24.14) with JWT session strategy
* **Validation**: Zod (^4.4.3)
* **Image/Video Processing**: Sharp (^0.34.5), Multer (^2.1.1)
* **Third-Party Integrations**: Cloudinary API, EmailJS Client SDK, YouTube Embed API

---

## 3. Database Schema & Data Models

The application uses five core schemas defined via Mongoose in `app/models/`:

### 3.1 Album Schema (`Album.ts`)
Represents a collection of photo assets (folders).
- `name` (String, required): Name of the album (e.g., "Engagement Sessions").
- `slug` (String, required, unique): URL-friendly string identifier.
- `coverUrl` (String, optional): Thumbnail image URL designated as the folder cover.
- `createdAt` (Date): Auto-populated timestamp.

### 3.2 Photo Schema (`Photo.ts`)
Stores details of image files uploaded to Cloudinary, associated with an Album.
- `albumId` (ObjectId, ref: 'Album', required): Links the photo to its parent album.
- `publicId` (String, required): The Cloudinary public identifier (used for deletion/updates).
- `url` (String, required): The full-resolution image URL.
- `thumbnailUrl` (String, required): Optimized (~400px width) thumbnail for grid displays.
- `blurDataUrl` (String): Low-res (~20px width) base64 inline image for lazy-loading placeholders.
- `caption` (String, default: ''): Description of the wedding moment.
- `createdAt` (Date): Auto-populated timestamp.

### 3.3 Video Schema (`Video.ts`)
Stores references to wedding videos hosted on YouTube.
- `youtubeId` (String, required): The 11-character YouTube video ID.
- `title` (String, required): Title of the video.
- `caption` (String, default: ''): Additional context.
- `order` (Number, default: 0): Sorting order indicator.
- `createdAt` (Date): Auto-populated timestamp.

### 3.4 Highlight Schema (`Highlight.ts`)
Manages Instagram-style highlights (Reels/Stories) containing a mixed array of photos and YouTube videos.
- **Highlight Schema**:
  - `title` (String, required): Highlight name (e.g., "Haldi Ceremony").
  - `slug` (String, required, unique): URL-friendly string identifier.
  - `order` (Number, default: 0): Dynamic display sorting parameter.
  - `cover` (Sub-schema, required): Custom object containing Cloudinary `publicId`, `url`, `thumbnailUrl`, and `blurDataUrl` for the circular stories bubble cover.
  - `items` (Array of HighlightItem): Inner sub-documents containing the media elements.
- **HighlightItem Schema**:
  - `type` (String, enum: `['photo', 'youtube']`, required)
  - `order` (Number, default: 0)
  - `publicId` / `url` / `thumbnailUrl` / `blurDataUrl` / `caption` (Cloudinary photo specific fields)
  - `youtubeId` / `youtubeTitle` (YouTube video specific fields)

### 3.5 Contact Inquiry Schema (`ContactInquiry.ts`)
Captures data from prospective clients using the booking form.
- `firstName` (String, required), `lastName` (String)
- `email` (String, required)
- `phone` (String)
- `weddingDate` (String)
- `location` (String)
- `package` (String): Chosen package name (e.g., "The Essentials", "The Classic", or "The Luxe")
- `message` (String)
- `status` (String, enum: `['new', 'read', 'replied']`, default: `'new'`): Tracks administrative follow-up state.
- `createdAt` (Date): Submission timestamp.

---

## 4. API Endpoints & Route Handlers

The backend exposes a clean REST API structured under `app/api/` with authentication protection and rate limiting implemented at the middleware level:

### 4.1 Client-Facing Endpoints
* **`POST /api/contact`**: Receives customer bookings.
  - **Validation**: Uses Zod schema (`ContactSchema`) to validate names, email, phone, and date formats.
  - **Rate Limiting**: Limited to 5 requests per hour per IP.
  - **Action**: Persists the message to the MongoDB database.

### 4.2 Protected Admin Endpoints (`/api/admin/*`)
All endpoints below require a valid NextAuth.js JWT session token and are subject to a general API rate limit of 60 requests per minute.

* **`GET / POST / PATCH / DELETE /api/admin/album`**:
  - `GET`: Fetches all albums, sorted chronologically.
  - `POST`: Creates a new album (requires unique slug).
  - `PATCH`: Modifies album metadata (e.g., changing cover image or display name).
  - `DELETE`: Deletes an album.
* **`GET / POST / DELETE /api/admin/photos`**:
  - `GET`: Fetches paginated photos (optional filtering by `albumId`).
  - `POST`: Accepts multipart form data. Uploads file to Cloudinary, triggers auto-optimization, and saves to database. Maximum size is 10 MB.
  - `DELETE`: Removes photo record and deletes the corresponding file from Cloudinary storage.
* **`GET / POST / PATCH / DELETE /api/admin/videos`**:
  - `GET`: Fetches paginated YouTube video references.
  - `POST`: Adds a new YouTube ID and title.
  - `PATCH`: Modifies video order, title, or caption.
  - `DELETE`: Deletes the video document.
* **`GET / POST / DELETE /api/admin/highlights`**:
  - `GET`: Fetches highlight story circles.
  - `POST`: Uploads cover image to Cloudinary and registers the highlight group.
  - `DELETE`: Deletes highlight, purging the cover image and all internal photo assets from Cloudinary.
* **`POST / DELETE /api/admin/highlights/[id]`**:
  - `POST`: Appends a new item (photo file upload or YouTube ID) to a specific highlight's story deck.
  - `DELETE`: Removes a story item from the highlight by ID (and purges photo files from Cloudinary if type is 'photo').
* **`GET / PATCH / DELETE /api/admin/inquiries`**:
  - `GET`: Fetches paginated client booking submissions (returns statistics count of `new`, `read`, and `replied` items).
  - `PATCH`: Updates inquiry state (`status: 'new' | 'read' | 'replied'`) with Zod validation.
  - `DELETE`: Permanently deletes an inquiry record.

---

## 5. Core UI Components & Interactive Features

### 5.1 3D WebGL Circular Gallery (`CircularGallery.tsx`)
A custom image carousel rendering on the main landing page, built on top of **OGL** (a lightweight WebGL library).
- **Custom Shaders**:
  - *Vertex Shader*: Bends flat plane coordinates into an elegant 3D arc. Implements a sine-wave wobble effect (`uSpeed`) that dynamically warps the mesh relative to drag momentum and scroll speed.
  - *Fragment Shader*: Performs aspect ratio fitting (mimicking CSS `object-fit: cover`) and handles dynamic border-radius rounding inside WebGL using a Signed Distance Field (SDF) algorithm.
- **Controls**: Listens to mouse drags, touch swipes, and wheel scrolls, interpolating movement with linear interpolation (`lerp`) for physics-based deceleration.

### 5.2 Instagram-Style Stories Viewer (`GalleryApp.tsx` / `Highlights`)
An immersive stories player for wedding highlight highlights.
- **Auto-Advance Playback**: Standard photos display for 30 seconds before automatically transitioning to the next item using a React `useEffect` timer. YouTube videos automatically halt the timer to allow users to watch uninterrupted.
- **Interactive Taps**: Integrates quick-tap zones (left 1/3 to go back, right 1/3 to advance, center zone displays captions/video player) and keyboard arrow controls.
- **Progress Tracking**: Top-mounted progress indicators display filled bars for viewed items, a linear timing animation for the active image, and empty tracks for upcoming elements.

### 5.3 Advanced Interactive Assets (In-Reserve / Unused)
The codebase includes high-fidelity component templates ready for feature toggles or section expansions:
- **`DomeGallery.tsx`**: A massive 3D gallery projecting image tiles onto a hemispherical dome. Implements complex coordinate calculations and `@use-gesture/react` listener bindings. Handles mouse/touch drag velocity physics (inertia, damping) and opens tiles using a custom transition that animates scale and translations directly from their 3D projection path to screen center.
- **`BorderGlow.tsx`**: An interactive UI card component wrapping children in a dynamic mesh-gradient border and outer glow. Employs cursor proximity tracking (glow adjusts intensity and angle following pointer coordinates near edges), custom conic gradients, and HSL shadow layer mapping.
- **`GallerySlider.tsx`**: A client-side visual slider utilizing CSS transitions for sliding movements, with API hooks to automatically fetch fallback images if initialized without props.

### 5.4 Form persistence & Email Dispatch (`ContactForm.tsx`)
- **Dual-Channel capture**: The booking form runs validation using Zod on submit.
- On validation success, it concurrently calls `/api/contact` (for database records) and uses the **EmailJS client SDK** to send an immediate alert directly to the photographer's inbox, ensuring zero inquiries are missed even if database connections latency spikes.

---

## 6. Performance & Security Engineering

### 6.1 Media Optimization Pipeline
1. **Cloudinary eager transformations**: Standard image uploads generate a compressed 400px width thumbnail and a 20px width blur thumbnail asynchronously on upload.
2. **Next.js `<Image>` integration**:
   - The grid maps use `thumbnailUrl` (averaging only ~40KB per asset) and use the base64 inline `blurDataUrl` as a loading placeholder.
   - The full-resolution image URL is requested *only* when the lightbox modal is active, saving substantial client bandwidth during initial portfolio browsing.
3. **Infinite Scroll with Intersection Observers**: Large albums load batches of 16 images at a time, rendering new items dynamically as the user scrolls past the sentinel viewport marker.

### 6.2 Multi-Layer Security Architecture
* **Admin Auth Protection**: Relies on **NextAuth JWT strategy** backed by `ADMIN_EMAIL` and `ADMIN_PASSWORD` env variables. Route access verification is conducted in:
  1. The layout layer (`app/admin/(dashboard)/layout.tsx`) through server-side session checks.
  2. Individual API endpoint route handlers (`GET`, `POST`, `PATCH`, `DELETE`) to prevent unauthorized API requests.
  3. The Next.js Middleware file (`middleware.ts`) which intercepts incoming HTTP requests.
* **Rate Limiting**: Custom Redis fixed-window rate limiter preventing DDoS/spam attacks:
  - **Auth Endpoint**: Limits login attempts to 10 trials per 15 minutes.
  - **Contact Endpoint**: Limits contact form inquiries to 5 requests per hour.
  - **General API routes**: Limits requests to 60 hits per minute.
* **Next.js Security Headers**: `next.config.ts` enforces modern HTTP security headers:
  - `X-Frame-Options: DENY` (prevents clickjacking)
  - `X-Content-Type-Options: nosniff` (blocks MIME-sniffing)
  - `Referrer-Policy: strict-origin-when-cross-origin` (restricts referral leaks)
  - `Strict-Transport-Security`: HSTS enabled for 1 year.
  - `Content-Security-Policy (CSP)`: Restricts script, style, image, connection, and frame sources strictly to self, Google Fonts, YouTube, Cloudinary, Upstash, and EmailJS.

---

## 7. SEO & Metadata
- **Semantic HTML**: Structurally optimized using HTML5 landmarks (`<main>`, `<section>`, `<nav>`, `<h1>` hierarchy, custom screen-reader only titles).
- **Programmatic Structured Data**: Embedded JSON-LD schema templates inside `StructuredData.tsx` including `FAQPage` and `LocalBusiness` schemas with precise geocoding coordinate points for Begusarai, Bihar to maximize local search engine optimization (SEO) indexing.
- **Robots & Sitemaps**: Dynamic `robots.ts` and `sitemap.ts` files automatically generated in next.js, routing search engine bots to clean URLs while guarding the `/admin` path.

---

## 8. Technical Review & Key Recommendations

During the technical audit, a major Next.js routing configuration issue was identified and corrected:

> [!WARNING]
> **Resolved Config Bug (Middleware Deactivation)**
> The middleware logic was stored in `proxy.ts` in the root folder. In Next.js, middleware files must be named `middleware.ts` (or `.js`) in the root or `src/` directory to be recognized by the runtime build process. Because of this, the general API rate-limiting and route-level authorization guards were inactive. 
> 
> *Fix Applied*: Migrated `proxy.ts` to `middleware.ts` and renamed the entry handler to `middleware(req)` matching Next.js requirements.

### Further Recommendations
1. **Database Indexing**: Add a compound database index on `{ albumId: 1, createdAt: -1 }` inside the `Photo` model to speed up image lookups inside large wedding albums.
2. **Redis Connection Management**: In serverless production environments (e.g., Vercel), ensure `ioredis` connects using connection pooling or serverless Redis REST APIs (like Upstash Redis SDK) to prevent reaching connection limits during high-traffic periods.
3. **Unused Components Management**: Decide whether to incorporate `DomeGallery.tsx` and `BorderGlow.tsx` into active pages or move them to a separate `/components/archive` directory to keep production components clean.
