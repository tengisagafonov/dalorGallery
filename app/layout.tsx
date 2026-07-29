import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dalor Gallery",
  description: "Browse and customize professional prompt templates for DalorStudio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
