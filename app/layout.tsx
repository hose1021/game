import type {Metadata} from "next";
import "./globals.css";
import {Inter} from 'next/font/google';
import {ThemeProvider} from 'next-themes';
import Head from 'next/head';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Azərbaycan Wordle",
  description: "Azərbaycan dilində Wordle oyunu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" className={`${inter.className}`} suppressHydrationWarning>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
