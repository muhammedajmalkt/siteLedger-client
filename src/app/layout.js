import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthLayout from "@/components/Layout/AuthLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "siteLedget",
  description: "Manage construction sites, funds, and spendings ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
        <AuthLayout>
          {children}
        </AuthLayout>
      </body>
    </html>
  );
}
