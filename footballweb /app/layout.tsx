import type { Metadata } from "next";
import { Be_Vietnam_Pro, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

import "./globals.css";

const headline = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-headline",
  weight: ["400", "600", "700", "800"]
});

const body = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body"
});

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
    <html lang={locale} className={`${headline.variable} ${body.variable}`}>
      <body className="font-[var(--font-body)] antialiased">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

