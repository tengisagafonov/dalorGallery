import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dalor Gallery",
  description: "Browse and customize professional prompt templates for DalorStudio.",
};

// Läuft synchron beim Parsen des HTML, also vor dem ersten Paint – sonst würde
// die Seite kurz hell aufblitzen, bevor React hydriert.
const applyStoredTheme = `(function(){try{var s=localStorage.getItem("dalor-theme");var t=s==="dark"||s==="light"?s:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: applyStoredTheme }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
