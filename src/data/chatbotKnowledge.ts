export interface ChatTopic {
  id: string;
  label: string;
  iconName?: string;
  keywords: string[];
  response: string;
}

export interface QuickAction {
  label: string;
  url: string;
  type: "github" | "linkedin" | "mail";
}

export interface BotAnswer {
  text: string;
  topicId?: string;
  quickActions?: QuickAction[];
}

export const PERSONAL_LINKS: QuickAction[] = [
  { label: "GitHub", url: "https://github.com/2imTBM2k4", type: "github" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/2imtbm2k4", type: "linkedin" },
  { label: "Mail", url: "mailto:2004.tranbinhminh@gmail.com", type: "mail" },
];

export const CHAT_TOPICS: ChatTopic[] = [
  {
    id: "greetings",
    label: "Lời chào",
    keywords: [
      "chào",
      "hello",
      "hi",
      "hey",
      "alo",
      "xin chào",
      "chào bạn",
      "good morning",
      "good evening",
    ],
    response:
      "Chào bạn! Rất vui được gặp bạn tại portfolio của Trần Bình Minh (bming). Mình là trợ lý ảo sẵn sàng giải đáp mọi thắc mắc về kinh nghiệm backend, tư duy CSDL, dự án và thông tin liên hệ của Minh. Bạn muốn tìm hiểu về phần nào?",
  },
  {
    id: "contact",
    label: "Thông tin liên hệ",
    keywords: [
      "thông tin liên hệ",
      "thong tin lien he",
      "liên hệ",
      "lien he",
      "liên lạc",
      "kết nối",
      "contact",
      "email",
      "gmail",
      "gửi mail",
      "sđt",
      "phone",
      "số điện thoại",
      "facebook",
      "linkedin",
      "hợp tác",
      "trao đổi",
      "tin nhắn",
      "say hi",
      "nói chuyện",
    ],
    response:
      "Bạn có thể kết nối trực tiếp với Minh qua các kênh sau:\n• Email: 2004.tranbinhminh@gmail.com\n• Nhấn nút 'Say hi' ở phần Liên hệ trên trang để gửi tin nhắn bảo mật trực tiếp không cần đăng nhập!\n• Hoặc bạn có thể truy cập nhanh qua các liên kết bên dưới:",
  },
  {
    id: "intro",
    label: "Giới thiệu bản thân",
    keywords: [
      "giới thiệu bản thân",
      "giới thiệu",
      "gioi thieu",
      "bạn là ai",
      "ban la ai",
      "who are you",
      "minh là ai",
      "thông tin cá nhân",
      "thong tin ca nhan",
      "thông tin của bạn",
      "thông tin về minh",
      "profile",
      "tiểu sử",
      "học trường nào",
      "sinh viên",
      "quê quán",
      "about",
    ],
    response:
      "Chào bạn! Mình là Trần Bình Minh (bming), sinh viên năm 4 ngành Kỹ sư Công nghệ Thông tin. Định hướng nghề nghiệp của mình là Backend Developer. Mình tập trung vào xây dựng các dịch vụ phía máy chủ ổn định, tối ưu hóa cơ sở dữ liệu và viết mã nguồn sạch sẽ, dễ mở rộng.\nBạn có thể ghé thăm nhanh các trang cá nhân của mình qua các liên kết bên dưới:",
  },
  {
    id: "skills",
    label: "Kỹ năng Backend",
    keywords: [
      "kỹ năng backend",
      "kỹ năng",
      "ky nang",
      "skill",
      "skills",
      "tech stack",
      "ngăn xếp",
      "công nghệ",
      "cong nghe",
      "ngôn ngữ",
      "node",
      "nodejs",
      "typescript",
      "javascript",
      "express",
      "docker",
      "redis",
      "rest api",
      "api",
      "postman",
    ],
    response:
      "Ngăn xếp công nghệ (tech stack) chính của mình gồm:\n• Ngôn ngữ & Nền tảng: Node.js, TypeScript, JavaScript.\n• Cơ sở dữ liệu: PostgreSQL, Supabase, Redis (caching).\n• Kiến trúc & Giao tiếp: RESTful API chuẩn hóa, Error-handling middleware tập trung.\n• Công cụ hỗ trợ: Docker, Git, Postman, Linux CLI cơ bản.",
  },
  {
    id: "database",
    label: "Tư duy thiết kế CSDL",
    keywords: [
      "cơ sở dữ liệu",
      "tư duy thiết kế csdl",
      "csdl",
      "database",
      "sql",
      "postgres",
      "postgresql",
      "index",
      "indexing",
      "b-tree",
      "lược đồ",
      "schema",
      "truy vấn",
      "query",
      "transaction",
      "3nf",
      "chuẩn hóa",
    ],
    response:
      "Về cơ sở dữ liệu, tư duy cốt lõi của mình là:\n1. Chuẩn hóa lược đồ (Normal Schema): Tuân thủ chuẩn 3NF để giảm dư thừa, chỉ phi chuẩn hóa có chủ đích khi cần tối ưu đọc.\n2. Đánh chỉ mục (Indexing): Sử dụng B-tree hoặc composite index dựa trên tần suất và điều kiện WHERE/ORDER BY thực tế, tránh over-indexing làm chậm thao tác ghi.\n3. Toàn vẹn dữ liệu: Sử dụng Transaction và Foreign Key ràng buộc chặt chẽ thay vì phó mặc logic cho tầng ứng dụng.",
  },
  {
    id: "error-handling",
    label: "Quy chuẩn xử lý lỗi",
    keywords: [
      "quy chuẩn xử lý lỗi",
      "xử lý lỗi",
      "xu ly loi",
      "lỗi",
      "error",
      "exception",
      "middleware",
      "logging",
      "log",
      "apperror",
      "response format",
      "bắt lỗi",
    ],
    response:
      "Trong các dự án backend Node.js, mình luôn áp dụng:\n• Error-handling middleware tập trung: Bắt và phân loại lỗi qua custom AppError class (phân biệt operational error dự đoán được vs programming error ngoài ý muốn).\n• Chuẩn hóa Response: Mọi phản hồi đều theo định dạng { success, message, code, data } nhất quán.\n• An toàn thông tin: Không bao giờ để lộ stack trace nhạy cảm ở môi trường production.",
  },
  {
    id: "projects",
    label: "Dự án tiêu biểu",
    keywords: [
      "dự án tiêu biểu",
      "dự án",
      "du an",
      "project",
      "projects",
      "sản phẩm",
      "dronefood",
      "portfolio",
      "kinh nghiệm",
      "kinh nghiệm làm việc",
      "github",
      "demo",
      "đã làm được gì",
    ],
    response:
      "Một số dự án tiêu biểu của mình:\n• DroneFood: Hệ thống điều vận giao hàng bằng Drone thời gian thực (Node.js, Socket.IO, QR Cargo Handover).\n• My Owned Profile: Website cá nhân tích hợp API đa nền tảng (Steam, HoYoLAB, Discord Gateway, Supabase).\nBạn có thể nhấp trực tiếp vào từng thẻ dự án ở mục 'Dự án' trên trang để xem Case Study chi tiết (Vấn đề, Giải pháp, Kết quả) và link Demo/GitHub!",
  },
  {
    id: "testing",
    label: "Tài khoản test dự án",
    keywords: [
      "tài khoản test",
      "tài khoản",
      "tai khoan",
      "test",
      "thử nghiệm",
      "dang nhap",
      "đăng nhập",
      "password",
      "mật khẩu",
      "account",
      "hướng dẫn test",
      "demo test",
    ],
    response:
      "Để trải nghiệm và test các dự án của Minh:\n• Dự án DroneFood (dronefood.io.vn): Bạn có thể nhấp vào thẻ DroneFood trên website để mở popup xem chi tiết. Hệ thống cho phép tự do đăng ký tài khoản khách hàng mới để trải nghiệm luồng đặt món & nhận hàng bằng mã QR.\n• Nếu cần tài khoản quản trị (Admin/Dispatcher) để test chuyên sâu, hãy liên hệ qua email 2004.tranbinhminh@gmail.com nhé!",
  },
  {
    id: "cv",
    label: "Hồ sơ CV",
    keywords: [
      "cv",
      "resume",
      "hồ sơ xin việc",
      "tải cv",
      "download cv",
      "xem cv",
      "bản cv",
      "hồ sơ",
    ],
    response:
      "Bạn có thể tải hoặc xem bản CV mới nhất của Minh trực tiếp bằng nút 'Tải CV' trên trang web hoặc truy cập API: /api/cv để tải về file PDF định dạng chuẩn.",
  },
  {
    id: "gears",
    label: "Thiết bị & Gear",
    keywords: [
      "thiết bị",
      "thiet bi",
      "gear",
      "gears",
      "chuột",
      "bàn phím",
      "tai nghe",
      "màn hình",
      "setup",
      "mouse",
      "keyboard",
      "iem",
      "dac",
      "audiophile",
    ],
    response:
      "Ngoài lập trình backend, Minh có niềm đam mê lớn với thiết bị công nghệ:\n• Chuột & Lót chuột: Razer Viper V4 Pro, Artisan Ninja FX Zero.\n• Âm thanh: Tai nghe IEM iBasso JR Cookie Ti, Moondrop Dawn Pro 2 DAC.\n• Màn hình: AOC 24G50Z 260Hz.\nBạn có thể xem toàn bộ góc đồ dùng tại mục 'Ngoài code / Thiết bị' trên trang nhé!",
  },
];

export const INITIAL_BOT_MESSAGE =
  "Xin chào! Mình là trợ lý ảo giới thiệu về Minh (bming). Bạn muốn tìm hiểu điều gì về tư duy kỹ thuật hay hồ sơ năng lực của Minh?";

export const DEFAULT_FALLBACK_RESPONSE =
  "Câu hỏi của bạn khá thú vị! Hiện tại mình có thể cung cấp nhanh các thông tin về: Kỹ năng Backend, Tư duy thiết kế CSDL, Quy chuẩn xử lý lỗi, Dự án tiêu biểu, Tài khoản test hoặc Thông tin liên hệ. Hãy nhập câu hỏi bạn quan tâm nhé!";

/**
 * Remove Vietnamese accents for flexible search comparison
 */
function stripAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

/**
 * Smart matching algorithm using multi-factor relevance scoring.
 * Returns both the formatted response and any relevant quick actions (GitHub, LinkedIn, Mail).
 */
export function findAnswer(query: string): BotAnswer {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return { text: DEFAULT_FALLBACK_RESPONSE };
  }

  const normalizedNoAccents = stripAccents(normalized);

  let bestTopic: ChatTopic | null = null;
  let highestScore = 0;

  for (const topic of CHAT_TOPICS) {
    let score = 0;

    // Check exact match with topic label
    const labelLower = topic.label.toLowerCase();
    if (normalized === labelLower || normalizedNoAccents === stripAccents(labelLower)) {
      score += 60;
    } else if (normalized.includes(labelLower) || normalizedNoAccents.includes(stripAccents(labelLower))) {
      score += 35;
    }

    for (const kw of topic.keywords) {
      const kwLower = kw.toLowerCase();
      const kwNoAccents = stripAccents(kwLower);

      if (normalized === kwLower || normalizedNoAccents === kwNoAccents) {
        score += kwLower.length * 4 + 40;
      } else if (normalized.includes(kwLower) || normalizedNoAccents.includes(kwNoAccents)) {
        score += kwLower.length * 3;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestTopic = topic;
    }
  }

  if (bestTopic && highestScore >= 12) {
    // If the topic is intro or contact (personal info), attach quick actions
    const isPersonalInfo = bestTopic.id === "intro" || bestTopic.id === "contact";
    return {
      text: bestTopic.response,
      topicId: bestTopic.id,
      quickActions: isPersonalInfo ? PERSONAL_LINKS : undefined,
    };
  }

  return { text: DEFAULT_FALLBACK_RESPONSE };
}
