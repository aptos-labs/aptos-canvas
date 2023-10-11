import "./global.css";

import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { css } from "styled-system/css";

import { ModalContainer } from "@/components/Modal";
import { WalletProvider } from "@/contexts/wallet";

const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "fallback",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Graffio",
  description: "Celebrate the Aptos Mainnet Anniversary",
  metadataBase: process.env.VERCEL_URL ? new URL("https://" + process.env.VERCEL_URL) : undefined,
};

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className={css({ color: "text", bg: "surface", fontFamily: "sans" })}>
        <WalletProvider>
          {children}
          <ModalContainer />
        </WalletProvider>
      </body>
    </html>
  );
}
