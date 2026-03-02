import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Constellation Linktree | Personal Portfolio",
  description: "An immersive, space-themed personal link page with interactive constellation clusters floating in a galaxy sky.",
  keywords: ["linktree", "portfolio", "links", "constellation", "space"],
  openGraph: {
    title: "Constellation Linktree",
    description: "An immersive, space-themed personal link page.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
