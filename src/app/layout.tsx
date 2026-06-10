import type { Metadata } from "next";
import { Cairo, Tajawal, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "قاف — منصة إدارة مكاتب المحاماة",
  description:
    "قاف. منصة المحاماة الأولى في السعودية. أدِر قضاياك، فاتر عملاءك، وادفع فقط على الميزات التي تستخدمها. ابدأ من 49 ر.س/شهر.",
  keywords: [
    "نظام مكتب محاماة",
    "إدارة قضايا",
    "محاماة السعودية",
    "Saudi law firm software",
    "Qaf",
    "قاف",
  ],
  openGraph: {
    title: "قاف — منصة إدارة مكاتب المحاماة",
    description:
      "أدِر مكتبك بكفاءة، وادفع فقط على ما تحتاج. منصة محاماة سعودية حديثة.",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${tajawal.variable} ${inter.variable} ${geistMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-screen bg-bg text-text antialiased">
        {children}
      </body>
    </html>
  );
}
