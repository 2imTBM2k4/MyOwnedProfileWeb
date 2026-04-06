# Hướng Dẫn Deploy Lên Vercel

## Chuẩn Bị

✅ Đã có tài khoản GitHub  
✅ Đã có tài khoản Vercel (đăng ký miễn phí tại [vercel.com](https://vercel.com))  
✅ Code đã chạy được trên local (`npm run dev`)  
✅ Đã setup Supabase xong  git 

## Bước 1: Push Code Lên GitHub

```bash
# Khởi tạo git (nếu chưa có)
git init

# Add tất cả files
git add .

# Commit
git commit -m "Ready to deploy"

# Tạo repository mới trên GitHub, sau đó:
git remote add origin https://github.com/username/your-repo-name.git
git branch -M main
git push -u origin main
```

## Bước 2: Import Vào Vercel

1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập bằng GitHub
3. Click **"Add New"** → **"Project"**
4. Chọn repository vừa push lên GitHub
5. Click **"Import"**

## Bước 3: Cấu Hình Environment Variables

Trong màn hình "Configure Project":

1. Mở rộng phần **"Environment Variables"**
2. Thêm 3 biến:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxx.supabase.co (copy từ Supabase)

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: eyJxxx... (copy từ Supabase → Settings → API)

Name: ADMIN_PASSWORD
Value: MatKhauCuaBan123! (chọn mật khẩu mạnh)
```

⚠️ **Quan trọng**: Dùng `ADMIN_PASSWORD` (KHÔNG phải `NEXT_PUBLIC_ADMIN_PASSWORD`) để bảo mật hơn!

3. Click **"Deploy"**

## Bước 4: Đợi Deploy Xong

- Vercel sẽ build và deploy tự động (khoảng 1-2 phút)
- Khi xong, bạn sẽ thấy 🎉 và link website
- Link sẽ có dạng: `https://your-project.vercel.app`

## Bước 5: Kiểm Tra

✅ Mở link website  
✅ Kiểm tra trang chủ hiển thị đúng  
✅ Vào `/admin` để test CRUD  
✅ Nhập mật khẩu để login vào admin panel  
✅ Test upload ảnh  
✅ Test trên mobile  

## Truy Cập Admin Panel

Sau khi deploy xong, truy cập admin tại:
```
https://your-project.vercel.app/admin
```

Bạn sẽ thấy màn hình login. Nhập mật khẩu bạn đã set trong `NEXT_PUBLIC_ADMIN_PASSWORD`.

**Mật khẩu mặc định** (nếu không set): `admin123`

⚠️ **Quan trọng**: Đổi mật khẩu mặc định ngay!

### Bảo Mật Mới (Version 2)

✅ Mật khẩu được check ở server (không thể bypass bằng DevTools)  
✅ Dùng HTTP-only cookies (bảo vệ khỏi XSS)  
✅ API routes được bảo vệ bởi middleware  
✅ Mật khẩu không bao giờ lộ ra client  
✅ Session tự động hết hạn sau 24 giờ  

**Mức độ bảo mật**: ⭐⭐⭐☆☆ (3/5) - Tốt cho personal website

Chi tiết về bảo mật: Xem file [SECURITY.md](SECURITY.md)

### Đổi Mật Khẩu Admin

1. Vào Vercel Dashboard → Project của bạn
2. Click **Settings** → **Environment Variables**
3. Tìm `ADMIN_PASSWORD` (KHÔNG phải `NEXT_PUBLIC_ADMIN_PASSWORD`)
4. Click **Edit** → Nhập mật khẩu mới
5. Click **Save**
6. **Redeploy** project (Deployments → ... → Redeploy)

### Quên Mật Khẩu?

Nếu quên mật khẩu:
1. Vào Vercel → Settings → Environment Variables
2. Xem giá trị của `ADMIN_PASSWORD`
3. Hoặc đổi sang mật khẩu mới và redeploy

## Kiểm Tra Bảo Mật

### Test 1: Password có lộ không?
Mở browser console (F12) và gõ:
```javascript
console.log(process.env.NEXT_PUBLIC_ADMIN_PASSWORD)
```
- Nếu thấy password → ❌ Không an toàn
- Nếu `undefined` → ✅ An toàn

### Test 2: API có được bảo vệ không?
Thử gọi API mà không login:
```bash
curl -X POST https://your-site.vercel.app/api/games \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'
```
- Nếu thành công → ❌ Không an toàn
- Nếu 401 Unauthorized → ✅ An toàn  

## Cập Nhật Sau Này

Mỗi khi bạn push code mới lên GitHub:

```bash
git add .
git commit -m "Update something"
git push
```

Vercel sẽ **tự động deploy** lại! Không cần làm gì thêm.

## Xem Logs & Debug

1. Vào [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click vào project của bạn
3. Click tab **"Deployments"** để xem lịch sử
4. Click vào deployment → **"View Function Logs"** để xem logs

## Custom Domain (Tùy Chọn)

Nếu bạn có domain riêng (vd: `silentboiz.com`):

1. Vào project trong Vercel
2. Click tab **"Settings"** → **"Domains"**
3. Thêm domain của bạn
4. Làm theo hướng dẫn để cấu hình DNS

## Lỗi Thường Gặp

### ❌ Build Failed
- Kiểm tra lại code có chạy được local không (`npm run build`)
- Xem logs trong Vercel để biết lỗi cụ thể

### ❌ Environment Variables Không Hoạt Động
- Đảm bảo đã thêm đủ 2 biến trong Vercel
- Tên biến phải đúng: `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Sau khi thêm/sửa env vars, phải **Redeploy** lại

### ❌ Upload Ảnh Không Được
- Kiểm tra Supabase Storage buckets đã tạo chưa
- Đảm bảo buckets là **Public**
- Tên buckets phải đúng: `avatars`, `covers`, `gears`, `games`

### ❌ Database Lỗi
- Kiểm tra RLS policies trong Supabase
- Đảm bảo đã chạy đủ SQL commands trong README

## Tips

💡 **Preview Deployments**: Mỗi branch khác `main` sẽ có preview URL riêng  
💡 **Rollback**: Có thể rollback về deployment cũ trong tab Deployments  
💡 **Analytics**: Vercel cung cấp analytics miễn phí  
💡 **Free Plan**: Vercel free plan đủ cho personal projects  

---

Chúc bạn deploy thành công! 🚀
