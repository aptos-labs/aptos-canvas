import { AddIcon, MinusIcon, RepeatIcon } from "@chakra-ui/icons";
import { IconButton, VStack } from "@chakra-ui/react";

export default function ZoomButtons({
  zoomIn,
  zoomOut,
  resetTransform,
}: {
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
}) {
  return (
    <div style={{ position: "absolute", bottom: 20, right: 20 }}>
      <VStack spacing={3}>
        <IconButton
          isRound={true}
          variant="solid"
          aria-label="Done"
          size="sm"
          fontSize="10px"
          icon={<AddIcon />}
          onClick={() => zoomIn()}
        />
        <IconButton
          isRound={true}
          variant="solid"
          aria-label="Done"
          size="sm"
          fontSize="10px"
          icon={<MinusIcon />}
          onClick={() => zoomOut()}
        />
        <IconButton
          isRound={true}
          variant="solid"
          aria-label="Done"
          size="sm"
          fontSize="12px"
          icon={<RepeatIcon />}
          onClick={() => resetTransform()}
        />
      </VStack>
    </div>
  );
}
