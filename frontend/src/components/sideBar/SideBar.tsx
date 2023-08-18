import { Box, Button, Spacer, VStack, useColorMode } from "@chakra-ui/react";
import DrawModeToggleButton from "./DrawModeToggleButton";

export const SIDEBAR_WIDTH = 80;

// TODO: move to colors.ts
const BG_COLOR_LIGHT = "#ffffff";
const BG_COLOR_DARK = "#1C1C1C";

export default function SideBar() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Box
      w={`${SIDEBAR_WIDTH}px`}
      h="100vh"
      borderRightRadius={12}
      bg={isDark ? BG_COLOR_DARK : BG_COLOR_LIGHT}
      boxShadow={
        isDark
          ? "0px 0px 4px rgba(255, 255, 255, 0.1)"
          : "0px 0px 4px rgba(0, 0, 0, 0.1)"
      }
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      paddingY={4} // Padding for top and bottom spacing
    >
      <VStack spacing={4}>
        <Button colorScheme="gray">1</Button>
        <Button colorScheme="gray">2</Button>
      </VStack>
      <Spacer />
      <DrawModeToggleButton />
    </Box>
  );
}
