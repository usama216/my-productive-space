
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/styles/globals.css"
// app/layout.tsx
// slick carousel styles (must be in the root layout)
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import WhatsappLive from "@/components/whatsapp-logo/WhatsappLive";
import { Toaster } from "@/components/ui/toaster"
import HomeToast from "@/components/HomeToast"
import { Provider } from "react-redux";
import { store } from "@/store/store";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyProductiveSpace",
  description: "MyProductiveSpace is a pretty cool productivity co-working space in Kovan, Singapore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <Provider store={store}> */}
          <div className="mx-auto">
            {children}
            <WhatsappLive />
          </div>

          {/* Toast components for authentication notifications */}
          <Toaster />
          <HomeToast />
          {/* </Provider> */}
      </body>
    </html>
  );
}