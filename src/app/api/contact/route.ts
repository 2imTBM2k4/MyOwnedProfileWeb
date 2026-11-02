import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ." },
        { status: 400 }
      );
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Vui lòng nhập họ và tên của bạn." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Địa chỉ email không đúng định dạng." },
        { status: 400 }
      );
    }

    if (!message || message.length < 2) {
      return NextResponse.json(
        { error: "Nội dung tin nhắn không được để trống." },
        { status: 400 }
      );
    }

    // 1. Send via Resend API if API key is provided
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const targetEmail = process.env.CONTACT_TO_EMAIL || "2004.tranbinhminh@gmail.com";
      const fromEmail = process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [targetEmail],
          reply_to: email,
          subject: `[Portfolio Contact] Tin nhắn mới từ ${name}`,
          text: `Họ tên: ${name}\nEmail: ${email}\n\nNội dung:\n${message}`,
        }),
      });

      if (!resendRes.ok) {
        const errorData = await resendRes.json().catch(() => ({}));
        console.error("Resend API error:", errorData);
        // Continue to return success to client or inform
      }
    } else {
      console.log("[Contact Form Received]", {
        name,
        email,
        message,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Tin nhắn đã được gửi thành công! Cảm ơn bạn.",
    });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xử lý tin nhắn. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}

