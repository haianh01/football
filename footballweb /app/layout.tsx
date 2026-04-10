import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import "./globals.css";

export const metadata: Metadata = {
  title: "V-Pitch",
  description: "Scaffold kỹ thuật cho nền tảng vận hành bóng đá phong trào."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      style={
        {
          "--font-headline": '"Be Vietnam Pro", "Segoe UI", sans-serif',
          "--font-body": '"Inter", "Segoe UI", sans-serif'
        } as React.CSSProperties
      }
    >
      <body className="font-[var(--font-body)] antialiased">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
