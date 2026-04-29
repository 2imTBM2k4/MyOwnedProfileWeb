# SQL Migrations

Các file SQL trong thư mục này cần được chạy trên Supabase database để cập nhật schema.

## Cách chạy migrations:

1. Đăng nhập vào Supabase Dashboard
2. Vào phần SQL Editor
3. Copy nội dung file SQL và paste vào editor
4. Nhấn "Run" để thực thi

## Danh sách migrations:

### add_publisher_field.sql

Thêm cột `publisher` vào bảng `games` để lưu thông tin nhà phát hành game.

**Chạy lệnh:**

```sql
ALTER TABLE games ADD COLUMN IF NOT EXISTS publisher TEXT;
```

## Lưu ý:

- Các migrations sử dụng `IF NOT EXISTS` nên có thể chạy nhiều lần mà không gây lỗi
- Nên backup database trước khi chạy migrations
