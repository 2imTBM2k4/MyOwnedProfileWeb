import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const DEFAULT_PROJECTS = [
  {
    title: 'DroneFood',
    description: 'Nền tảng giao đồ ăn bằng Drone & Shipper tự hành với quy trình kiểm định an toàn bay và mở khoang nhận hàng qua mã QR.',
    github_url: 'https://github.com/2imTBM2k4/DroneFood',
    demo_url: 'https://dronefood.io.vn/',
    status: 'completed' as const,
    tags: ['Drone Dispatching', 'QR Cargo Handover', 'Preflight Check', 'Socket.IO', 'Node.js', 'featured'],
    tone: 'lime',
    kind: 'Nền tảng giao đồ ăn bằng Drone & Shipper',
    problem: 'Các nền tảng giao đồ ăn hiện nay chỉ vận hành bằng tài xế xe máy. Việc triển khai mô hình giao hàng tự hành bằng Drone đặt ra thách thức lớn về tự động hóa điều phối đội bay, quy trình kiểm định an toàn bay và cơ chế bàn giao món an toàn, bảo mật tại điểm nhận khi không có người trực tiếp giao hàng.',
    did: 'Xây dựng backend điều phối Drone tự động từ Hub theo khoảng cách & mức pin; triển khai quy trình Preflight check an toàn bay; thiết kế cơ chế bảo mật quét QR để mở nắp khoang hàng 5s và tự động hoàn tất đơn khi trọng lượng về 0; xử lý luồng Fallback 10 phút chuyển sang Shipper hoặc hủy hoàn tiền tự động khi không đủ điều kiện bay.',
    result: 'Hoàn thiện nền tảng Monorepo full-stack gồm 3 cổng Web (Khách hàng, Nhà hàng, Admin) và hệ thống API, chứng minh quy trình giao đồ ăn bằng drone khép kín từ đặt món, điều phối bay đến quét QR mở khoang nhận hàng.',
  },
  {
    title: 'Portfolio',
    description: 'Trang hồ sơ cá nhân và bảng quản trị nội dung xây dựng bằng Next.js, tích hợp Supabase và xác thực chữ ký số.',
    github_url: 'https://github.com/2imTBM2k4/MyOwnedProfileWeb',
    demo_url: 'https://silentboiz.vercel.app/',
    status: 'active' as const,
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Supabase'],
    tone: 'violet',
    kind: 'Website cá nhân & Bảng quản trị',
    problem: 'Cần một nơi giới thiệu dự án, kỹ năng và quản lý thiết bị có thể cập nhật nội dung linh hoạt, bảo mật phiên làm việc mà không phải sửa code.',
    did: 'Xây dựng bằng Next.js (App Router), xác thực bảo mật với session token có chữ ký số, lưu trữ và đồng bộ dữ liệu quan hệ qua Supabase PostgreSQL.',
    result: 'Trang cá nhân hoạt động mượt mà, tối ưu hiệu năng cuộn trang và hỗ trợ cập nhật nội dung tức thời từ trang quản trị.',
  },
];

const DEFAULT_GEARS = [
  { name: 'Razer Viper V4 Pro', category: 'mouse', brand: 'Razer', status: 'active' as const, image_url: '1792745564763-9pwpmzbjp9m.jpg' },
  { name: 'AOC 24G50Z 24" 260Hz', category: 'monitor', brand: 'AOC', status: 'active' as const, image_url: '1792746729678-mnc4z26n75l.webp' },
  { name: 'Artisan Ninja FX Zero', category: 'mousepad', brand: 'Artisan', status: 'active' as const, image_url: '1792746827622-oih1yzbqi2a.webp' },
  { name: 'iBasso JR Cookie Ti', category: 'iem', brand: 'iBasso', status: 'active' as const, image_url: '1783376828914-vl6to8o4nwo.jpeg' },
  { name: 'Moondrop Dawn Pro 2', category: 'dac', brand: 'Moondrop', status: 'active' as const, image_url: '1775453316714-kequk4akh0r.webp' },
  { name: 'EPMIC TM07', category: 'micro', brand: 'EPMIC', status: 'active' as const, image_url: '1775453282643-o2lj1l65nd.webp' },
  { name: 'Apple iPhone SE Gen3', category: 'phone', brand: 'Apple', status: 'active' as const, image_url: '1778925743172-myx7w551aw.jpeg' },
];

const DEFAULT_SOCIALS = [
  { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/2imtbm2k4', display_name: 'Bình Minh Trần', display_order: 1 },
  { platform: 'GitHub', url: 'https://github.com/2imTBM2k4', display_name: '@2imTBM2k4', display_order: 2 },
  { platform: 'Instagram', url: 'https://www.instagram.com/silentboiz.profile/', display_name: '@silentboiz.profile', display_order: 3 },
  { platform: 'Facebook', url: 'https://www.facebook.com/silentboiz.profile/', display_name: 'Trần Bình Minh', display_order: 4 },
];

const DEFAULT_PROFILE = {
  username: 'silentboiz',
  bio: 'Lập trình viên Backend — Sinh viên năm cuối ngành Kỹ thuật Phần mềm. Mình tập trung xây dựng các hệ thống backend ổn định, xử lý dữ liệu tin cậy và tối ưu luồng xử lý ứng dụng.',
};

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdminClient();
    const body = await request.json().catch(() => ({ scope: 'all' }));
    const scope = body.scope || 'all';

    const results = {
      projects: 0,
      gears: 0,
      socials: 0,
      profile: false,
    };

    // 1. Đồng bộ Projects
    if (scope === 'all' || scope === 'projects') {
      const { data: existingProjects } = await supabase.from('projects').select('id, title');
      const existingMap = new Map((existingProjects || []).map((p) => [p.title.trim().toLowerCase(), p.id]));

      for (const p of DEFAULT_PROJECTS) {
        const existingId = existingMap.get(p.title.trim().toLowerCase());
        if (existingId) {
          const { error } = await supabase.from('projects').update(p).eq('id', existingId);
          if (error && error.code === '42703') {
            // Fallback nếu chưa chạy SQL thêm case study columns
            const { kind, problem, did, result, tone, ...basic } = p;
            await supabase.from('projects').update(basic).eq('id', existingId);
          }
        } else {
          const { error } = await supabase.from('projects').insert(p);
          if (error && error.code === '42703') {
            const { kind, problem, did, result, tone, ...basic } = p;
            await supabase.from('projects').insert(basic);
          }
        }
        results.projects++;
      }
    }

    // 2. Đồng bộ Gears
    if (scope === 'all' || scope === 'gears') {
      const { data: existingGears } = await supabase.from('gears').select('id, name');
      const existingMap = new Map((existingGears || []).map((g) => [g.name.trim().toLowerCase(), g.id]));

      for (const g of DEFAULT_GEARS) {
        const existingId = existingMap.get(g.name.trim().toLowerCase());
        if (existingId) {
          await supabase.from('gears').update(g).eq('id', existingId);
        } else {
          await supabase.from('gears').insert(g);
        }
        results.gears++;
      }
    }

    // 3. Đồng bộ Socials
    if (scope === 'all' || scope === 'social') {
      const { data: existingSocials } = await supabase.from('social_links').select('id, platform');
      const existingMap = new Map((existingSocials || []).map((s) => [s.platform.trim().toLowerCase(), s.id]));

      for (const s of DEFAULT_SOCIALS) {
        const existingId = existingMap.get(s.platform.trim().toLowerCase());
        if (existingId) {
          await supabase.from('social_links').update(s).eq('id', existingId);
        } else {
          await supabase.from('social_links').insert(s);
        }
        results.socials++;
      }
    }

    // 4. Đồng bộ Profile
    if (scope === 'all' || scope === 'profile') {
      const { data: existingProfile } = await supabase.from('profile').select('id').limit(1).maybeSingle();
      if (existingProfile) {
        await supabase.from('profile').update(DEFAULT_PROFILE).eq('id', existingProfile.id);
      } else {
        await supabase.from('profile').insert(DEFAULT_PROFILE);
      }
      results.profile = true;
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Đồng bộ dữ liệu từ trang giới thiệu thành công.',
    });
  } catch (error) {
    console.error('SYNC DEFAULTS ERROR:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Không thể đồng bộ dữ liệu.' },
      { status: 500 }
    );
  }
}
