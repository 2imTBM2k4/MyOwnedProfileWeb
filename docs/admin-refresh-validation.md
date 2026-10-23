# Đồng bộ giao diện quản trị

Giữ điều hướng ngang theo lựa chọn của Minh. Đăng nhập, năm mục quản lý, bốn cửa sổ thêm/sửa và công cụ chọn/cắt ảnh dùng màu và kiểu chữ của trang giới thiệu. Màu được chia sẻ qua `theme.module.css`; không đổi API, cơ sở dữ liệu hoặc cấu trúc thông tin lưu.

Thiết kế tham chiếu Achromatic ledger, seed 273513524, giữ bảng màu và kiểu chữ có sẵn theo yêu cầu. Điều hướng ngang thay cho thanh bên của tài liệu tham chiếu. Giao diện ưu tiên câu hỏi: Minh cần cập nhật nội dung nào? Dùng tên silentboiz, dữ liệu dự án và thiết bị hiện có; không thêm chỉ số hoặc nội dung minh họa vào sản phẩm.

## Kiểm tra đã đạt

Lệnh `.taste-skill/profile-refresh/admin-check.mjs` chạy trong Chrome với toàn bộ yêu cầu API được chặn và thay bằng dữ liệu kiểm tra. Không dùng mật khẩu thật, không ghi hay xóa dữ liệu thật.

- Đăng nhập sai có thông báo lỗi; đăng nhập đúng mở trang quản trị; đăng xuất trở về đăng nhập.
- Lưu hồ sơ gửi đúng tên và dữ liệu đang chỉnh sửa.
- Cả năm mục quản lý mở được; cả bốn cửa sổ thêm/sửa hiển thị và hủy được.
- Chỉnh sửa thiết bị giữ dữ liệu hiện tại; đổi tên vẫn giữ thương hiệu trong yêu cầu cập nhật.
- Bỏ trống tên thiết bị không thể gửi; thêm thiết bị có tên tạo đúng yêu cầu.
- Biểu mẫu sửa dự án, trò chơi và liên kết được điền sẵn bằng dữ liệu hiện tại.
- Công cụ cắt ảnh mở bằng ảnh cục bộ, điều khiển vừa màn hình 320 × 640 và hủy được.
- Sáng/tối ở 1440, 768, 390 và 320 px không tràn ngang toàn trang. Bảng cuộn trong khung riêng, điều hướng ngang cuộn trong hàng riêng.
- Cả bốn cửa sổ nhập liệu nằm trong màn hình 320 × 640; nội dung dài cuộn bên trong cửa sổ.
- Không có lỗi JavaScript chưa xử lý trong các luồng được thử.

Kiểm tra cuộn trang thiết bị cũng đạt: về đầu trang có chuyển động và kết thúc tại 0, điều hướng chữ đậm không gạch chân, nền mờ, lưới 4/2/1 cột, liên kết hỗ trợ bàn phím tức thời.

Bản dựng Next.js đã biên dịch, kiểm tra kiểu và tạo đủ 17 trang. Bản dựng kiểm tra dùng thư mục riêng để không dùng chung đầu ra với máy chủ phát triển. Không đổi cấu hình dự án sau kiểm tra.

## Rà soát giao diện

Đã xem ảnh máy tính, máy tính bảng, điện thoại, đăng nhập, cửa sổ dự án và công cụ cắt ảnh. Công cụ kiểm tra giao diện báo 0 lỗi. Hai cảnh báo trên trang danh sách: khoảng trống dưới danh sách chỉ có hai dự án thật và nhiều chữ phụ ở 12px. Giữ nguyên số dự án; chữ phụ dùng cho mô tả, liên kết và trạng thái, tên dự án và điều hướng lớn hơn. Kiểm tra mã nguồn báo 0 lỗi; cảnh báo bóng đổ gồm các khai báo xóa bóng và bóng của danh sách nổi; các dấu phân chia còn lại thuộc chú thích mã nguồn.

Rà soát độc lập không phát hiện lỗi phát sinh quan trọng. Đã sửa biểu tượng tải ảnh đại diện thành màu trắng trên lớp phủ tối để rõ trong chế độ sáng.

Chưa kiểm tra Safari hoặc điện thoại thật; chưa thử tải ảnh lên dịch vụ lưu trữ hay ghi dữ liệu thật. Những giới hạn sẵn có của hộp thoại về giữ tiêu điểm và công cụ tải ảnh bằng bàn phím không được thay đổi trong lượt đồng bộ giao diện này.
