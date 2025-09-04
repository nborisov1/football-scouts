import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/Layout";

export const metadata: Metadata = {
  title: "פוטבול סקאוטינג - חיבור בין שחקנים לסקאוטים",
  description: "פלטפורמה המחברת בין שחקני כדורגל מוכשרים לסקאוטים מקצועיים",
  keywords: ["כדורגל", "סקאוטינג", "שחקנים", "אימונים", "אתגרים"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="antialiased">
        <Layout>
          {children}
        </Layout>
      </body>
    </html>
  );
}
