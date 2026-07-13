# Aarsh Wedding Videography Portfolio

A premium, full-stack wedding photography and videography portfolio website built using **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **MongoDB**, **Redis**, and **Cloudinary**. 

This application provides a highly polished, responsive visual front-end featuring interactive WebGL elements alongside a role-protected Administration Dashboard for uploading media, managing folders (albums), tracking user inquiries, and organizing stories.

---

## 🔗 Project Documentation Files

To support in-depth analysis and technical preparation, the following reports have been created:
- 📄 **[Technical Project Report](file:///e:/NEXT/wedding_portfolio/PROJECT_REPORT.md)**: A deep-dive analysis of the system architecture, database models, rendering pipeline, custom shaders, and middleware security checks.
- 📄 **[Interview Questions & Answers Guide](file:///e:/NEXT/wedding_portfolio/INTERVIEW_QA.md)**: A comprehensive Q&A guide addressing database design, WebGL performance, performance optimizations, NextAuth security, and rate-limiting patterns.

---

## ✨ Features

### Client Showcases
- **3D WebGL Circular Gallery**: A visually stunning image slider powered by the lightweight WebGL library `ogl` featuring custom vertex shaders that deform image planes into cylinders and wobble them organically based on the user's scroll speed.
- **Instagram-Style Highlight Stories**: Vertical story reels that support automatic 30s transitions, visual horizontal progress indicators, custom tap-to-advance zones, and responsive keyboard controls (`ArrowLeft`/`ArrowRight`/`Escape`). It embeds both Cloudinary photos and inline YouTube player frames.
- **Masonry Gallery Grid**: Dynamically styled grids using a custom 8-cycle repeating tile size layout.
- **Dual-Channel Contact Form**: Client inquiry form validated with **Zod** on both client and server side. Submissions are permanently saved to MongoDB and immediately trigger a email notification to the administrator via **EmailJS**.
- **SEO & Accessibility Optimized**: Built-in JSON-LD schemas (`LocalBusiness` and `FAQPage`) and structured metadata configuration for maximum Google Search indexing and crawler optimization.

### Administrative Control Panel
- **SPA Administrative Hub**: An administrative dashboard built with a single-page view router that displays quick statistical summaries of folders, photos, videos, highlights, and inquiries.
- **Folder & Album Organization**: Create, delete, and browse custom photo albums.
- **Batched Media Uploader**: Select and upload multiple image files simultaneously to Cloudinary, featuring server-side file type verification, size caps (10MB limit), and real-time progress indicators.
- **Video & Reel Managers**: Manage YouTube videography link structures.
- **Interactive Highlight Creator**: Compile and arrange mixed media sequences to feed into the mobile-responsive story highlights bubble slider.
- **Client Inquiry Tracker**: View customer requests, filter new leads, and toggle statuses between `new`, `read`, and `replied`.

---

## 🛠️ Security and Performance Design

- **NextAuth JWT Protection**: Restricts administrative pages and Route Handler APIs.
- **Fixed-Window Redis Rate Limiter**: Enforces connection controls based on IP addresses to stop DDoS/spamming:
  - Admin login: max 10 requests per 15 minutes.
  - Booking forms: max 5 requests per hour.
  - General API endpoints: max 60 requests per minute.
- **Eager/Lazy Loading Pipeline**: On upload, images generate a 400px optimized thumbnail for grids, and a 20px base64 inline blur placeholder. High-resolution images are loaded *only* when the lightbox modal is active.
- **Intersection Observer Loading**: Album components load batches of 16 images at a time as the client scrolls, saving bandwidth.
- **Strict Content Security Policy (CSP)**: whitelists scripts, styles, connections, frames, and assets strictly to self, YouTube, Cloudinary, Google Fonts, and EmailJS.

---

## ⚙️ Setup & Installation

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v18.x or later)
- **MongoDB** Instance (Local or MongoDB Atlas Cluster URI)
- **Redis** Host (Local instance or cloud providers like Render, Upstash, or Railway)
- **Cloudinary** Account (for storing and transforming images)
- **EmailJS** Account (for receiving booking alerts)

### 2. Clone the Repository
```bash
git clone <repository-url>
cd wedding_portfolio
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root of the project directory based on `.env.example`:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/wedding_portfolio

# NextAuth Settings
NEXTAUTH_SECRET=your_generated_random_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Admin Login Credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password

# Cloudinary API Credentials
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# EmailJS SDK Credentials
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_emailjs_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Redis Connection URL
REDIS_URL=redis://localhost:6379
```

### 5. Running the Application

- **Development Server**:
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) to view the client-facing website, or go to [http://localhost:3000/admin](http://localhost:3000/admin) to log in to the dashboard.

- **Type Check & Linting**:
  ```bash
  npx tsc --noEmit
  npm run lint
  ```

- **Production Build**:
  ```bash
  npm run build
  npm run start
  ```
