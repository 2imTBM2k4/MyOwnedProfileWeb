# TÀI LIỆU CÁC PHƯƠNG ÁN THIẾT KẾ GIAO DIỆN (UI/UX DESIGN CONCEPTS)

Tài liệu này lưu lại các hướng thiết kế giao diện thị giác cho portfolio của Minh (`silentboiz`).

---

## Phương án 1: Modern Sleek Glass & Tech Aesthetics (Đang triển khai)
* **Phong cách:** Lấy cảm hứng từ Vercel, Linear, Stripe.
* **Chi tiết hiệu ứng:**
  - Nền lưới tọa độ `grid pattern` kết hợp hiệu ứng hào quang chuyển động chậm `ambient floating orbs`.
  - Khối điều khiển dòng lệnh `Interactive Terminal Widget` thời gian thực tại Hero (mô phỏng latency, uptime, tech stack, health check).
  - Hiệu ứng `Spotlight Hover` (vệt sáng chạy theo con trỏ chuột trên viền thẻ dự án/thiết bị).
  - Chữ tiêu đề phủ `Gradient Shimmer` tinh tế.
  - Tối ưu 100% bằng CSS/Tailwind nhẹ, không phụ thuộc thư viện nặng, hỗ trợ hoàn hảo Light & Dark mode.

---

## Phương án 2: Cyberpunk / Neo-Terminal Aesthetics (Dự phòng để chuyển đổi khi cần)
* **Ý tưởng cốt lõi:**
  - Biến toàn bộ giao diện thành một hệ điều hành trạm chỉ huy (Cyberpunk CLI / Mission Control).
  - Phù hợp với ai muốn tạo dấu ấn cực kỳ cá tính, phá cách, đậm chất hacker và sci-fi.
* **Chi tiết hiệu ứng cần triển khai nếu đổi sang:**
  1. **Bảng màu (Color Palette):**
     - Nền: Deep Obsidian `#050811` (xanh đen vũ trụ cực sâu).
     - Accent: Neon Cyan `#00f0ff`, Acid Lime `#39ff14`, Cyber Purple/Pink `#ff007f`.
  2. **Hiệu ứng thị giác (Visual FX):**
     - **CRT Scanlines:** Lớp sọc quét màn hình CRT bán trong suốt (`pointer-events: none`).
     - **Glitch Text Effect:** Hiệu ứng giật tín hiệu (glitch) ngẫu nhiên khi hover vào tên hoặc tiêu đề.
     - **Circuit Traces:** Các đường viền mạch điện tử (circuit lines) với chấm xung điện chạy dọc phân cách các phần.
     - **Monospace Dominance:** Sử dụng font `JetBrains Mono` hoặc `Fira Code` xuyên suốt từ tiêu đề đến nhãn nút bấm.
     - **HUD Brackets:** Góc các thẻ có dấu ngoặc `[ ]` hoặc góc cắt 45 độ kiểu khoa học viễn tưởng (`clip-path: polygon(...)`).
* **Đánh đổi (Trade-offs):**
  - Khó tối ưu trên chế độ Light mode (Cyberpunk phát huy vẻ đẹp nhất ở chế độ nền tối Dark mode).
  - Có thể hơi rối mắt nếu người xem chỉ muốn lướt nhanh xem thông tin liên hệ/dự án.
