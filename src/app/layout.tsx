import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CodeName | Local team word game",
    template: "%s | CodeName",
  },
  description:
    "Create a shared 5x5 word board and open the private leader key by QR code.",
  applicationName: "CodeName",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
