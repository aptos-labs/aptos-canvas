import React from "react";
import { Box, useColorMode } from "@chakra-ui/react";
import "../css/wallet_selector.css";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import SideBar from "../components/sideBar/SideBar";
import Header from "../components/header/Header";

// TODO: move to colors.ts
const BG_COLOR_LIGHT = "#F8F8F8";
const BG_COLOR_DARK = "#282828";

interface LayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: LayoutProps) {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Box display="flex" minHeight="100vh">
      <SideBar />
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        height="100vh"
        bg={isDark ? BG_COLOR_DARK : BG_COLOR_LIGHT}
      >
        <Header />
        {children}
      </Box>
    </Box>
  );
}
