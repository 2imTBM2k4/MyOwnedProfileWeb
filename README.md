# bming · Backend Developer Portfolio & CMS

Personal portfolio and headless CMS of **Trần Bình Minh (bming)** — Final-year Software Engineering student specializing in dependable backend systems, database architecture, real-time event streaming, and clean API design.

Live Demo: [bming.vercel.app](https://bming.vercel.app/)

---

## ✨ Key Features

### 🌟 Interactive Portfolio (`/`)
- **Hero & Interactive Terminal**: Stylized CLI terminal with typewriter animation displaying developer persona, core stack, and status.
- **Bilingual Support (VI / EN)**: Full localization toggle between Vietnamese and English across all UI sections and dynamic database content.
- **Projects & Case Study Modals**:
  - Clean project showcase cards displaying project previews, title, and technology tags.
  - Interactive popup modal revealing detailed case studies:
    - `01. Problem (Vấn đề)`
    - `02. What I did (Giải pháp triển khai)`
    - `03. Results (Kết quả đạt được)`
    - `Testing Account & Credentials` (Dedicated testing instructions for recruiters/reviewers).
    - Quick actions to open Live Demo and GitHub repository.
- **Floating AI Assistant Chatbot**:
  - Floating bottom-right widget with responsive glassmorphism.
  - Smart multi-factor scoring matching engine supporting diacritic and non-diacritic queries.
  - Answers questions on Backend stack, Normal Form DB design, centralized error handling, and testing instructions.
  - Automatically presents **Quick Action Pills** (GitHub, LinkedIn, Mail) when inquiring about personal profile and contact info.
- **Direct Transmission Contact Modal (Say Hi)**:
  - Cyberpunk monospace contact modal (`Input.Name`, `Input.Email`, `Input.Message`).
  - Sends direct email notifications to Gmail via **Resend API** without requiring user authentication.
- **Skills Marquee**: Infinite smooth scrolling marquee of core backend and database technologies.
- **Gear & Audiophile Showcase (`/gears`)**:
  - Interactive gear catalog featuring ergonomic mice, keyboards, audiophile IEMs, DACs, and monitors with active/retired status indicators.

---

### 🛡️ Admin Dashboard (`/admin`)
- **Session Authentication**: Server-side password verification with signed HMAC-SHA256 session tokens stored in secure HTTP-only cookies.
- **Bilingual Project Management**:
  - Multi-tab editor for Vietnamese (`VI`) and English (`EN`) content (Title, Kind, Description, Case Study steps).
  - Image cover upload, tag management, tone customization, and featured project toggle.
- **Gear & Game Management**:
  - Add, edit, reorder, and retire gear items.
  - Search game metadata using the **RAWG API** and Steam database.
- **CV / Resume Management**:
  - Upload updated PDF resume directly to secure Supabase storage.
  - Public `/api/cv` endpoint automatically serves the latest CV with proper download headers.
- **Profile & Social Links**:
  - Crop and update avatar & cover photos.
  - Manage external social platform URLs.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & CSS Modules with CSS Variables design tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Lenis](https://lenis.darkroom.engineering/) Smooth Scroll
- **Database**: [Supabase PostgreSQL](https://supabase.com/)
- **Storage**: Supabase Storage Buckets (`avatars`, `covers`, `gears`, `games`, `resumes`)
- **Email Delivery**: [Resend API](https://resend.com/)
- **External Integrations**:
  - Steam Web API (Game stats & header assets)
  - RAWG Video Games Database API
  - Discord Gateway / Lanyard API (Real-time online status)
  - HoYoLAB Game Records API
- **Icons**: [Lucide React](https://lucide.dev/) & [Simple Icons](https://simpleicons.org/)
- **Testing**: Custom automated test suite (`npm test`) validating translations integrity, sorting, and authentication.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18.17+ or v20+
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A free [Supabase](https://supabase.com/) project
- A free [Resend](https://resend.com/) account (optional, for email delivery)

### 2. Clone & Install
```bash
git clone https://github.com/2imTBM2k4/MyOwnedProfileWeb.git
cd MyOwnedProfileWeb
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key

# Admin Authentication
ADMIN_PASSWORD=your-secure-password

# Email Delivery (Resend)
RESEND_API_KEY=re_your_api_key
CONTACT_TO_EMAIL=2004.tranbinhminh@gmail.com
CONTACT_FROM_EMAIL=Portfolio Contact <onboarding@resend.dev>

# Optional Third-Party APIs
STEAM_API_KEY=your-steam-api-key
NEXT_PUBLIC_DISCORD_ID=your-discord-id
RAWG_API_KEY=your-rawg-api-key
```

### 4. Database Setup
Execute the migration scripts located in the `sql/` directory within your Supabase SQL Editor:
- `sql/add_project_case_study.sql`: Adds problem, did, result, kind, and tone columns.
- `sql/add_project_bilingual.sql`: Adds English translation columns (`title_en`, `problem_en`, `did_en`, `result_en`, `kind_en`, `description_en`).
- `sql/add_steam_fields.sql`, `sql/add_publisher_field.sql`, `sql/add_hoyolab.sql`: Additional gaming metadata.

### 5. Run the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portfolio.  
Access [http://localhost:3000/admin](http://localhost:3000/admin) to manage content.

---

## 🧪 Testing & Verification

Run the built-in test suite:
```bash
npm test
```
The test suite validates:
1. `language-translations.test.mjs`: Strict structural symmetry between Vietnamese and English language dictionaries.
2. `profile-content.test.mjs`: Safe public URL parsing, featured project prioritization, and gear preview selection.
3. `admin-features.test.mjs`: Multi-type stable sorting algorithms.
4. `admin-auth.test.mjs`: Token expiry, signature tampering defense, and HMAC-SHA256 verification.
5. `cv-route.test.mjs`: Upload size limits, PDF MIME validation, and download byte integrity.

To run a production build verification:
```bash
npm run build
```

---

## 📂 Project Architecture

```
MyOwnedProfileWeb/
├── public/                 # Static assets, fallback project previews & icons
├── scripts/                # Automated validation & test scripts
├── sql/                    # Supabase SQL schema migrations
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── admin/          # Admin CMS page & styles
│   │   ├── api/            # API routes (auth, contact, cv, gears, projects, upload...)
│   │   ├── gears/          # Gear catalog page
│   │   ├── globals.css     # Tailwind & Liquid glass design tokens
│   │   ├── layout.tsx      # Root layout & font loaders
│   │   └── page.tsx        # Main portfolio homepage
│   ├── components/         # Reusable UI & feature components
│   │   ├── ContactModal.tsx       # Direct transmission contact form
│   │   ├── FloatingNavbar.tsx     # Dynamic glass header navigation
│   │   ├── InteractiveChatbot.tsx # Floating AI assistant
│   │   ├── ProjectDetailModal.tsx # Project case study modal
│   │   └── ...
│   ├── context/            # LanguageContext (Locale state management)
│   ├── data/               # Static translations & chatbot knowledge base
│   └── lib/                # Supabase clients, auth helpers, content utilities
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── package.json            # Project dependencies and npm scripts
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
