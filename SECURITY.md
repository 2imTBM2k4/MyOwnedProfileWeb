# 🔒 Bảo Mật - Security Guide

## Câu Hỏi: Mật Khẩu Có Thể Bị Hack Không?

**Trả lời ngắn gọn**: Với implementation hiện tại - **BẢO MẬT HƠN NHIỀU** so với trước, nhưng vẫn có thể bị tấn công nếu:
- Dùng mật khẩu yếu
- Không dùng HTTPS
- Bị XSS/CSRF attacks
- Bị brute force (chưa có rate limiting)

## 🛡️ Cải Tiến Bảo Mật (Version 2)

### ✅ Đã Cải Thiện

1. **Server-Side Password Check**
   - Mật khẩu được check ở server, không phải client
   - Không thể bypass bằng DevTools
   - Password không lộ trong browser

2. **HTTP-Only Cookies**
   - Token lưu trong HTTP-only cookie
   - Không thể đọc bằng JavaScript (chống XSS)
   - Tự động gửi kèm mọi request

3. **Middleware Protection**
   - API routes được bảo vệ bởi middleware
   - Chỉ admin đã login mới có thể POST/PATCH/DELETE
   - Public vẫn có thể GET (xem data)

4. **Environment Variable Đúng Cách**
   - Dùng `ADMIN_PASSWORD` (không có `NEXT_PUBLIC_`)
   - Chỉ tồn tại ở server-side
   - Không bao giờ gửi xuống client

5. **Session Management**
   - Cookie có expiry (24 giờ)
   - Secure flag trong production (HTTPS only)
   - SameSite=strict (chống CSRF)

### ⚠️ Vẫn Còn Điểm Yếu

1. **Không Có Rate Limiting**
   - Có thể brute force password
   - **Giải pháp**: Thêm rate limiting (giới hạn số lần thử)

2. **Không Có 2FA**
   - Chỉ có 1 lớp bảo mật (password)
   - **Giải pháp**: Thêm 2FA (Google Authenticator, SMS)

3. **Single Password**
   - Tất cả admin dùng chung 1 password
   - Không có user management
   - **Giải pháp**: Dùng Supabase Auth hoặc NextAuth.js

4. **Không Có Audit Log**
   - Không biết ai đã thay đổi gì, khi nào
   - **Giải pháp**: Log mọi thay đổi vào database

5. **Token Đơn Giản**
   - Chỉ là random string, không phải JWT
   - Không có signature verification
   - **Giải pháp**: Dùng JWT với secret key

## 📊 So Sánh: Trước vs Sau

| Tính Năng | Version 1 (Cũ) | Version 2 (Mới) |
|-----------|----------------|-----------------|
| Password check | ❌ Client-side | ✅ Server-side |
| Password lộ | ❌ Có (NEXT_PUBLIC_) | ✅ Không |
| Bypass bằng DevTools | ❌ Dễ dàng | ✅ Không thể |
| API protection | ❌ Không | ✅ Có (middleware) |
| Cookie security | ❌ SessionStorage | ✅ HTTP-only cookie |
| CSRF protection | ❌ Không | ✅ SameSite=strict |
| Session expiry | ❌ Không | ✅ 24 giờ |

## 🎯 Mức Độ Bảo Mật

### Version 2 (Hiện Tại)
**Mức độ**: ⭐⭐⭐☆☆ (3/5)

**Phù hợp cho**:
- ✅ Personal website/portfolio
- ✅ Small projects với 1-2 admin
- ✅ Non-critical data
- ✅ Learning/hobby projects

**KHÔNG phù hợp cho**:
- ❌ Production apps với nhiều users
- ❌ E-commerce sites
- ❌ Apps xử lý dữ liệu nhạy cảm
- ❌ Multi-tenant applications

## 🚀 Nâng Cấp Lên Production-Ready

Nếu bạn muốn bảo mật cấp production, cần:

### 1. Implement Proper Authentication

**Option A: Supabase Auth** (Recommended)
```bash
npm install @supabase/auth-helpers-nextjs
```
- Email/password login
- OAuth (Google, GitHub, etc.)
- Magic links
- Row Level Security tự động

**Option B: NextAuth.js**
```bash
npm install next-auth
```
- Nhiều providers (Google, GitHub, Credentials)
- Session management
- JWT tokens

**Option C: Clerk**
```bash
npm install @clerk/nextjs
```
- UI components có sẵn
- User management dashboard
- 2FA built-in

### 2. Add Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
})

// Check rate limit before password check
const { success } = await ratelimit.limit(ip)
if (!success) {
  return new Response('Too many requests', { status: 429 })
}
```

### 3. Use JWT Tokens

```typescript
import jwt from 'jsonwebtoken'

// Create token
const token = jwt.sign(
  { admin: true, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) },
  process.env.JWT_SECRET!
)

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET!)
```

### 4. Add Audit Logging

```sql
-- Create audit log table
create table audit_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  user_id text,
  ip_address text,
  created_at timestamp default now()
);
```

### 5. Enable HTTPS Only

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}
```

## 💡 Best Practices

### Mật Khẩu Mạnh
```
❌ Yếu: admin123, password, 123456
✅ Mạnh: Xk9$mP2#vL8@qR5!nT3
```

Dùng password generator: https://passwordsgenerator.net/

### Environment Variables
```bash
# ❌ KHÔNG làm thế này
NEXT_PUBLIC_ADMIN_PASSWORD=secret123

# ✅ Làm thế này
ADMIN_PASSWORD=Xk9$mP2#vL8@qR5!nT3
JWT_SECRET=random-256-bit-secret-key
```

### Vercel Environment Variables
1. Vào Settings → Environment Variables
2. Thêm `ADMIN_PASSWORD` (không có NEXT_PUBLIC_)
3. Chọn "Production", "Preview", "Development"
4. Redeploy

### Monitoring
- Check Vercel logs thường xuyên
- Set up alerts cho failed login attempts
- Monitor Supabase usage

## 🔍 Kiểm Tra Bảo Mật

### Test 1: Password Có Lộ Không?
```javascript
// Mở browser console (F12)
console.log(process.env.NEXT_PUBLIC_ADMIN_PASSWORD)
// Nếu thấy password → ❌ Không an toàn
// Nếu undefined → ✅ An toàn
```

### Test 2: Có Bypass Được Không?
```javascript
// Thử set authenticated = true trong DevTools
// Nếu vào được admin → ❌ Không an toàn
// Nếu vẫn bị redirect → ✅ An toàn
```

### Test 3: API Có Được Bảo Vệ Không?
```bash
# Thử POST mà không login
curl -X POST https://your-site.vercel.app/api/games \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'

# Nếu thành công → ❌ Không an toàn
# Nếu 401 Unauthorized → ✅ An toàn
```

## 📚 Tài Liệu Tham Khảo

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [NextAuth.js](https://next-auth.js.org/)

## ❓ FAQ

**Q: Có cần HTTPS không?**
A: CÓ! Không có HTTPS, password có thể bị đánh cắp qua network. Vercel tự động enable HTTPS.

**Q: Có nên dùng cho production không?**
A: Chỉ nên dùng cho personal projects. Production cần authentication service thực sự.

**Q: Làm sao biết bị hack?**
A: Check Vercel logs, Supabase logs. Nếu thấy data thay đổi lạ → có thể bị hack.

**Q: Bị hack thì làm gì?**
A: 
1. Đổi password ngay
2. Check Supabase logs xem data nào bị thay đổi
3. Restore từ backup nếu cần
4. Upgrade lên authentication service thực sự

---

**Kết luận**: Version 2 an toàn hơn NHIỀU so với version 1, đủ cho personal website. Nhưng nếu làm production app, nên dùng Supabase Auth hoặc NextAuth.js!
