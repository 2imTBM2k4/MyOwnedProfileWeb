# Cuộn mượt, điều hướng nổi và chân trang lộ dần

Yêu cầu Minh: cuộn trang mềm hơn, tham khảo chân trang ssakib-portfolio và điều hướng melvinbiju. Giữ bố cục/nội dung hiện có, tiếp tục ẩn game.

- Gắn lại SmoothScroll vào trang chủ; dùng Lenis đã cài với autoRaf và điều hướng neo giữ lịch sử/tiêu điểm, bỏ vòng lặp cũ không dọn được đầy đủ. Không can thiệp quán tính cảm ứng. Tôn trọng giảm chuyển động.
- Thanh điều hướng mở rộng ở đầu trang, thu gọn thành thanh nổi cố định khi cuộn; liên kết hiện tại có trạng thái đang xem, không nhân đôi phần tử tương tác. Bố trí đủ bốn liên kết và nút sáng/tối trên điện thoại.
- Gom liên hệ và chân trang thành đoạn kết nền tối toàn chiều rộng, tên lớn phía dưới; phần nội dung phía trên che và mở dần đoạn kết khi cuộn trên màn hình đủ cao. Trên màn hình thấp và khi giảm chuyển động, dùng bố cục thường để không che mất nội dung.
- Kiểm tra chuột cuộn có quán tính, neo/link và lịch sử URL, chuyển dạng điều hướng, vùng chân trang mở dần, nội dung cuối không bị che, cảm ứng và giảm chuyển động. Chạy lại kiểm tra dữ liệu/chuyển động và bản dựng.

Không thêm thư viện, không sửa cơ sở dữ liệu hay các trang quản trị/game. Tham khảo hình thức và hành vi, không sao chép nội dung, phông hay tài sản riêng của trang mẫu.

Đã hoàn thành và kiểm tra. Đã tái hiện/sửa lỗi bù khoảng cách hai lần và lỗi tiêu điểm chân trang bị kéo lại khi quán tính còn chạy. Chi tiết trong docs/profile-refresh-validation.md.
