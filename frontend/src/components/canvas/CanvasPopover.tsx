import {
  Box,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  Text,
  PopoverTrigger,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect } from "react";

// Rather than setting the position of the Popover explicitly, we set the position of
// a Box and make the Popover attach to that. This way the Popover arrow works and it
// has the freedom to choose where it puts itself (so it doesn't overflow outside the
// edge of the screen).
export const CanvasPopover = ({
  openPopover,
  popoverPos,
}: {
  openPopover: boolean;
  popoverPos: { left: number; top: number };
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (openPopover) {
      onOpen();
    }
  }, [openPopover]);

  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      closeOnBlur={true}
      closeOnEsc={true}
    >
      <PopoverTrigger>
        <Box
          style={{
            left: `${popoverPos.left}px`,
            top: `${popoverPos.top}px`,
            position: "absolute",
            pointerEvents: "none",
          }}
          zIndex={"10"}
        />
      </PopoverTrigger>
      {isOpen && (
        <PopoverContent>
          <PopoverCloseButton />
          <PopoverArrow />
          <PopoverBody>
            <Text>Connect your wallet to draw.</Text>
          </PopoverBody>
        </PopoverContent>
      )}
    </Popover>
  );
};
