# RAWG API Integration

## 🎮 Tổng quan

RAWG API được tích hợp để **tự động lấy ảnh bìa game** khi bạn thêm game mới mà không có ảnh. API này hoàn toàn miễn phí và có database game rất lớn (hơn 500,000 games).

## ✨ Tính năng

- ✅ **Tự động fetch ảnh bìa** cho game không có ảnh
- ✅ **Fallback thông minh**: Nếu không tìm thấy trên RAWG, hiển thị icon mặc định
- ✅ **Loading state**: Hiển thị spinner khi đang fetch
- ✅ **Cache**: Kết quả được cache 1 giờ để tối ưu performance
- ✅ **Miễn phí**: 20,000 requests/tháng (quá đủ cho personal site)

## 🔑 Cách lấy API Key

1. Truy cập [https://rawg.io/apidocs](https://rawg.io/apidocs)
2. Click **"Get API Key"**
3. Đăng ký tài khoản (miễn phí)
4. Điền form thông tin developer (chỉ mất vài giây)
5. Copy API key ở cuối trang
6. Thêm vào `.env.local`:
   ```env
   RAWG_API_KEY=your-api-key-here
   ```

## 🚀 Cách hoạt động

### 1. Component `GameCover`

Component này tự động:

- Kiểm tra xem game có `image_url` không
- Nếu có → hiển thị ảnh đó
- Nếu không → gọi RAWG API để tìm ảnh
- Nếu không tìm thấy → hiển thị icon game mặc định

```tsx
<GameCover
  title="Genshin Impact"
  imageUrl={game.image_url}
  className="w-full h-28"
/>
```

### 2. API Endpoint `/api/games/search-rawg`

Endpoint này:

- Nhận `query` parameter (tên game)
- Search trên RAWG database
- Trả về top 10 kết quả với ảnh, rating, platforms, v.v.

**Example:**

```bash
GET /api/games/search-rawg?query=genshin+impact
```

**Response:**

```json
{
  "count": 1,
  "results": [
    {
      "id": 452638,
      "name": "Genshin Impact",
      "image": "https://media.rawg.io/media/games/...",
      "released": "2020-09-28",
      "rating": 4.5,
      "platforms": ["PC", "PlayStation 5", "iOS", "Android"]
    }
  ]
}
```

### 3. Fallback System

Hệ thống fallback 3 tầng:

1. **Database** → Ảnh đã upload trong Supabase
2. **RAWG API** → Tự động fetch từ RAWG
3. **Default Icon** → Icon game mặc định

## 📊 Giới hạn & Performance

### Free Tier Limits

- **20,000 requests/month**
- **5 requests/second**
- Không cần credit card

### Caching Strategy

- API responses được cache **1 giờ** (Next.js revalidate)
- Giảm số lượng requests đáng kể
- Với 100 games, chỉ cần ~100 requests (dưới 1% quota)

### Performance

- ⚡ First load: ~200-500ms (fetch từ RAWG)
- ⚡ Cached: ~10-50ms (từ Next.js cache)
- ⚡ Parallel loading: Tất cả ảnh load đồng thời

## 🎯 Use Cases

### 1. Thêm game mới không có ảnh

```
Admin Panel → Add Game → Nhập tên "Honkai: Star Rail"
→ Không upload ảnh
→ Save
→ Trang chủ tự động fetch ảnh từ RAWG ✨
```

### 2. Game miHoYo

Tất cả game miHoYo đều có trên RAWG:

- ✅ Genshin Impact
- ✅ Honkai: Star Rail
- ✅ Honkai Impact 3rd
- ✅ Zenless Zone Zero

### 3. Bulk import

Nếu bạn có nhiều game cần thêm:

1. Thêm tất cả game (chỉ cần tên)
2. Không cần upload ảnh thủ công
3. RAWG API tự động fetch tất cả

## 🔧 Troubleshooting

### Ảnh không hiển thị?

**Kiểm tra:**

1. ✅ RAWG_API_KEY đã được thêm vào `.env.local`?
2. ✅ Dev server đã restart sau khi thêm env var?
3. ✅ Tên game có chính xác không? (RAWG search theo tên)
4. ✅ Check browser console có lỗi không?

### API key không hoạt động?

**Thử:**

1. Verify API key trên [RAWG dashboard](https://rawg.io/apidocs)
2. Check quota còn lại (20,000/month)
3. Đảm bảo không có space thừa trong `.env.local`

### Game không tìm thấy trên RAWG?

**Giải pháp:**

1. Upload ảnh thủ công trong Admin Panel
2. Hoặc paste URL ảnh trực tiếp
3. Component sẽ ưu tiên dùng ảnh từ database

## 🎨 Customization

### Thay đổi số lượng kết quả

```typescript
// src/app/api/games/search-rawg/route.ts
const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${query}&page_size=20`; // Thay 10 → 20
```

### Thay đổi cache time

```typescript
// src/app/api/games/search-rawg/route.ts
next: {
  revalidate: 7200;
} // 2 hours thay vì 1 hour
```

### Thêm filter (platform, genre, v.v.)

```typescript
const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${query}&platforms=4,187`; // PC + PlayStation
```

## 📚 RAWG API Documentation

Xem thêm tại: [https://rawg.io/apidocs](https://rawg.io/apidocs)

**Các endpoint hữu ích:**

- `/games` - Search games
- `/games/{id}` - Get game details
- `/games/{id}/screenshots` - Get screenshots
- `/platforms` - List platforms
- `/genres` - List genres

## 💡 Tips

1. **Tên game chính xác** → Kết quả tốt hơn
2. **Upload ảnh thủ công** → Nhanh hơn và chính xác hơn cho game quan trọng
3. **Monitor quota** → Check usage trên RAWG dashboard
4. **Fallback images** → Luôn có trong `src/lib/game-covers.ts` cho game phổ biến

---

**Tóm lại:** RAWG API giúp bạn tiết kiệm thời gian không phải tìm và upload ảnh thủ công cho mỗi game! 🎮✨
