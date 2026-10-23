# Kiểm tra giao diện hồ sơ — 23/10/2026

Trang chủ được chỉnh theo hướng hồ sơ lập trình viên, giữ một góc thiết bị cá nhân. Không sửa cơ sở dữ liệu từ xa, chức năng quản trị hay các trang game đang có.

## Kết quả kiểm tra

- `npm.cmd run build`: thành công trên mã cuối; tạo đủ 17 trang tĩnh, các đường dẫn game và trang thiết bị vẫn có trong kết quả.
- `node scripts/profile-content.test.mjs`: đạt. Kiểm tra ưu tiên dự án nổi bật, giữ thứ tự các dự án còn lại, không sửa mảng gốc, danh sách rỗng, loại thiết bị ngừng dùng, chọn ba danh mục thiết bị, chuẩn hóa địa chỉ thiếu HTTPS và từ chối giao thức nguy hiểm.
- Kiểm tra dữ liệu: từ chối phần tử null, nhãn chứa null, liên kết dạng số, ghi chú dạng đối tượng, địa chỉ ảnh dạng số; áp dụng cả dữ liệu mới và bộ nhớ phiên.
- Kiểm tra TypeScript: đạt, không phát hiện lỗi kiểu dữ liệu.
- Rà soát mã độc lập: vấn đề dữ liệu sai cấu trúc đã được sửa và kiểm tra lại; không phát hiện thêm lỗi nghiêm trọng trong phạm vi thay đổi.

13 nhóm kiểm tra trình duyệt đã đạt:

1. Dữ liệu thật hiển thị, chỉ có một tiêu đề chính, không có liên kết game/Steam/HoYoLab.
2. Không tràn ngang ở 1440, 768, 390 và 320 px; chụp cả chế độ sáng và tối.
3. Chỉ hiện thiết bị đang dùng; địa chỉ dự án thiếu giao thức được thêm HTTPS.
4. Bốn liên kết điều hướng đến đúng mục trên điện thoại.
5. Đổi chế độ sáng/tối cập nhật giao diện và lưu lựa chọn.
6. Sao chép email thành công hoặc bị từ chối đều hiển thị phản hồi đúng.
7. Danh sách rỗng hiển thị thông báo, không tạo nội dung giả.
8. Tải thất bại hiển thị lỗi; nút thử lại lấy được dữ liệu sau khi phục hồi.
9. Phản hồi sai cấu trúc báo lỗi, không làm hỏng trang.
10. Mảng chứa phần tử không hợp lệ bị từ chối; bộ nhớ phiên hỏng bị bỏ qua.
11. Làm mới thất bại vẫn giữ dự án đã lưu trong bộ nhớ phiên.
12. Khi người dùng giảm chuyển động, tiêu đề vẫn hiện đầy đủ và cuộn mượt được tắt.
13. Điều hướng bằng bàn phím bắt đầu bằng liên kết bỏ qua đến nội dung chính.

## Đánh giá hình thức

Đã mở các ảnh đầu trang và toàn trang ở 1440, 768, 390 px. Tên là điểm nhìn đầu tiên; dự án, giới thiệu, thiết bị và liên hệ có cấu trúc riêng. Ảnh thiết bị dùng dữ liệu hiện có của Minh; không thêm ảnh nguồn ngoài hay ảnh giả cho dự án. Phần nhận xét chỉ hiện khi thiết bị có ghi chú thật.

Hướng thiết kế: chữ làm trọng tâm, nền than và xanh lá nhạt; giữ hai phông sẵn có. Mã hướng thiết kế 1439448014. Bỏ hướng vật phẩm giấy ban đầu vì không phù hợp yêu cầu tiết chế.

Đánh giá tự chấm: thiết kế 7, khả năng sử dụng 8, sáng tạo 6, nội dung 7; tổng 7,1/10. Điểm còn yếu: dự án chưa có ảnh và mô tả DroneFood vẫn theo ngôn ngữ trong dữ liệu gốc. Nét cá nhân đến từ tên, ảnh đại diện, cách giới thiệu và bộ thiết bị thật; không dùng số liệu thành tích.

Công cụ đo hình thức: từ 15 lỗi ban đầu xuống 0 lỗi sau các ngoại lệ được ghi rõ: giữ phông hiện có; ba ảnh thiết bị và ảnh đại diện nhỏ thay vì thêm ảnh chỉ để đủ số lượng; bộ phát hiện nhãn hiểu nhầm liên kết của dự án trước là nhãn của dự án sau. Hai cảnh báo còn lại là nhiều cỡ chữ và không có video; giữ để đáp ứng giao diện gọn và dữ liệu hiện có. Đây không phải tuyên bố mọi tiêu chí mặc định của công cụ đều đạt mà không có ngoại lệ.

Ảnh kiểm tra và chương trình kiểm tra trình duyệt nằm trong `.taste-skill/profile-refresh/`.

## Giới hạn

Chưa kiểm tra trên điện thoại thật, trình đọc màn hình hay Safari. Chưa triển khai lên mạng. Không thực hiện thao tác ghi trong phần quản trị. Mô tả hiển thị của chính dự án hồ sơ được sửa cục bộ để bỏ nội dung game cũ; mô tả trong cơ sở dữ liệu không bị ghi đè.

## Cập nhật mức 2 — hình thức và chuyển động

Theo lựa chọn tiếp theo của Minh, đã thêm ảnh chụp giao diện thật của DroneFood và trang hồ sơ vào `public/assets/projects/`. Các ảnh này chỉ làm dự phòng khi quản trị chưa cung cấp ảnh; không sửa cơ sở dữ liệu. Nhận xét “dự án chưa có ảnh” phía trên mô tả bản đầu, không còn áp dụng cho hai dự án này.

Tên xuất hiện theo từng từ trong 0,98 giây; phần giới thiệu và ảnh đại diện xuất hiện theo nhịp riêng. Ảnh dự án mở theo vùng khi cuộn và nghiêng tối đa 2,5 độ theo con trỏ, sau đó trở lại vị trí nghỉ. Thiết bị phản hồi khi rê chuột, các bề mặt chuyển màu khi đổi sáng/tối. Tránh lặp hiệu ứng xuất hiện khi dữ liệu làm mới.

Đã chạy lại toàn bộ 13 nhóm kiểm tra trình duyệt phía trên: đạt. Kiểm tra riêng ở `.taste-skill/profile-refresh/motion-check.mjs` cũng đạt: tiêu đề có ba phần chuyển động, hai dự án có ảnh thật, ảnh phản hồi chuột và trở về vị trí nghỉ, chế độ giảm chuyển động không còn hiệu ứng đang chạy, màn hình điện thoại không tràn ngang. Kiểm tra kiểu dữ liệu và kiểm tra logic dữ liệu tiếp tục đạt. Rà soát mã độc lập không phát hiện vấn đề quan trọng mới.

Đã xem ảnh toàn trang sau thay đổi ở 1440, 768 và 390 px. Công cụ đo có 0 lỗi với các ngoại lệ đã ghi ở trên; còn cảnh báo nhiều cỡ chữ và không có video. Đánh giá tự chấm bản mới: thiết kế 7,5; khả năng sử dụng 8; sáng tạo 6,5; nội dung 7,5; tổng 7,45/10. Bố cục giữ nguyên hướng chữ làm trọng tâm; ảnh chụp thật bổ sung chất liệu cho dự án. Chưa có bản ghi hình để xuất thành video.

Ảnh dự án là ảnh tĩnh, không tự cập nhật khi các trang nguồn thay đổi. Các giới hạn kiểm tra trên thiết bị thật, trình đọc màn hình và Safari phía trên vẫn giữ nguyên.

## Cập nhật cuộn, thanh điều hướng và chân trang

Nguyên nhân cuộn cứng: thành phần SmoothScroll có trong dự án nhưng chưa được gắn vào trang chủ. Đã dùng Lenis hiện có, thay vòng lặp thủ công bằng autoRaf để việc hủy thành phần dọn được toàn bộ chuyển động. Chuột có quán tính, cảm ứng giữ cơ chế gốc; đổi tùy chọn giảm chuyển động có hiệu lực ngay.

Tham khảo thanh điều hướng mở rộng/thu gọn của [Melvin](https://melvinbiju.vercel.app/) và cách chân trang cố định lộ ra dưới nội dung của [Sakib](https://ssakib-portfolio.vercel.app/). Giữ màu và nội dung của Minh. Phần liên hệ được chuyển vào chân trang tối toàn chiều rộng, với tên silentboiz lớn. Trên màn hình dưới 768 px chiều rộng, dưới 760 px chiều cao hoặc khi giảm chuyển động, chân trang trở về luồng thường để luôn đọc được toàn bộ.

Kiểm tra riêng ở `.taste-skill/profile-refresh/scroll-check.mjs`: đạt các trường hợp sau:

- Một lần cuộn chuột di chuyển qua nhiều khung hình thay vì nhảy ngay tới đích.
- Thanh điều hướng thu gọn sau khi cuộn, mở rộng lại ở đầu trang, đánh dấu đúng mục đang xem.
- Tiêu đề khi bấm điều hướng dừng ở 112 px, chỉ lấy khoảng cách từ CSS. Đã tái hiện lỗi cũ ở khoảng 342 px trước khi sửa.
- Liên kết giữ mã mục trong địa chỉ; liên hệ và nút về đầu trang đến đúng vị trí.
- Chân trang được ghim trên màn hình đủ lớn và nằm trọn trong vùng nhìn ở cuối trang.
- Đưa tiêu điểm bàn phím vào email trong lúc quán tính đang chạy vẫn mở đầy đủ chân trang. Đã tái hiện lỗi kéo ngược trước khi sửa, sau đó dùng Lenis cuộn tức thời để dừng chuyển động cũ.
- Đổi tùy chọn giảm chuyển động trực tiếp sẽ hủy/khôi phục bộ cuộn mượt.
- Màn hình thấp và chế độ giảm chuyển động dùng chân trang thường; điện thoại không tràn ngang.

Đã chạy lại 13 nhóm kiểm tra hành vi cũ, kiểm tra chuyển động tên/ảnh dự án, kiểm tra logic dữ liệu và TypeScript: đạt. Rà soát độc lập xác nhận hai lỗi trên đã xử lý, không còn phát hiện quan trọng trong phạm vi sửa.

Đã mở ảnh chụp toàn trang ở máy tính, máy tính bảng và điện thoại. Công cụ đo được cập nhật để không gửi cú cuộn thử 2 px sau mỗi vị trí chụp tuyệt đối, vì cú cuộn này khởi động lại Lenis và làm ảnh chụp lặp vị trí. Các ngoại lệ mới là thanh điều hướng nổi theo yêu cầu, cùng nhận diện vùng che/ghim của chân trang: bộ đo hình học không xét vùng cắt nên tưởng chữ chân trang chồng lên nội dung phía trên, trong khi vùng đó thực tế bị cắt. Đã kiểm tra ảnh cuộn thật và ảnh cuối trang để xác nhận; không coi các ngoại lệ này là tiêu chí tự đạt. Đánh giá tự chấm hình thức bản mới: thiết kế 7,5; khả năng sử dụng 8; sáng tạo 7; nội dung 7,5; tổng 7,55/10.

## Cập nhật trang thiết bị và tiến trình cuộn

- Thêm tiến trình cuộn dưới thanh điều hướng thu gọn. Dùng tỷ lệ cuộn thực, cập nhật cả khi chiều cao nội dung hoặc kích thước màn hình thay đổi; hỗ trợ giá trị truy cập 0–100%.
- Trang chủ tăng từ ba lên sáu món đang dùng, ưu tiên các loại khác nhau. Mục thiết bị có chiều cao tối thiểu theo vùng nhìn để khi bấm điều hướng không lộ sớm phần liên hệ.
- `/gears` dùng chung màu, chữ, thanh điều hướng, cuộn mượt và cách trình bày ảnh với trang chủ. Giữ tìm kiếm theo tên/thương hiệu/loại, lọc kết hợp và xếp món đang dùng trước trong mỗi nhóm. Không thêm dữ liệu hay thư viện.
- Trang danh sách phân biệt lỗi tải, bộ sưu tập rỗng và kết quả tìm kiếm rỗng. Trạng thái chưa cập nhật không bị ghi nhầm thành đã nghỉ. Tên và ghi chú không bị cắt ngắn.
- Nhóm thiết bị có chuyển động nhẹ theo vùng nhìn trên trình duyệt hỗ trợ CSS animation-timeline; trình duyệt khác hiển thị tĩnh, không giấu nội dung. Tôn trọng giảm chuyển động.

Kiểm tra mới ở `.taste-skill/profile-refresh/gear-check.mjs` đạt:

1. Sáu món đang dùng trên trang chủ; liên hệ nằm dưới khung nhìn khi tới Thiết bị ở 1920×911, 1440×900, 1440×1200 và 390×844.
2. Thanh tiến trình đúng 0%, 50% và 100% ở đầu/giữa/cuối trang.
3. Trang danh sách ưu tiên đang dùng, xử lý trạng thái chưa cập nhật, liên kết quay về đúng mục trang chủ.
4. Lọc loại, tìm theo thương hiệu có khoảng trắng, lọc kết hợp, không có kết quả và xóa bộ lọc.
5. Lỗi tải/thử lại, dữ liệu rỗng và mảng sai cấu trúc.
6. Dữ liệu thật, chế độ sáng/tối và không tràn ngang từ 320 đến 1440 px; không có lỗi JavaScript chưa xử lý.

Kiểm tra nội dung được cập nhật cho giới hạn sáu món và vẫn đạt. Kiểm tra cuộn/điều hướng/chân trang, 13 nhóm hành vi cũ và TypeScript cũng đạt. Rà soát độc lập không phát hiện lỗi quan trọng mới.

Đã xem các ảnh chụp trang chủ và danh sách ở 1440, 768 và 390 px. Công cụ đo báo 0 lỗi với các ngoại lệ đã ghi; cảnh báo còn lại ở danh sách là không có video, khoảng trống tự nhiên của nhóm chỉ có một món, và nhận diện chưa đúng lời giới thiệu tiếng Việt trên màn hình nhỏ. Giữ số món thật, không thêm ảnh hoặc nội dung giả để lấp nhóm. Đánh giá tự chấm trang danh sách: thiết kế 7; khả năng sử dụng 8; sáng tạo 6,5; nội dung 8; tổng 7,25/10. Phần mới đã đủ đồng bộ, vẫn có thể bổ sung nhận xét cá nhân thật trong dữ liệu để tăng nét riêng.

Chưa kiểm tra trên điện thoại thật; không sửa dữ liệu trong cơ sở dữ liệu hoặc luồng quản trị. Đường dẫn chính vẫn là `/gears`.

### Tinh chỉnh điều hướng và kích thước thiết bị

- Mục điều hướng hiện tại dùng chữ đậm thay gạch chân; nền thanh thu gọn làm mờ 16px, có nền đặc dự phòng.
- Chân trang `/gears` dùng đích `#top` riêng để cuộn có chuyển động về đúng vị trí 0. Liên kết hỗ trợ bàn phím `#main` vẫn tức thời.
- Chỉ danh sách thiết bị đổi thành 4/2/1 cột trên máy tính/máy tính bảng/điện thoại; lưới trang chủ giữ nguyên.
- `.taste-skill/profile-refresh/navbar-gear-refine.mjs`: đạt chuyển động giữa hành trình và kết thúc tại 0, chữ đậm không gạch chân, nền mờ, bố cục không tràn ở 1440/768/390/320 px và chuyển tiêu điểm bàn phím tức thời.
- Chạy lại kiểm tra cuộn, chân trang, giảm chuyển động, tiến trình 0/50/100%, tìm kiếm/lọc/thử tải lại, dữ liệu rỗng/sai cấu trúc, sáng/tối và kiểm tra nội dung: đạt. `npm.cmd run build`: đạt biên dịch, kiểm tra kiểu và tạo đủ 17 trang. Rà soát độc lập không phát hiện vấn đề cần sửa.
