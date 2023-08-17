import { Box, VStack, Button, useColorMode } from "@chakra-ui/react";

// TODO: move to colors.ts
const BG_COLOR_LIGHT = "#ffffff";
const BG_COLOR_DARK = "#1C1C1C";

export default function SideBar() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Box
      w="80px" // width of the sidebar
      h="100vh" // full viewport height
      borderRightRadius={12}
      bg={isDark ? BG_COLOR_DARK : BG_COLOR_LIGHT}
      boxShadow={
        isDark
          ? "0px 0px 4px rgba(255, 255, 255, 0.1)"
          : "0px 0px 4px rgba(0, 0, 0, 0.1)"
      }
    >
      <VStack spacing={4} align="start" padding={5}>
        <Button colorScheme="blue">1</Button>
        <Button colorScheme="blue">2</Button>
        <Button colorScheme="blue">3</Button>
      </VStack>
    </Box>
  );
}
