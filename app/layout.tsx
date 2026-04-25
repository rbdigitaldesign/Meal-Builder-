import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meal Builder — Alchemy Natural Health",
  description: "Build balanced meals that meet your nutritional goals",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Meal Builder",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Adobe Fonts — add your kit ID from fonts.adobe.com to load adobe-garamond-pro and baltica */}
        {/* <link rel="stylesheet" href="https://use.typekit.net/YOUR_KIT_ID.css" /> */}
        <meta name="theme-color" content="#62835a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Meal Builder" />
      </head>
      <body className="min-h-screen bg-brand-cream text-brand-black antialiased font-body">
        {children}
      </body>
    </html>
  );
}
