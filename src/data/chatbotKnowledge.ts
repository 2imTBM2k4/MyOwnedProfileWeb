export interface ChatTopic {
  id: string;
  label: string;
  iconName?: string;
  keywords: string[];
  response: string;
}

export const CHAT_TOPICS: ChatTopic[] = [
  {
    id: "intro",
    label: "Giới thiệu bản thân",
    keywords: [
      "chào",
      "hello",
      "hi",
      "bạn là ai",
      "giới thiệu",
      "minh",
      "thông tin",
      "profile",
      "who",
      "about",
    ],
    response:
      "Chào bạn! Mình là Trần Bình Minh (silentboiz), sinh viên năm 4 ngành Kỹ sư Công nghệ Thông tin. Định hướng của mình là Backend Developer. Mình tập trung vào xây dựng các dịch vụ phía máy chủ ổn định, tối ưu hóa cơ sở dữ liệu và viết mã nguồn sạch sẽ, dễ mở rộng.",
  },
  {
    id: "skills",
    label: "Kỹ năng Backend",
    keywords: [
      "skill",
      "kỹ năng",
      "tech",
      "stack",
      "node",
      "typescript",
      "công nghệ",
      "framework",
      "ngôn ngữ",
      "docker",
      "redis",
    ],
    response:
      "Ngăn xếp công nghệ (tech stack) chính của mình gồm:\n• Ngôn ngữ & Nền tảng: Node.js, TypeScript, JavaScript.\n• Cơ sở dữ liệu: PostgreSQL, Supabase, Redis (caching).\n• Kiến trúc & Giao tiếp: RESTful API chuẩn hóa, Error-handling middleware tập trung.\n• Công cụ hỗ trợ: Docker, Git, Postman, Linux CLI cơ bản.",
  },
  {
    id: "database",
    label: "Tư duy thiết kế CSDL",
    keywords: [
      "database",
      "csdl",
      "sql",
      "postgres",
      "index",
      "b-tree",
      "lược đồ",
      "schema",
      "truy vấn",
      "query",
      "transaction",
    ],
    response:
      "Về cơ sở dữ liệu, tư duy cốt lõi của mình là:\n1. Chuẩn hóa lược đồ (Normal Schema): Tuân thủ chuẩn 3NF để giảm dư thừa, chỉ phi chuẩn hóa có chủ đích khi cần tối ưu đọc.\n2. Đánh chỉ mục (Indexing): Sử dụng B-tree hoặc composite index dựa trên tần suất và điều kiện WHERE/ORDER BY thực tế, tránh over-indexing làm chậm thao tác ghi.\n3. Toàn vẹn dữ liệu: Sử dụng Transaction và Foreign Key ràng buộc chặt chẽ thay vì phó mặc logic cho tầng ứng dụng.",
  },
  {
    id: "error-handling",
    label: "Quy chuẩn xử lý lỗi",
    keywords: [
      "lỗi",
      "error",
      "middleware",
      "exception",
      "log",
      "logging",
      "xử lý lỗi",
      "apperror",
      "response",
    ],
    response:
      "Trong các dự án backend Node.js, mình luôn áp dụng:\n• Error-handling middleware tập trung: Bắt và phân loại lỗi qua custom AppError class (phân biệt operational error dự đoán được vs programming error ngoài ý muốn).\n• Chuẩn hóa Response: Mọi phản hồi đều theo định dạng { success, message, code, data } nhất quán.\n• An toàn thông tin: Không bao giờ để lộ stack trace nhạy cảm ở môi trường production.",
  },
  {
    id: "projects",
    label: "Dự án tiêu biểu",
    keywords: [
      "dự án",
      "project",
      "portfolio",
      "sản phẩm",
      "kinh nghiệm",
      "làm được gì",
      "github",
      "demo",
    ],
    response:
      "Một số dự án tiêu biểu của mình:\n• My Owned Profile: Website cá nhân tích hợp API đa nền tảng (Steam, HoYoLAB, Discord Gateway, Supabase).\n• Các dự án backend mẫu: Hệ thống xác thực JWT, phân quyền RBAC, quản lý phiên và xử lý background task.\nBạn có thể cuộn xuống phần 'Dự án' ngay bên dưới để xem chi tiết mã nguồn và bản demo!",
  },
  {
    id: "contact",
    label: "Thông tin liên hệ",
    keywords: [
      "liên hệ",
      "contact",
      "email",
      "gmail",
      "tuyển dụng",
      "job",
      "cv",
      "sđt",
      "phone",
      "hợp tác",
    ],
    response:
      "Bạn có thể kết nối trực tiếp với mình qua:\n• Email: 2004.tranbinhminh@gmail.com\n• GitHub: github.com/2imTBM2k4\nMình luôn sẵn sàng lắng nghe các cơ hội thực tập hoặc vị trí Backend Developer tiềm năng!",
  },
];

export const INITIAL_BOT_MESSAGE =
  "Xin chào! Mình là trợ lý ảo giới thiệu về Minh (silentboiz). Bạn muốn tìm hiểu điều gì về tư duy kỹ thuật hay hồ sơ năng lực của Minh?";

export const DEFAULT_FALLBACK_RESPONSE =
  "Câu hỏi của bạn khá thú vị! Hiện tại mình có thể cung cấp nhanh các thông tin về: Kỹ năng Backend, Tư duy thiết kế CSDL, Quy chuẩn xử lý lỗi, Dự án tiêu biểu hoặc Thông tin liên hệ. Bạn có thể chọn một trong các nút gợi ý bên dưới nhé!";

/**
 * Match user query against predefined knowledge base topics
 */
export function findAnswer(query: string): string {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return DEFAULT_FALLBACK_RESPONSE;

  // Exact or partial topic match
  for (const topic of CHAT_TOPICS) {
    for (const keyword of topic.keywords) {
      if (normalized.includes(keyword)) {
        return topic.response;
      }
    }
  }

  return DEFAULT_FALLBACK_RESPONSE;
}
