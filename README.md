# Personal Gaming Profile

A modern, Steam-inspired personal gaming profile website built with Next.js 14, featuring a beautiful full-page background cover, gaming setup showcase, game library, and social media links.

## ✨ Features

### 🎮 Gaming Profile
- **Full-page background cover** - Steam-style immersive background with gradient overlay
- **Profile header** - Avatar, username, bio with elegant design
- **Quick social links** - Pill-style social media badges

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

### 🔗 Social Media Tab
- Display all your social media profiles
- **Auto-extract username from URL** - Paste URL and username is automatically extracted
- Custom display names for each platform
- Supported platforms: Twitter/X, Twitch, YouTube, Instagram, Discord, TikTok, Facebook, Steam, GitHub, LinkedIn, Reddit, Spotify, Patreon, Kick, Bluesky
- Dynamic icons from simple-icons

### 🛠️ Admin Dashboard (`/admin`)
- **Profile Management** - Upload avatar & cover with image cropping
- **Gear Management** - Add/Edit/Delete gear with inline image upload
- **Games Management** - Add/Edit/Delete games with cover images
- **Social Links Management** - Add/Edit/Delete social profiles
- GIF support (skips cropping to preserve animation)
- Drag & drop or click to upload images

### 🎨 Design Features
- **Glass morphism** - Backdrop blur effects on cards
- **Responsive design** - Mobile, tablet, and desktop optimized
- **Dark theme** - Gaming-focused dark UI with blue accents
- **Smooth animations** - Hover effects and transitions
- **Modern UI** - Built with shadcn/ui components

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (avatars, covers, gears, games)
- **Icons**: Lucide Icons + simple-icons
- **Image Cropping**: react-easy-crop
- **Deployment**: Vercel

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

Go to **SQL Editor** in Supabase and run:

```sql
-- Profile table
create table profile (
  id uuid default gen_random_uuid() primary key,
  username text,
  bio text,
  avatar_url text,
  cover_url text,
  created_at timestamp default now()
);

-- Gears table
create table gears (
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
create table social_links (
  id uuid default gen_random_uuid() primary key,
  platform text not null,
  url text not null,
  display_name text,
  icon text,
  display_order int,
  created_at timestamp default now()
);

-- Games table
create table games (
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

-- Create policies (allow all for simplicity - adjust for production)
create policy "Allow all on profile" on profile for all using (true);
create policy "Allow all on gears" on gears for all using (true);
create policy "Allow all on social_links" on social_links for all using (true);
create policy "Allow all on games" on games for all using (true);

-- Insert default profile row
insert into profile (username, bio) values ('SILENTBOIZ', 'A tech enthusiast, gamer, and maker.');
```

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
```

Replace with your actual Supabase credentials.

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
│   │   │   └── page.tsx          # Admin dashboard
│   │   ├── api/
│   │   │   ├── games/            # Games API routes
│   │   │   ├── gears/            # Gears API routes
│   │   │   ├── profile/          # Profile API routes
│   │   │   ├── social-links/     # Social links API routes
│   │   │   └── upload/           # Image upload API
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Homepage
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── ImageCropper.tsx      # Image cropping component
│   │   └── SocialIcon.tsx        # Social media icons
│   └── lib/
│       ├── supabase.ts           # Supabase client & types
│       └── utils.ts              # Utility functions
├── .env.local                    # Environment variables (create this)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🎯 Usage Guide

### Adding Your Profile

1. Go to `/admin`
2. Click **Profile** tab
3. Upload avatar and cover image
4. Enter username and bio
5. Click "Lưu Profile"

### Adding Gaming Gear

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

## 🔒 Security Notes

⚠️ **Important**: The admin panel (`/admin`) currently has no authentication. For production use, you should:

1. Add authentication (Supabase Auth, NextAuth.js, or simple password protection)
2. Restrict API routes to authenticated users only
3. Update RLS policies in Supabase for better security

Example simple password protection:
```typescript
// In admin/page.tsx
const [password, setPassword] = useState('')
const [authenticated, setAuthenticated] = useState(false)

if (!authenticated) {
  return (
    <div>
      <input 
        type="password" 
        value={password}
        onChange={e => {
          if (e.target.value === 'your-secret-password') {
            setAuthenticated(true)
          }
        }}
      />
    </div>
  )
}
```

## 🐛 Troubleshooting

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

### Change Colors
Edit `src/app/globals.css` and Tailwind classes in components. Current theme uses blue (`#1d4ed8`, `#0ea5e9`).

### Add More Social Platforms
Edit `src/components/SocialIcon.tsx` and add to `PLATFORM_MAP`:
```typescript
const PLATFORM_MAP: Record<string, string> = {
  // ... existing platforms
  newplatform: 'siNewPlatform', // from simple-icons
}
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

---

Built with ❤️ by **Silentboiz**
