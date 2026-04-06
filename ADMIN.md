# Hướng Dẫn Sử Dụng Admin Panel

## 🔐 Đăng Nhập

1. Truy cập: `https://your-site.vercel.app/admin`
2. Nhập mật khẩu admin
3. Click "Login"

**Mật khẩu mặc định**: `admin123` (đổi ngay!)

## 📝 Quản Lý Nội Dung

### Profile Tab
- Upload avatar (ảnh đại diện)
- Upload cover (ảnh bìa - sẽ làm background toàn trang)
- Nhập username và bio
- Click "Lưu Profile"

**Lưu ý**: 
- GIF động được hỗ trợ
- Ảnh cover có thể crop để chọn vùng hiển thị
- GIF sẽ upload thẳng (không crop)

### Gears Tab
Quản lý gaming gear của bạn:

1. Click "Add Gear"
2. Điền thông tin:
   - **Name**: Tên gear (vd: "Logitech G Pro X Superlight")
   - **Brand**: Hãng (vd: "Logitech")
   - **Category**: Loại (vd: "mouse", "keyboard", "monitor", "headset", "cpu", "gpu")
   - **Ảnh**: Upload từ máy hoặc dán URL
   - **Status**: Active (đang dùng) hoặc Retired (không dùng nữa)
3. Click "Create"

**Hiển thị trên trang chủ**:
- Gear được nhóm theo category
- Active gear hiển thị trước, retired sau

### Games Tab
Quản lý game library:

1. Click "Add Game"
2. Điền thông tin:
   - **Title**: Tên game
   - **Profile Link**: Link profile game (Steam, Enka Network, v.v.) - tùy chọn
   - **Ảnh bìa**: Upload cover game
   - **Status**: Online (đang chơi) hoặc Offline
3. Click "Create"

**Hiển thị trên trang chủ**:
- Games được chia 2 section: "Đang chơi" và "Offline"
- Online games có dot xanh animation

### Social Links Tab
Quản lý social media:

1. Click "Add Link"
2. Điền thông tin:
   - **Platform**: Tên platform (Twitter, Twitch, YouTube, Discord, v.v.)
   - **URL**: Link đến profile của bạn
   - **Tên hiển thị**: Tự động extract từ URL, hoặc nhập thủ công
3. Click "Create"

**Tính năng thông minh**:
- Khi paste URL, username sẽ tự động được extract
- Ví dụ: `https://twitter.com/silentboiz` → tên hiển thị: `silentboiz`

**Platforms được hỗ trợ icon**:
- Twitter/X, Twitch, YouTube, Instagram
- Discord, TikTok, Facebook, Steam
- GitHub, LinkedIn, Reddit, Spotify
- Patreon, Kick, Bluesky

## ✏️ Chỉnh Sửa & Xóa

- Click icon **Edit** (✏️) để chỉnh sửa
- Click icon **Trash** (🗑️) để xóa
- Xóa sẽ có confirm dialog

## 🚪 Đăng Xuất

Click nút "Logout" ở góc trên bên phải để đăng xuất.

## 💡 Tips

### Upload Ảnh
- Click vào ô vuông để chọn file từ máy
- Hoặc dán URL ảnh vào input field
- Hỗ trợ: JPG, PNG, GIF
- GIF động sẽ giữ nguyên animation

### Cover Image
- Sau khi chọn ảnh, bạn có thể crop để chọn vùng đẹp nhất
- Kéo và zoom để điều chỉnh
- GIF sẽ upload thẳng (không crop)

### Category Names
Để gear hiển thị đẹp với icon, dùng các tên category sau:
- `mouse` - Chuột
- `keyboard` - Bàn phím
- `monitor` - Màn hình
- `headset` hoặc `headphones` - Tai nghe
- `cpu` - CPU
- `gpu` - Card đồ họa
- `microphone` hoặc `mic` - Micro

### Social Platform Names
Để icon hiển thị đúng, dùng tên chính xác:
- `Twitter` hoặc `X`
- `Twitch`
- `YouTube`
- `Instagram`
- `Discord`
- `TikTok`
- `Facebook`
- `Steam`
- `GitHub`
- `LinkedIn`
- `Reddit`
- `Spotify`
- `Patreon`
- `Kick`
- `Bluesky`

## 🔒 Bảo Mật

### Đổi Mật Khẩu

**Trên Vercel**:
1. Vào project → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_ADMIN_PASSWORD`
3. Nhập mật khẩu mới
4. Redeploy project

**Local (.env.local)**:
```env
NEXT_PUBLIC_ADMIN_PASSWORD=MatKhauMoiCuaBan123!
```

### Mật Khẩu Mạnh
Nên dùng mật khẩu có:
- Ít nhất 12 ký tự
- Chữ hoa, chữ thường
- Số
- Ký tự đặc biệt (!@#$%^&*)

Ví dụ: `MyGaming$ite2024!`

### Session
- Đăng nhập 1 lần, giữ session cho đến khi đóng tab
- Không cần login lại khi chuyển tab
- Click "Logout" để đăng xuất thủ công

## ❓ Troubleshooting

### Không vào được admin
- Kiểm tra URL có đúng `/admin` không
- Thử xóa cache browser (Ctrl+Shift+Delete)
- Kiểm tra mật khẩu trong Vercel environment variables

### Upload ảnh không được
- Kiểm tra Supabase Storage buckets đã tạo chưa
- Đảm bảo buckets là Public
- Tên buckets: `avatars`, `covers`, `gears`, `games`

### Không lưu được data
- Kiểm tra Supabase RLS policies
- Xem console log trong browser (F12)
- Kiểm tra Supabase logs

### Quên mật khẩu
- Vào Vercel → Settings → Environment Variables
- Xem giá trị `NEXT_PUBLIC_ADMIN_PASSWORD`
- Hoặc đổi mật khẩu mới và redeploy

---

Có vấn đề? Check console log (F12) hoặc xem Vercel deployment logs!
