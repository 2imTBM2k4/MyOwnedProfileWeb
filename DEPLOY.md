# Hướng Dẫn Deploy Lên Vercel

## Chuẩn Bị

✅ Đã có tài khoản GitHub  
✅ Đã có tài khoản Vercel (đăng ký miễn phí tại [vercel.com](https://vercel.com))  
✅ Code đã chạy được trên local (`npm run dev`)  
✅ Đã setup Supabase xong  

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
2. Thêm 2 biến:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxx.supabase.co (copy từ Supabase)

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: eyJxxx... (copy từ Supabase → Settings → API)
```

3. Click **"Deploy"**

## Bước 4: Đợi Deploy Xong

- Vercel sẽ build và deploy tự động (khoảng 1-2 phút)
- Khi xong, bạn sẽ thấy 🎉 và link website
- Link sẽ có dạng: `https://your-project.vercel.app`

## Bước 5: Kiểm Tra

✅ Mở link website  
✅ Kiểm tra trang chủ hiển thị đúng  
✅ Vào `/admin` để test CRUD  
✅ Test upload ảnh  
✅ Test trên mobile  

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
