# Tính năng sắp xếp và Publisher

## Các thay đổi đã thực hiện:

### 1. Thêm cột Publisher cho Games

- ✅ Tạo file SQL migration: `sql/add_publisher_field.sql`
- ✅ Cập nhật type `Game` trong `src/app/admin/page.tsx`
- ✅ Cập nhật type `Game` trong `src/app/page.tsx`
- ✅ Thêm trường `publisher` vào form thêm/sửa game
- ✅ Cập nhật `handleGameSubmit`, `openAddGame`, `editGame` để xử lý publisher
- ✅ **TỰ ĐỘNG ĐIỀN PUBLISHER theo platform:**
  - **Steam** → Publisher = "Steam"
  - **HoYoLAB** → Publisher = "HoYoverse"
  - **Không có platform** → Nhập thủ công
  - Có thể chỉnh sửa publisher sau khi tự động điền

### 2. Sắp xếp trong Admin Panel

#### Bảng Gears:

- ✅ Thêm nút sắp xếp cho cột **Name** (A-Z / Z-A)
- ✅ Thêm nút sắp xếp cho cột **Brand** (A-Z / Z-A)
- ✅ Icon hiển thị trạng thái sắp xếp (ArrowUp, ArrowDown, ArrowUpDown)
- ✅ Click vào header để toggle giữa ascending/descending

#### Bảng Games:

- ✅ Thêm cột **Publisher** vào bảng
- ✅ Thêm nút sắp xếp cho cột **Title** (A-Z / Z-A)
- ✅ Thêm nút sắp xếp cho cột **Publisher** (A-Z / Z-A)
- ✅ Icon hiển thị trạng thái sắp xếp
- ✅ Click vào header để toggle giữa ascending/descending

### 3. Sắp xếp tự động ở trang chính

- ✅ Cập nhật API `/api/games` để sắp xếp theo `created_at` (mới nhất trước)
- ✅ Cập nhật API `/api/gears` để sắp xếp theo `created_at` (mới nhất trước)
- ✅ Games và gears sẽ hiển thị theo thứ tự thêm vào (mới nhất trước)

## Cách sử dụng:

### Chạy SQL Migration:

1. Mở Supabase Dashboard
2. Vào SQL Editor
3. Chạy nội dung file `sql/add_publisher_field.sql`:
   ```sql
   ALTER TABLE games ADD COLUMN IF NOT EXISTS publisher TEXT;
   ```

### Thêm game với Publisher tự động:

#### Thêm game Steam:

1. Vào tab **Games** trong Admin
2. Click **Add Game**
3. Chọn Platform = **Steam**
4. Tìm và chọn game từ Steam
5. ✨ **Publisher tự động = "Steam"**
6. Có thể chỉnh sửa publisher nếu muốn
7. Save

#### Thêm game HoYoLAB:

1. Vào tab **Games** trong Admin
2. Click **Add Game**
3. Chọn Platform = **HoYoLAB**
4. Chọn game (Genshin Impact, Honkai: Star Rail, etc.)
5. ✨ **Publisher tự động = "HoYoverse"**
6. Có thể chỉnh sửa publisher nếu muốn
7. Nhập UID và Server
8. Save

#### Thêm game thủ công:

1. Vào tab **Games** trong Admin
2. Click **Add Game**
3. Chọn Platform = **Không có**
4. Nhập Title
5. Nhập Publisher thủ công (tùy chọn)
6. Save

### Sử dụng tính năng sắp xếp:

1. Vào trang Admin (`/admin`)
2. Chọn tab **Gears** hoặc **Games**
3. Click vào header cột (Name, Brand, Title, Publisher) để sắp xếp
4. Click lại để đảo ngược thứ tự sắp xếp
5. Icon mũi tên sẽ hiển thị trạng thái sắp xếp hiện tại

## Technical Details:

### Auto-fill Publisher Logic:

#### Platform Change:

```typescript
// Khi chọn platform
if (platform === "steam") {
  publisher = "Steam";
} else if (platform === "hoyolab") {
  publisher = "HoYoverse";
}
```

#### Steam Game Selection:

```typescript
// Khi chọn game từ Steam search
{
  title: gameName,
  steam_appid: appid,
  publisher: "Steam",  // Auto-filled
}
```

#### HoYoLAB Game Selection:

```typescript
// Khi chọn HoYoLAB game
const HOYO_INFO = {
  genshin: { title: "Genshin Impact", publisher: "HoYoverse" },
  hsr: { title: "Honkai: Star Rail", publisher: "HoYoverse" },
  // ...
};
```

### State Management:

- `gearSortField`: Lưu cột đang sắp xếp cho gears (name | brand | null)
- `gearSortDirection`: Lưu hướng sắp xếp (asc | desc)
- `gameSortField`: Lưu cột đang sắp xếp cho games (title | publisher | null)
- `gameSortDirection`: Lưu hướng sắp xếp (asc | desc)

### Functions:

- `handleGearSort(field)`: Xử lý click vào header gears
- `handleGameSort(field)`: Xử lý click vào header games
- `getSortedGears()`: Trả về mảng gears đã sắp xếp
- `getSortedGames()`: Trả về mảng games đã sắp xếp
- `getSortIcon(field, currentField, direction)`: Hiển thị icon phù hợp

### Icons:

- `ArrowUpDown`: Cột chưa được sắp xếp (opacity 40%)
- `ArrowUp`: Đang sắp xếp tăng dần (A-Z)
- `ArrowDown`: Đang sắp xếp giảm dần (Z-A)

## Lưu ý:

- Sắp xếp không phân biệt chữ hoa/thường (case-insensitive)
- Sử dụng `localeCompare` để sắp xếp đúng với tiếng Việt
- Giá trị null được xử lý như chuỗi rỗng
- Trang chính luôn hiển thị theo thứ tự thêm vào (created_at DESC)
- Publisher tự động điền nhưng có thể chỉnh sửa thủ công
- Khi edit game, publisher hiện tại được giữ nguyên
