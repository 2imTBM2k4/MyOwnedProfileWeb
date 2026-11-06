-- ==============================================================================
-- 1. Table: skills (Quản lý Công nghệ & Kỹ năng)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT DEFAULT 'backend',
  invert BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 2. Table: experiences (Quản lý Kinh nghiệm làm việc)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  role_en TEXT,
  summary TEXT,
  summary_en TEXT,
  points JSONB DEFAULT '[]'::jsonb,
  points_en JSONB DEFAULT '[]'::jsonb,
  start_date TEXT,
  end_date TEXT,
  is_current BOOLEAN DEFAULT false,
  project_link TEXT DEFAULT '#work',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. Table: chatbot_knowledge (Quản lý Nội dung & Tri thức Chatbot)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS chatbot_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  response TEXT NOT NULL,
  response_en TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- Initial Seeding (Chỉ chèn nếu bảng chưa có dữ liệu)
-- ==============================================================================

-- Seed Skills
INSERT INTO skills (name, slug, category, invert, display_order)
SELECT name, slug, category, invert, display_order FROM (VALUES
  ('Node.js', 'nodejs', 'backend', false, 1),
  ('Express', 'express', 'backend', true, 2),
  ('MongoDB', 'mongodb', 'database', false, 3),
  ('TypeScript', 'typescript', 'language', false, 4),
  ('JavaScript', 'javascript', 'language', false, 5),
  ('Socket.io', 'socketio', 'network', true, 6),
  ('PostgreSQL', 'postgresql', 'database', false, 7),
  ('Supabase', 'supabase', 'cloud', false, 8),
  ('Docker', 'docker', 'devops', false, 9),
  ('Postman', 'postman', 'tools', false, 10),
  ('Git', 'git', 'tools', false, 11),
  ('GitHub', 'github', 'tools', true, 12),
  ('Next.js', 'nextjs', 'framework', true, 13)
) AS t(name, slug, category, invert, display_order)
WHERE NOT EXISTS (SELECT 1 FROM skills);

-- Seed Experiences
INSERT INTO experiences (company, role, role_en, summary, summary_en, points, points_en, start_date, end_date, is_current, project_link, display_order)
SELECT
  'SPLUS Software',
  'Full-Stack Developer Intern',
  'Full-Stack Developer Intern',
  'Phát triển các phân hệ cốt lõi của nền tảng DroneFood, chịu trách nhiệm chính về luồng nghiệp vụ phía máy chủ và tích hợp giao diện người dùng.',
  'Engineered core services for DroneFood platform, leading server-side business logic implementation and UI integration.',
  '["Thiết kế và triển khai các REST API xử lý đặt món, quản lý danh mục và chi nhánh nhà hàng", "Tích hợp Socket.io để truyền phát sự kiện cập nhật trạng thái đơn hàng thời gian thực giữa các bên", "Xử lý logic xác thực phân quyền người dùng với JWT và kiểm thử tích hợp đảm bảo tính ổn định của hệ thống"]'::jsonb,
  '["Designed and implemented REST APIs for order management, multi-branch catalogs, and dispatch operations", "Integrated Socket.io for real-time dispatch state machine synchronization between clients", "Built JWT RBAC security middleware and integration tests for high availability"]'::jsonb,
  '2024',
  'Hiện tại',
  true,
  '#work',
  1
WHERE NOT EXISTS (SELECT 1 FROM experiences);

-- Seed Chatbot Knowledge
INSERT INTO chatbot_knowledge (topic_id, label, keywords, response, response_en, display_order)
SELECT
  'intro',
  'Giới thiệu bản thân',
  '["giới thiệu bản thân", "giới thiệu", "gioi thieu", "bạn là ai", "ban la ai", "who are you", "minh là ai", "thông tin cá nhân", "thong tin ca nhan", "thông tin của bạn", "thông tin về minh", "profile", "tiểu sử", "học trường nào", "sinh viên", "quê quán", "about"]'::jsonb,
  'Chào bạn! Mình là Trần Bình Minh (bming), sinh viên năm 4 ngành Kỹ sư Công nghệ Thông tin. Định hướng nghề nghiệp của mình là Backend Developer. Mình tập trung vào xây dựng các dịch vụ phía máy chủ ổn định, tối ưu hóa cơ sở dữ liệu và viết mã nguồn sạch sẽ, dễ mở rộng.\nBạn có thể ghé thăm nhanh các trang cá nhân của mình qua các liên kết bên dưới:',
  'Hello! I am Tran Binh Minh (bming), a final-year Software Engineering student focused on dependable backend services, database design, and scalable APIs.',
  1
WHERE NOT EXISTS (SELECT 1 FROM chatbot_knowledge WHERE topic_id = 'intro');

INSERT INTO chatbot_knowledge (topic_id, label, keywords, response, response_en, display_order)
SELECT
  'skills',
  'Kỹ năng Backend',
  '["kỹ năng backend", "kỹ năng", "ky nang", "skill", "skills", "tech stack", "ngăn xếp", "công nghệ", "cong nghe", "ngôn ngữ", "node", "nodejs", "typescript", "javascript", "express", "docker", "redis", "rest api", "api", "postman"]'::jsonb,
  'Ngăn xếp công nghệ (tech stack) chính của mình gồm:\n• Ngôn ngữ & Nền tảng: Node.js, TypeScript, JavaScript.\n• Cơ sở dữ liệu: PostgreSQL, Supabase, Redis (caching).\n• Kiến trúc & Giao tiếp: RESTful API chuẩn hóa, Error-handling middleware tập trung.\n• Công cụ hỗ trợ: Docker, Git, Postman, Linux CLI cơ bản.',
  'Core backend stack includes Node.js, TypeScript, Express, PostgreSQL, Supabase, Redis, Docker, and REST APIs.',
  2
WHERE NOT EXISTS (SELECT 1 FROM chatbot_knowledge WHERE topic_id = 'skills');

INSERT INTO chatbot_knowledge (topic_id, label, keywords, response, response_en, display_order)
SELECT
  'database',
  'Tư duy thiết kế CSDL',
  '["cơ sở dữ liệu", "tư duy thiết kế csdl", "csdl", "database", "sql", "postgres", "postgresql", "index", "indexing", "b-tree", "lược đồ", "schema", "truy vấn", "query", "transaction", "3nf", "chuẩn hóa"]'::jsonb,
  'Về cơ sở dữ liệu, tư duy cốt lõi của mình là:\n1. Chuẩn hóa lược đồ (Normal Schema): Tuân thủ chuẩn 3NF để giảm dư thừa, chỉ phi chuẩn hóa có chủ đích khi cần tối ưu đọc.\n2. Đánh chỉ mục (Indexing): Sử dụng B-tree hoặc composite index dựa trên tần suất và điều kiện WHERE/ORDER BY thực tế, tránh over-indexing làm chậm thao tác ghi.\n3. Toàn vẹn dữ liệu: Sử dụng Transaction và Foreign Key ràng buộc chặt chẽ thay vì phó mặc logic cho tầng ứng dụng.',
  'Database design approach: 3NF normalization, thoughtful indexing strategy, and strict transactional data integrity.',
  3
WHERE NOT EXISTS (SELECT 1 FROM chatbot_knowledge WHERE topic_id = 'database');

INSERT INTO chatbot_knowledge (topic_id, label, keywords, response, response_en, display_order)
SELECT
  'contact',
  'Thông tin liên hệ',
  '["thông tin liên hệ", "thong tin lien he", "liên hệ", "lien he", "liên lạc", "kết nối", "contact", "email", "gmail", "gửi mail", "sđt", "phone", "số điện thoại", "facebook", "linkedin", "hợp tác", "trao đổi", "tin nhắn", "say hi", "nói chuyện"]'::jsonb,
  'Bạn có thể kết nối trực tiếp với Minh qua các kênh sau:\n• Email: 2004.tranbinhminh@gmail.com\n• Nhấn nút "Say hi" ở phần Liên hệ trên trang để gửi tin nhắn bảo mật trực tiếp không cần đăng nhập!\n• Hoặc bạn có thể truy cập nhanh qua các liên kết bên dưới:',
  'You can contact Minh directly via email (2004.tranbinhminh@gmail.com) or click "Say hi" on the portfolio to send an instant message.',
  4
WHERE NOT EXISTS (SELECT 1 FROM chatbot_knowledge WHERE topic_id = 'contact');

