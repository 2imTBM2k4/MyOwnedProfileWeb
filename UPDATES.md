# 🎮 Updates & Improvements

## ✨ Những thay đổi mới nhất

### 1. 🔧 Sửa ZZZ Stats không hiển thị

**Vấn đề:** Game Zenless Zone Zero không hiển thị stats từ HoYoLAB

**Giải pháp:**

- ✅ Thêm logging để debug raw API response
- ✅ Thêm nhiều fields hơn: `level`, `world_level`, `shiyu_defense`, `bangboo`
- ✅ Sử dụng `achievement_count` thay vì `achievement_num` (field name khác)
- ✅ Cập nhật component HoYoStats để hiển thị stats ZZZ-specific

**Stats hiển thị cho ZZZ:**

- Level
- Characters
- Bangboo (ZZZ-specific)
- Achievements
- Days Active
- Shiyu Defense (ZZZ-specific endgame content)

**Debug:**
Nếu vẫn không hiển thị, check server logs để xem raw stats:

```bash
npm run dev
# Trong console sẽ thấy: "ZZZ raw stats: {...}"
```

---

### 2. 🖼️ RAWG Image Picker trong Admin Panel

**Tính năng mới:** Preview và chọn ảnh game từ RAWG database khi add/edit game

**Cách hoạt động:**

#### A. Tự động search

Khi bạn nhập tên game, RAWG Image Picker tự động search và hiển thị kết quả

#### B. Grid preview

- Hiển thị 4-10 ảnh từ RAWG
- Mỗi ảnh có:
  - Game name
  - Rating (⭐)
  - Release year
- Hover để xem thông tin chi tiết

#### C. Chọn ảnh

- Click vào ảnh để chọn
- Ảnh được chọn có border xanh + checkmark
- Preview ảnh đã chọn ở dưới

#### D. Tích hợp với form

- Ảnh được chọn tự động điền vào `image_url`
- Có thể upload ảnh thủ công hoặc chọn từ RAWG
- Có thể paste URL trực tiếp

**Ví dụ sử dụng:**

```
1. Admin Panel → Games → Add Game
2. Chọn Platform: "None" (manual)
3. Nhập Title: "Honkai: Star Rail"
4. Scroll xuống "Ảnh bìa"
5. Phần "Chọn ảnh từ RAWG Database" tự động search
6. Click vào ảnh đẹp nhất
7. Save → Ảnh tự động hiển thị trên homepage!
```

**UI/UX Features:**

- ✅ Auto-search khi nhập tên game
- ✅ Manual search với search bar
- ✅ Loading spinner khi đang fetch
- ✅ Error handling với message rõ ràng
- ✅ Selected indicator (checkmark + border)
- ✅ Preview ảnh đã chọn
- ✅ Responsive grid (2-4 columns)
- ✅ Hover effects với game info

---

## 🎯 Cách sử dụng

### Sửa ảnh game HSR (hoặc bất kỳ game nào)

**Bước 1:** Vào Admin Panel

```
http://localhost:3000/admin
```

**Bước 2:** Tab Games → Find game HSR → Click Edit

**Bước 3:** Scroll xuống "Ảnh bìa"

**Bước 4:** Trong phần "Chọn ảnh từ RAWG Database":

- Nếu đã có kết quả → Click vào ảnh đẹp hơn
- Nếu chưa có → Click search button hoặc nhập tên khác

**Bước 5:** Click "Update"

**Bước 6:** Refresh homepage → Ảnh mới hiển thị! ✨

---

### Test ZZZ Stats

**Bước 1:** Đảm bảo có HoYoLAB credentials trong `.env.local`:

```env
HOYOLAB_LTOKEN=your-ltoken-here
HOYOLAB_LTUID=your-ltuid-here
```

**Bước 2:** Vào Admin → Games → Edit ZZZ game

**Bước 3:** Đảm bảo có:

- HoYoLAB Game: `zzz`
- UID: Your ZZZ UID
- Server: Correct server (Asia, America, Europe, TW/HK/MO)

**Bước 4:** Save và check homepage

**Bước 5:** Nếu không hiển thị, check server console:

```bash
# Terminal sẽ show:
ZZZ raw stats: {"level":50,"avatar_num":15,...}
```

**Bước 6:** Nếu thấy data nhưng không hiển thị → Field names có thể khác

- Copy raw stats từ console
- Báo cho dev để update field mapping

---

## 🐛 Troubleshooting

### ZZZ Stats không hiển thị

**Check 1:** HoYoLAB credentials đúng chưa?

```bash
# Test API trực tiếp:
curl "http://localhost:3000/api/hoyolab?game=zzz&uid=YOUR_UID&server=prod_gf_asia"
```

**Check 2:** UID và Server đúng chưa?

- ZZZ servers:
  - `prod_gf_asia` - Asia
  - `prod_gf_us` - America
  - `prod_gf_eu` - Europe
  - `prod_gf_jp` - TW/HK/MO

**Check 3:** Privacy settings trên HoYoLAB

- Vào [HoYoLAB](https://www.hoyolab.com/)
- Settings → Privacy
- Đảm bảo "Show my game data" = ON

### RAWG Image Picker không hoạt động

**Check 1:** RAWG API key đã thêm chưa?

```env
RAWG_API_KEY=your-key-here
```

**Check 2:** Dev server đã restart chưa?

```bash
# Stop server (Ctrl+C)
npm run dev
```

**Check 3:** Tên game có chính xác không?

- Thử search với tên tiếng Anh
- Ví dụ: "Genshin Impact" thay vì "原神"

**Check 4:** Check browser console

```
F12 → Console → Xem có lỗi không
```

### Ảnh từ RAWG bị lỗi/không load

**Nguyên nhân:** URL ảnh từ RAWG có thể expire hoặc bị block

**Giải pháp:**

1. Upload ảnh thủ công vào Supabase Storage
2. Hoặc paste URL ảnh từ nguồn khác
3. Hoặc search lại trên RAWG (có thể có ảnh mới)

---

## 📊 So sánh trước/sau

### Trước:

- ❌ ZZZ không có stats
- ❌ Phải tìm ảnh game thủ công
- ❌ Phải upload từng ảnh
- ❌ Không biết ảnh nào đẹp nhất

### Sau:

- ✅ ZZZ hiển thị đầy đủ stats
- ✅ Tự động search ảnh từ RAWG
- ✅ Preview nhiều ảnh để chọn
- ✅ Chọn ảnh đẹp nhất trong vài giây

---

## 🎨 Screenshots

### RAWG Image Picker

```
┌─────────────────────────────────────┐
│ Search: Honkai: Star Rail    [🔍]  │
├─────────────────────────────────────┤
│ Found 8 results. Click to select:  │
│                                     │
│ [img1] [img2] [img3] [img4]        │
│ [img5] [img6] [img7] [img8]        │
│                                     │
│ ✓ Image selected                   │
│ [preview of selected image]        │
└─────────────────────────────────────┘
```

### ZZZ Stats Display

```
┌─────────────────────────────┐
│ ZENLESS ZONE ZERO          │
│ SilentBoiz · 1234567890    │
├─────────────────────────────┤
│   50      15      120       │
│  Level  Chars  Bangboo     │
│                             │
│   450     180     12-3      │
│ Achieve  Days  Shiyu Def   │
└─────────────────────────────┘
```

---

## 💡 Tips

### Chọn ảnh đẹp cho game

1. **Ưu tiên key art** - Ảnh chính thức từ publisher
2. **Tránh screenshot** - Ảnh gameplay thường không đẹp
3. **Check rating** - Ảnh có rating cao thường đẹp hơn
4. **Aspect ratio** - Chọn ảnh landscape (ngang) cho đẹp

### Tối ưu performance

1. **Upload ảnh quan trọng** - Game yêu thích nên upload vào Supabase
2. **Dùng RAWG cho game phụ** - Game ít quan trọng dùng RAWG
3. **Cache** - Ảnh từ RAWG được cache 1 giờ

### Debug ZZZ Stats

1. **Check console logs** - Xem raw API response
2. **Test API trực tiếp** - Dùng curl/Postman
3. **Verify credentials** - Đảm bảo ltoken/ltuid đúng
4. **Check privacy** - HoYoLAB privacy settings

---

## 🚀 Next Steps

Sau khi test xong, bạn có thể:

1. ✅ Update tất cả game covers bằng RAWG
2. ✅ Verify ZZZ stats hiển thị đúng
3. ✅ Deploy lên Vercel với env vars mới
4. ✅ Enjoy your beautiful gaming profile! 🎮

---

**Có vấn đề gì không?** Check [RAWG_API.md](RAWG_API.md) và [README.md](README.md) để biết thêm chi tiết!
