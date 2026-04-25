# Personal Gaming Profile

A modern, Steam-inspired personal gaming profile website built with Next.js 14, featuring a beautiful full-page background cover, gaming setup showcase, game library, social media links, and professional loading states.

## ✨ Features

### 🎮 Gaming Profile

- **Full-page background cover** - Steam-style immersive background with gradient overlay
- **Profile header** - Avatar, username, bio with elegant design
- **Social media links** - Enhanced display with icons and hover effects
- **Loading screen** - Professional loading animation while fetching data

### 🖥️ Gaming Setup Tab

- Display your gaming gear collection (mouse, keyboard, monitor, headset, CPU, GPU, etc.)
- **Organized by category** - Each category has its own section with icon
- **Status sorting** - Active gear shown first, retired gear after
- Image upload support with preview
- CRUD operations via admin panel

### 🎯 Games Tab

- Showcase your game library with cover images
- **Grouped by status**:
  - **Đang chơi** (Online) - Games you're currently playing
  - **Offline** - Games you're not playing
- Profile links to game accounts (Steam, Enka Network, etc.)
- Status indicators with animated dots

### 🔗 Social Media

- Display all your social media profiles below profile header
- **Auto-extract username from URL** - Paste URL and username is automatically extracted
- Custom display names for each platform
- Supported platforms: Twitter/X, Twitch, YouTube, Instagram, Discord, TikTok, Facebook, Steam, GitHub, LinkedIn, Reddit, Spotify, Patreon, Kick, Bluesky
- Dynamic icons from simple-icons with hover animations

### 🛠️ Admin Dashboard (`/admin`)

- **Secure authentication** - Server-side password verification with HTTP-only cookies
- **Profile Management** - Upload avatar & cover with image cropping
- **Gear Management** - Add/Edit/Delete gear with inline image upload
- **Games Management** - Add/Edit/Delete games with cover images
- **Social Links Management** - Add/Edit/Delete social profiles
- GIF support (skips cropping to preserve animation)
- Drag & drop or click to upload images

### 🎨 Design Features

- **Loading screen** - Professional dual-ring spinner with smooth transitions
- **Glass morphism** - Backdrop blur effects on cards
- **Responsive design** - Mobile, tablet, and desktop optimized
- **Dark theme** - Gaming-focused dark UI with blue accents
- **Smooth animations** - Hover effects, transitions, and loading states
- **Modern UI** - Built with shadcn/ui components

### 🔒 Security Features

- **Server-side authentication** - Password checked on server, not client
- **HTTP-only cookies** - Protected from XSS attacks
- **API route protection** - Middleware guards all write operations
- **Session management** - 24-hour expiry with secure cookies
- **CSRF protection** - SameSite=strict cookie policy

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (avatars, covers, gears, games)
- **Authentication**: Custom server-side auth with HTTP-only cookies
- **Icons**: Lucide Icons + simple-icons
- **Image Cropping**: react-easy-crop
- **Deployment**: Vercel

## 🎬 Demo Features

- ✨ Professional loading screen with dual-ring animation
- 🎨 Full-page cover background (like Steam profile)
- 🔐 Secure admin panel with server-side authentication
- 📱 Fully responsive on all devices
- 🖼️ Image upload with cropping support
- 🎮 Gaming gear organized by category
- 🎯 Games grouped by online/offline status
- 🔗 Social links with auto-username extraction
- 💫 Smooth animations and transitions throughout

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account ([supabase.com](https://supabase.com))
- Vercel account ([vercel.com](https://vercel.com)) - for deployment

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd AboutMe
npm install
```

### 2. Supabase Setup

#### A. Create a New Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be ready

#### B. Create Database Tables

Go to **SQL Editor** in Supabase and run **toàn bộ đoạn SQL này một lần**:

```sql
-- Profile table
create table if not exists profile (
  id uuid default gen_random_uuid() primary key,
  username text,
  bio text,
  avatar_url text,
  cover_url text,
  created_at timestamp default now()
);

-- Gears table
create table if not exists gears (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  brand text,
  category text,
  image_url text,
  purchase_date date,
  status text check (status in ('active','retired')),
  notes text,
  created_at timestamp default now()
);

-- Social links table
create table if not exists social_links (
  id uuid default gen_random_uuid() primary key,
  platform text not null,
  url text not null,
  display_name text,
  icon text,
  display_order int,
  created_at timestamp default now()
);

-- Games table
create table if not exists games (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  profile_url text,
  image_url text,
  status text check (status in ('online','offline')),
  notes text,
  created_at timestamp default now()
);

-- Enable Row Level Security
alter table profile enable row level security;
alter table gears enable row level security;
alter table social_links enable row level security;
alter table games enable row level security;

-- Drop existing policies if any (to avoid conflicts)
drop policy if exists "Allow all on profile" on profile;
drop policy if exists "Allow all on gears" on gears;
drop policy if exists "Allow all on social_links" on social_links;
drop policy if exists "Allow all on games" on games;

-- Create policies (allow all operations - suitable for personal site)
create policy "Allow all on profile" on profile for all using (true) with check (true);
create policy "Allow all on gears" on gears for all using (true) with check (true);
create policy "Allow all on social_links" on social_links for all using (true) with check (true);
create policy "Allow all on games" on games for all using (true) with check (true);
```

> ⚠️ **Lưu ý**: Không cần insert profile row thủ công - code sẽ tự tạo khi bạn lưu profile lần đầu.

#### C. Create Storage Buckets

Go to **Storage** in Supabase and create these buckets (all public):

1. `avatars` - For profile avatars
2. `covers` - For profile cover images
3. `gears` - For gear images
4. `games` - For game cover images

For each bucket:

- Click "New bucket"
- Name it (e.g., `avatars`)
- Make it **Public**
- Click "Create bucket"

#### D. Get API Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon public** key

### 3. Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ADMIN_PASSWORD=your-secure-password-here
```

Replace with your actual Supabase credentials and choose a strong admin password.

⚠️ **Important**:

- Use `ADMIN_PASSWORD` (NOT `NEXT_PUBLIC_ADMIN_PASSWORD`)
- This keeps the password server-side only for better security
- Choose a strong password with uppercase, lowercase, numbers, and symbols

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Homepage**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin`

## 🚀 Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - In the "Configure Project" step, expand "Environment Variables"
   - Add:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
     - `ADMIN_PASSWORD` = your admin password (e.g., `MySecurePass123!`)
   - ⚠️ Use `ADMIN_PASSWORD` (NOT `NEXT_PUBLIC_ADMIN_PASSWORD`) for better security
   - Click "Deploy"

4. **Done!**
   - Your site will be live at `https://your-project.vercel.app`
   - Every push to `main` branch will auto-deploy

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? (your-project-name)
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add ADMIN_PASSWORD

# Deploy to production
vercel --prod
```

### Post-Deployment Checklist

✅ Test homepage loads correctly  
✅ Test admin panel at `/admin`  
✅ Test image uploads work  
✅ Test CRUD operations (add/edit/delete gear, games, social links)  
✅ Check mobile responsiveness  
✅ Verify Supabase storage buckets are public

## 📁 Project Structure

```
AboutMe/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx          # Admin dashboard with auth
│   │   ├── api/
│   │   │   ├── auth/             # Authentication API
│   │   │   ├── games/            # Games API routes
│   │   │   ├── gears/            # Gears API routes
│   │   │   ├── profile/          # Profile API routes
│   │   │   ├── social-links/     # Social links API routes
│   │   │   └── upload/           # Image upload API
│   │   ├── globals.css           # Global styles + animations
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Homepage with loading
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── ImageCropper.tsx      # Image cropping component
│   │   ├── LoadingScreen.tsx     # Full-page loading screen
│   │   ├── LoadingSpinner.tsx    # Inline loading spinner
│   │   └── SocialIcon.tsx        # Social media icons
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client & types
│   │   └── utils.ts              # Utility functions
│   └── middleware.ts             # API route protection
├── .env.local                    # Environment variables (create this)
├── ADMIN.md                      # Admin panel guide
├── CHANGELOG.md                  # Version history
├── DEPLOY.md                     # Deployment guide (Vietnamese)
├── LOADING.md                    # Loading states documentation
├── SECURITY.md                   # Security documentation
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🎯 Usage Guide

### First Time Setup

1. Go to `/admin` and login with your password
2. Click **Profile** tab
3. Upload avatar and cover image
4. Enter username and bio
5. Click "Lưu Profile"

### Adding Your Gaming Gear

1. Go to `/admin` → **Gears** tab
2. Click "Add Gear"
3. Fill in:
   - Name (e.g., "Logitech G Pro X Superlight")
   - Brand (e.g., "Logitech")
   - Category (e.g., "mouse", "keyboard", "monitor")
   - Upload image or paste URL
   - Status: Active or Retired
4. Click "Create"

### Adding Games

1. Go to `/admin` → **Games** tab
2. Click "Add Game"
3. Fill in:
   - Title (e.g., "Genshin Impact")
   - Profile Link (optional, e.g., Steam profile, Enka Network)
   - Upload cover image
   - Status: Online or Offline
4. Click "Create"

### Adding Social Links

1. Go to `/admin` → **Social Links** tab
2. Click "Add Link"
3. Fill in:
   - Platform (e.g., "Twitter", "Twitch", "YouTube")
   - URL (e.g., `https://twitter.com/silentboiz`)
   - Display name will auto-extract from URL (or enter manually)
4. Click "Create"

## 🔒 Security & Admin Access

### Accessing Admin Panel

After deployment, access your admin panel at:

```
https://your-project.vercel.app/admin
```

You'll be prompted to enter a password.

### Password Protection

The admin panel is now protected with **server-side authentication**:

1. **Default Password**: `admin123` (for testing only!)
2. **Custom Password**: Set via environment variable `ADMIN_PASSWORD`

**Security improvements**:

- ✅ Password checked server-side (cannot bypass with DevTools)
- ✅ HTTP-only cookies (protected from XSS)
- ✅ API routes protected by middleware
- ✅ Password never exposed to client
- ✅ Session expires after 24 hours

**To change the password:**

1. In Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add/Edit `ADMIN_PASSWORD` (NOT `NEXT_PUBLIC_ADMIN_PASSWORD`)
   - Enter your secure password
   - Redeploy the project

2. In `.env.local` (for local development):
   ```env
   ADMIN_PASSWORD=YourSecurePassword123!
   ```

⚠️ **Important**: Use `ADMIN_PASSWORD` without the `NEXT_PUBLIC_` prefix. This keeps it server-side only.

### Session Management

- Password is checked on login
- Session is stored in browser's `sessionStorage`
- You stay logged in until you close the browser tab or click "Logout"
- No password is stored on the server

### ⚠️ Security Recommendations

For better security in production:

1. **Use a strong password**: Mix of uppercase, lowercase, numbers, and symbols
2. **Don't share the password**: Keep it private
3. **Consider upgrading**: For multi-user access, implement proper authentication:
   - Supabase Auth (email/password, OAuth)
   - NextAuth.js
   - Clerk
   - Auth0

4. **Restrict API routes**: Add authentication checks to API routes
5. **Update RLS policies**: Tighten Supabase Row Level Security policies

### Current Security Level

✅ Server-side password verification  
✅ HTTP-only cookies  
✅ API route protection via middleware  
✅ Password never exposed to client  
✅ Session management with expiry  
⚠️ No rate limiting (can be brute forced)  
⚠️ No 2FA  
⚠️ Single password for all admins

**Security rating**: ⭐⭐⭐☆☆ (3/5) - Good for personal sites

For detailed security information, see [SECURITY.md](SECURITY.md)

This is suitable for personal sites. For production/team use, implement proper authentication (Supabase Auth, NextAuth.js, Clerk).

## 🐛 Troubleshooting

### Loading screen stuck

- Check browser console (F12) for errors
- Verify Supabase credentials in environment variables
- Check network tab to see which API is failing
- Ensure all Supabase tables exist

### Images not uploading

- Check Supabase storage buckets are created and **public**
- Verify bucket names match: `avatars`, `covers`, `gears`, `games`
- Check browser console for errors

### Database errors

- Verify all tables are created in Supabase
- Check RLS policies are set to allow all operations
- Ensure environment variables are correct

### Build errors on Vercel

- Make sure all dependencies are in `package.json`
- Check environment variables are added in Vercel dashboard
- Review build logs for specific errors

## 🎨 Customization

### Change Loading Screen

Edit `src/components/LoadingScreen.tsx`:

```typescript
// Change spinner colors
<div className="border-red-500/20 border-t-red-500" />

// Change message
<LoadingScreen message="Your custom message" />

// Add your logo
<img src="/logo.png" className="w-16 h-16 mb-4" />
```

### Change Colors

Edit `src/app/globals.css` and Tailwind classes in components. Current theme uses blue (`#1d4ed8`, `#0ea5e9`).

### Add More Social Platforms

Edit `src/components/SocialIcon.tsx` and add to `PLATFORM_MAP`:

```typescript
const PLATFORM_MAP: Record<string, string> = {
  // ... existing platforms
  newplatform: "siNewPlatform", // from simple-icons
};
```

### Modify Layout

- Homepage: `src/app/page.tsx`
- Admin: `src/app/admin/page.tsx`

## 📝 License

MIT License - feel free to use this for your own personal profile!

## 🙏 Credits

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/) and [Simple Icons](https://simpleicons.org/)
- Database & Storage by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)

## 📚 Documentation

- [ADMIN.md](ADMIN.md) - Admin panel usage guide (Vietnamese)
- [DEPLOY.md](DEPLOY.md) - Deployment guide (Vietnamese)
- [SECURITY.md](SECURITY.md) - Security documentation
- [LOADING.md](LOADING.md) - Loading states guide
- [CHANGELOG.md](CHANGELOG.md) - Version history

## 🚀 What's New in v2.0

- ✨ Professional loading screen with animations
- 🔒 Server-side authentication (much more secure!)
- 🎨 Improved social links display
- 📱 Better mobile responsiveness
- 💫 Smooth transitions and animations
- 🛡️ API route protection with middleware
- 📖 Comprehensive documentation

See [CHANGELOG.md](CHANGELOG.md) for full details.

---

Built with ❤️ by **Silentboiz**
