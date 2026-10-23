# Đồng bộ danh sách thiết bị và tiến trình cuộn

Yêu cầu đã chốt: thêm tiến trình cuộn dưới thanh điều hướng, đồng bộ trang thiết bị với hồ sơ, tăng số món ở trang chủ để khi tới Thiết bị không lộ sớm liên hệ.

- Dùng lại thanh điều hướng, thêm chỉ báo theo tỷ lệ cuộn thực; cập nhật khi nội dung/màn hình thay đổi. Trên danh sách, liên kết quay về đúng mục của trang chủ và mục Thiết bị trỏ tới bộ sưu tập hiện tại.
- Hiện tối đa sáu món đang dùng trên trang chủ, ưu tiên các danh mục khác nhau. Giữ mục thiết bị đủ cao khi nhảy tới bằng điều hướng.
- Chỉnh `/gears` theo màu/chữ/khoảng cách và ảnh thiết bị đang dùng ở trang chủ. Giữ tìm kiếm, bộ lọc loại, thứ tự nhóm và ưu tiên món đang dùng. Phân biệt lỗi tải, danh sách rỗng và không có kết quả tìm kiếm.
- Kiểm tra tiến trình đầu/giữa/cuối trang, điều hướng tới thiết bị, lọc/tìm kiếm, dữ liệu rỗng/lỗi/sai cấu trúc, sáng/tối và các kích thước màn hình. Kiểm tra kiểu dữ liệu và bản dựng.

Không đổi đường dẫn chính `/gears`, không sửa dữ liệu hay phần quản trị, không thêm thư viện.

Đã hoàn thành và kiểm tra theo docs/profile-refresh-validation.md. Mẫu thử, ảnh chụp và kiểm tra trình duyệt ở `.taste-skill/profile-refresh/`.
