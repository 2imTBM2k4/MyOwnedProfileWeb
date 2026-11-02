import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Be_Vietnam_Pro, Fraunces, JetBrains_Mono } from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const fontDisplay = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-vietnam",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  style: ["italic", "normal"],
  variable: "--font-fraunces",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trần Bình Minh · Backend Developer",
  description: "Portfolio cá nhân của Trần Bình Minh - Sinh viên Kỹ sư CNTT định hướng Backend Development",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`scroll-smooth ${inter.variable} ${fontDisplay.variable} ${beVietnamPro.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = saved === 'dark' || (!saved && prefersDark);
                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.dataset.theme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.dataset.theme = 'light';
                }
                const savedLang = localStorage.getItem('locale');
                if (savedLang === 'en' || savedLang === 'vi') {
                  document.documentElement.lang = savedLang;
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={beVietnamPro.className}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
