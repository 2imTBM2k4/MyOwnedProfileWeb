# 🐛 Debug ZZZ Stats Issue

## Lỗi hiện tại

```
GET http://localhost:3000/api/hoyolab?game=zzz&uid=1302305798&server=prod_gf_asia 500 (Internal Server Error)
HoYoStats error: Failed to fetch HoYoLAB data
```

## Các bước debug

### 1. Check Server Terminal

Mở terminal đang chạy `npm run dev` và tìm log chi tiết:

```bash
# Sẽ thấy một trong các log sau:
HoYoLAB ZZZ response: {...}
HoYoLAB ZZZ error details: {...}
HoYoLAB fetch error: ...
```

### 2. Test API trực tiếp

Mở browser hoặc dùng curl:

```bash
# Thay YOUR_UID bằng UID ZZZ của bạn
curl "http://localhost:3000/api/hoyolab?game=zzz&uid=YOUR_UID&server=prod_gf_asia"
```

**Expected response nếu thành công:**

```json
{
  "enabled": true,
  "game": "zzz",
  "uid": "1302305798",
  "server": "prod_gf_asia",
  "cached": false,
  "data": {
    "level": 50,
    "characters": 15,
    "achievements": 120,
    ...
  }
}
```

**Expected response nếu lỗi:**

```json
{
  "error": "HoYoLAB API error",
  "retcode": 10001
}
```

### 3. Check Environment Variables

Đảm bảo có trong `.env.local`:

```env
HOYOLAB_LTOKEN=v2_CANARSIA...
HOYOLAB_LTUID=123456789
```

**Cách lấy ltoken và ltuid:**

1. Vào [HoYoLAB](https://www.hoyolab.com/)
2. Login
3. F12 → Application → Cookies → `https://www.hoyolab.com`
4. Tìm:
   - `ltoken_v2` → Copy value
   - `ltuid_v2` → Copy value
5. Paste vào `.env.local`
6. Restart dev server

### 4. Check UID và Server

**ZZZ Servers:**

- `prod_gf_asia` - Asia
- `prod_gf_us` - America
- `prod_gf_eu` - Europe
- `prod_gf_jp` - TW/HK/MO

**Cách check UID đúng:**

1. Mở game ZZZ
2. Settings → Account
3. Copy UID (10 chữ số)

### 5. Check Privacy Settings

1. Vào [HoYoLAB](https://www.hoyolab.com/)
2. Profile → Settings → Privacy
3. Đảm bảo **"Show my game data"** = ON
4. Đảm bảo **"Show my battle chronicle"** = ON

### 6. Common Error Codes

| Retcode | Meaning             | Solution                |
| ------- | ------------------- | ----------------------- |
| 10001   | Invalid credentials | Check ltoken/ltuid      |
| 10102   | Data not public     | Enable privacy settings |
| -1      | Invalid UID         | Check UID is correct    |
| 1009    | Account not found   | Check server region     |

### 7. Test với game khác

Nếu ZZZ không work, thử với Genshin hoặc HSR:

```bash
# Test Genshin
curl "http://localhost:3000/api/hoyolab?game=genshin&uid=YOUR_GENSHIN_UID&server=os_asia"

# Test HSR
curl "http://localhost:3000/api/hoyolab?game=hsr&uid=YOUR_HSR_UID&server=prod_official_asia"
```

Nếu các game khác work → Vấn đề specific với ZZZ
Nếu tất cả đều fail → Vấn đề với credentials

## Possible Issues

### Issue 1: ZZZ API endpoint khác

**Symptom:** Retcode 404 hoặc "endpoint not found"

**Solution:** Check endpoint URL trong `src/app/api/hoyolab/route.ts`:

```typescript
const ENDPOINTS: Record<string, string> = {
  zzz: "https://bbs-api-os.hoyolab.com/game_record/nap/api/index",
};
```

### Issue 2: Field names khác

**Symptom:** API success nhưng không hiển thị stats

**Solution:** Check server logs để xem raw data:

```
ZZZ raw stats: {"level":50,"avatar_num":15,...}
```

Nếu field names khác, update `formatStats()` function.

### Issue 3: DS signature sai

**Symptom:** Retcode 5003 hoặc "invalid signature"

**Solution:** DS salt có thể đã thay đổi. Check HoYoLAB community cho salt mới.

### Issue 4: Rate limit

**Symptom:** Retcode 429 hoặc "too many requests"

**Solution:** Đợi vài phút rồi thử lại. API có cache 1 giờ.

## Quick Fixes

### Fix 1: Clear cache và retry

```typescript
// Trong src/app/api/hoyolab/route.ts
// Tạm thời disable cache để test
const CACHE_TTL = 0; // Thay vì 60 * 60 * 1000
```

### Fix 2: Add more logging

```typescript
// Trong formatStats function
if (game === "zzz") {
  console.log("ZZZ raw stats:", JSON.stringify(raw.stats));
  console.log("ZZZ raw data keys:", Object.keys(raw));
  // ...
}
```

### Fix 3: Test với mock data

```typescript
// Tạm thời return mock data để test UI
if (game === "zzz") {
  return {
    level: 50,
    characters: 15,
    bangboo: 12,
    achievements: 120,
    days_active: 180,
    shiyu_defense: 10,
  };
}
```

## Next Steps

1. **Check server terminal** → Paste logs vào đây
2. **Test API trực tiếp** → Xem response
3. **Verify credentials** → ltoken/ltuid đúng chưa
4. **Check privacy** → Settings trên HoYoLAB
5. **Report back** → Paste error details để debug tiếp

---

**Cần help?** Paste server logs và API response vào chat!
