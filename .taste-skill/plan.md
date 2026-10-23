# Kế hoạch Tái thiết kế Giao diện Portfolio theo phong cách "The Dark Room" (Taste-Skill Frontend)

## Context (Bối cảnh)
- **Vấn đề:** Giao diện hiện tại mang phong cách Dark Glassmorphism thế hệ cũ với 64 lỗi lint theo tiêu chuẩn thiết kế thực tế (quá nhiều viền 1px, micro-labels hoa, số thứ tự 01/02, gradient blobs).
- **Mục tiêu:** Tái thiết kế toàn bộ trang chủ (`src/app/page.tsx`) trong một lượt theo phong cách đạt giải **"The Dark Room"** (seed 2024270080):
  - Bảng màu: Nền đêm sâu `#0a0d14`, bề mặt `#121824`, chữ bạc `#edf2f7`, điểm nhấn cornflower blue `#438bf7`.
  - Kiểu chữ: Display font `Erode` (wedge serif sắc sảo) kết hợp Sans font hiện đại, loại bỏ toàn bộ viền hộp 1px vụn vặt.
  - Bảo tồn 100% dữ liệu Supabase, Discord Lanyard, Steam Stats, bộ lọc thiết bị.

---

## Chi tiết các Task thực hiện (Thực hiện toàn bộ 1 lượt)

### Task 1: Nạp Font Erode & Thiết lập CSS Custom Properties
- Nạp font `Erode` từ Fontshare CDN vào `src/app/layout.tsx` hoặc `src/app/globals.css`.
- Khai báo các biến CSS trong `src/app/globals.css`:
  - `--bg: #0a0d14;`
  - `--surface: #121824;`
  - `--ink: #edf2f7;`
  - `--muted: #8492a6;`
  - `--accent: #438bf7;`
- Thiết lập font-family tiện ích cho tiêu đề display.

### Task 2: Tái thiết kế Hero Section & Danh tính cá nhân
- Tiêu đề lớn tự tin: `SILENTBOIZ · Backend Engineer`.
- Dòng mô tả chuyên môn súc tích, dứt khoát.
- Tích hợp trạng thái Discord Lanyard trực tiếp, trang nhã.
- Nút hành động chính (Primary Action) màu Cornflower Blue, nút phụ liên kết GitHub/LinkedIn.
- Bỏ các bóng mờ, đốm sáng phát quang và pill badge AI.

### Task 3: Tái thiết kế Section Dự án kỹ thuật (Work & Projects)
- Bố cục **"Big names, fixed preview"**:
  - Thẻ dự án nổi bật (Featured Project) trình bày như Architecture Brief (bản tóm tắt kiến trúc).
  - Danh sách dự án khác hiển thị tên lớn, năm, công nghệ và đường dẫn mã nguồn.

### Task 4: Tái thiết kế Section Thiết bị công nghệ (Gears Showcase)
- Trình bày như phòng trưng bày thiết bị công nghệ được chiếu sáng tinh tế:
  - Các món đang sử dụng (`active`) luôn chiếm vị trí ưu tiên đầu tiên.
  - Ảnh thiết bị sắc nét trên nền tối hòa sắc.
  - Giữ nguyên bộ lọc 3 tab: Tất cả, Bàn làm việc, Âm thanh (không có tag thừa Sưu tầm).
  - Nút chuyển tiếp sang `/gears`.

### Task 5: Tái thiết kế Section Gaming & Trải nghiệm (Steam & HoYoLab)
- Thống kê tự nhiên theo văn phong kỹ thuật ("Figures inside a sentence").
- Thẻ game với ảnh bìa tỷ lệ chuẩn, loại bỏ viền hộp vụn vặt.

### Task 6: Tái thiết kế Section Liên hệ & Chân trang (Contact & Footer)
- Danh thiếp số tối giản với tính năng copy email một chạm.
- Footer thanh lịch với tên thương hiệu lớn và năm hiện tại.

### Task 7: Kiểm thử & Đo lường với Taste-Skill
- Chạy `lint.mjs` từ Taste-Skill để đảm bảo tối thiểu hóa các lỗi thiết kế.
- Chạy `npm run build` để kiểm tra độ tin cậy 100% của TypeScript và route.
