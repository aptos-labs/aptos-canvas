import {
  Box,
  Slider,
  Text,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import { BRUSH_SIZE, useDrawMode } from "../../context/DrawModeContext";

export default function SizeSlider() {
  const { brushSize, setBrushSize } = useDrawMode();

  return (
    <Box height="180px" marginTop={5}>
      <Slider
        orientation="vertical"
        defaultValue={BRUSH_SIZE.default}
        min={BRUSH_SIZE.min}
        max={BRUSH_SIZE.max}
        step={1}
        onChange={(value) => setBrushSize(value)}
      >
        <SliderTrack bg="rgba(67,56,242,0.2)">
          <SliderFilledTrack bg="#4339F2" />
        </SliderTrack>
        <SliderThumb boxSize={6}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Text fontSize={12} color="#4339F2" opacity={0.6}>
              {brushSize}
            </Text>
          </Box>
        </SliderThumb>
      </Slider>
    </Box>
  );
}
