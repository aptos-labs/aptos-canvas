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
import { getLocalTime, getTimeLeft, truncateAddress } from "../../helpers";

// TODO: move to colors.ts
const BG_COLOR_DARK = "#282828";

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

  const dummyUserAddress = "0x1234567890123456789012345678901234567890";
  const dummyANSName = null;
  const dummyPixelTimestamp = "1692341709";
  const dummyExpirationTimestamp = "1692600899";
  const timeLeft = getTimeLeft(dummyExpirationTimestamp);

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
        <PopoverContent
          boxShadow={"0px 0px 4px rgba(0, 0, 0, 0.5)"}
          borderWidth={0}
          bg={BG_COLOR_DARK}
          w={200}
        >
          <PopoverCloseButton color="white" size="sm" />
          <PopoverArrow bg={BG_COLOR_DARK} borderWidth={0} />
          <PopoverBody>
            <Text
              color="white"
              fontSize={12}
              fontWeight="extrabold"
              marginY={1}
            >
              {dummyANSName || truncateAddress(dummyUserAddress)}
            </Text>
            <Text color="#bbbbbb" fontSize={11} marginBottom={3}>
              {`Created on ${getLocalTime(dummyPixelTimestamp)}`}
            </Text>
            <Text
              color={timeLeft.expiring ? "red" : "white"}
              fontSize={11}
              fontWeight={timeLeft.expiring ? "bold" : "normal"}
              marginY={1}
            >
              {`Expires in ${timeLeft.formattedTime}`}
            </Text>
          </PopoverBody>
        </PopoverContent>
      )}
    </Popover>
  );
};
