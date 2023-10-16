import "./global.css";

import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { css } from "styled-system/css";

import { ModalContainer } from "@/components/Modal";
import { WalletProvider } from "@/contexts/wallet";
import { getTheme } from "@/utils/getTheme";

import { GoogleAnalytics } from "./GoogleAnalytics";

const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "fallback",
  variable: "--font-dm-sans",
});

const APP_NAME = "Graffio";
const APP_DEFAULT_TITLE = "Graffio";
const APP_TITLE_TEMPLATE = "%s | Graffio";
const APP_DESCRIPTION = "Celebrate the Aptos Mainnet Anniversary";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1F1F23" },
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  metadataBase: process.env.VERCEL_URL ? new URL("https://" + process.env.VERCEL_URL) : undefined,
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    // Very unfortunately our theme detection code causes a hydration warning because we add
    // a data-theme attribute to the document that cannot possibly be known from the server
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: getTheme }} />
      </head>
      <body className={css({ color: "text", bg: "surface", fontFamily: "sans" })}>
        <WalletProvider>
          {children}
          <ModalContainer />
        </WalletProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_ID ? (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      ) : null}
    </html>
  );
}
