import { VStack, Box, Button } from "@chakra-ui/react";
import {
  BRUSH_COLORS,
  Color,
  useDrawMode,
} from "../../context/DrawModeContext";

function IconPalette() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
      <path d="M13.4 2.096a10.08 10.08 0 00-8.937 3.331A10.054 10.054 0 002.096 13.4c.53 3.894 3.458 7.207 7.285 8.246a9.982 9.982 0 002.618.354l.142-.001a3.001 3.001 0 002.516-1.426 2.989 2.989 0 00.153-2.879l-.199-.416a1.919 1.919 0 01.094-1.912 2.004 2.004 0 012.576-.755l.412.197c.412.198.85.299 1.301.299A3.022 3.022 0 0022 12.14a9.935 9.935 0 00-.353-2.76c-1.04-3.826-4.353-6.754-8.247-7.284zm5.158 10.909l-.412-.197c-1.828-.878-4.07-.198-5.135 1.494-.738 1.176-.813 2.576-.204 3.842l.199.416a.983.983 0 01-.051.961.992.992 0 01-.844.479h-.112a8.061 8.061 0 01-2.095-.283c-3.063-.831-5.403-3.479-5.826-6.586-.321-2.355.352-4.623 1.893-6.389a8.002 8.002 0 017.16-2.664c3.107.423 5.755 2.764 6.586 5.826.198.73.293 1.474.282 2.207-.012.807-.845 1.183-1.441.894z" />
      <path d="M9 14.5 A1.5 1.5 0 0 1 7.5 16 A1.5 1.5 0 0 1 6 14.5 A1.5 1.5 0 0 1 9 14.5 z" />
      <path d="M9 10.5 A1.5 1.5 0 0 1 7.5 12 A1.5 1.5 0 0 1 6 10.5 A1.5 1.5 0 0 1 9 10.5 z" />
      <path d="M12 7.5 A1.5 1.5 0 0 1 10.5 9 A1.5 1.5 0 0 1 9 7.5 A1.5 1.5 0 0 1 12 7.5 z" />
      <path d="M16 7.5 A1.5 1.5 0 0 1 14.5 9 A1.5 1.5 0 0 1 13 7.5 A1.5 1.5 0 0 1 16 7.5 z" />
    </svg>
  );
}

function ColorCircle({
  color,
  isSelected,
  onClick,
}: {
  color: string;
  isSelected: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      borderRadius="50%"
      bg="transparent"
      _hover={{
        bg: "transparent", // Setting the background to transparent
        transform: "none", // Removing any transformations
      }}
      margin={-2}
      padding={0}
      onClick={onClick}
    >
      <Box
        width={3.5}
        height={3.5}
        borderRadius="50%"
        bg={color}
        borderWidth={1}
        borderColor="#3333333"
        boxShadow={isSelected ? "0px 0px 5px 1px rgba(0, 0, 0, 0.4)" : "none"}
      />
    </Button>
  );
}

function getHexColorFromRGBColor(color: Color) {
  const componentToHex = (component: number) => {
    const hex = component.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${componentToHex(color.r)}${componentToHex(color.g)}${componentToHex(
    color.b,
  )}`;
}
export default function Palette() {
  const { brushColor, setBrushColor } = useDrawMode();

  const togglePalette = () => {
    console.log("Palette toggled");
  };

  return (
    <VStack marginBottom={2}>
      <Button
        bg="transparent"
        borderRadius="50%"
        width={12}
        height={12}
        margin={-1}
        onClick={togglePalette}
      >
        <IconPalette />
      </Button>
      {BRUSH_COLORS.map((color, idx) => (
        <ColorCircle
          key={idx}
          color={getHexColorFromRGBColor(color)}
          isSelected={
            getHexColorFromRGBColor(color) ===
            getHexColorFromRGBColor(brushColor)
          }
          onClick={() => setBrushColor(color)}
        />
      ))}
    </VStack>
  );
}
