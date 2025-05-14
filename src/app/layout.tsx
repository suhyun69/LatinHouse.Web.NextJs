import '@/app/globals.css'
import { cn } from '@/lib/utils'
import { Inter as FontSans } from "next/font/google"
import type { Metadata } from "next";
import { Toaster } from 'sonner'
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "LatinHouse",
  description: "살사/바차타 수업 모아보기",
};

export default function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background bg-gray-100 font-sans antialiased", fontSans.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
