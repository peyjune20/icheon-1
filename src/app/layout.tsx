import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { AppHeader } from "@/components/shared/AppHeader";

export const metadata: Metadata = {
  title: "이천베베로드 - 아이와 함께, 무리 없는 이천 하루",
  description: "아이 나이와 여행 시간을 알려주시면 우리 가족이 실제로 소화할 수 있는 이천 당일치기 코스를 만들어드려요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface font-body text-on-surface min-h-screen antialiased overflow-x-hidden">
        <div className="w-full min-h-screen flex flex-col relative bg-surface overflow-x-hidden">
          <AppHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
