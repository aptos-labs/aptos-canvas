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
import { useGetPixelAttribution } from "../../api/hooks/useGetPixelAttribution";
import { calculateIndex } from "../../utils";
import { useGetAnsNames } from "../../api/hooks/useGetAnsName";

// TODO: move to colors.ts
const BG_COLOR_DARK = "#282828";

// Rather than setting the position of the Popover explicitly, we set the position of
// a Box and make the Popover attach to that. This way the Popover arrow works and it
// has the freedom to choose where it puts itself (so it doesn't overflow outside the
// edge of the screen).
export const CanvasPopover = ({
  openPopover,
  popoverPos,
  canvasAddress,
  canvasWidth,
  // How long it takes for a pixel to entirely decay.
  pixelDecaySecs,
}: {
  openPopover: boolean;
  popoverPos: { left: number; top: number; x: number; y: number };
  canvasAddress: string;
  canvasWidth: number;
  pixelDecaySecs: number;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const pixelIndex = calculateIndex(popoverPos.x, popoverPos.y, canvasWidth);

  const { data: attributionData } = useGetPixelAttribution(
    canvasAddress,
    pixelIndex,
    { enabled: isOpen },
  );

  const artistAddress = attributionData?.artistAddress ?? "Never drawn on!";
  const drawnAtSecs = attributionData?.drawnAtSecs;

  const { data: ansData } = useGetAnsNames([artistAddress], {
    enabled: !!attributionData,
  });

  const artistName = ansData?.[0].name ?? null;

  useEffect(() => {
    if (openPopover) {
      onOpen();
    }
  }, [openPopover, onOpen]);

  const expirationTimestamp = drawnAtSecs ? drawnAtSecs + pixelDecaySecs : 0;
  const timeLeft = getTimeLeft(`${expirationTimestamp}`);

  // If we can't find any attribution data or the pixel has expired, we say the
  // pixel is untouched. To the user, this appears to be the case, since even though
  // an old pixel techincally has data on chain, based on the expiration information
  // attached to it we show it completely faded if it has expired.
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
            {attributionData && !timeLeft.expired ? (
              <>
                <Text
                  color="white"
                  fontSize={12}
                  fontWeight="extrabold"
                  marginY={1}
                >
                  {artistName || truncateAddress(artistAddress)}
                </Text>
                <Text color="#bbbbbb" fontSize={11} marginBottom={3}>
                  {drawnAtSecs
                    ? `Drawn at ${getLocalTime(`${drawnAtSecs}`)}`
                    : ""}
                </Text>
                <Text
                  color={timeLeft.expiring ? "red" : "white"}
                  fontSize={11}
                  fontWeight={timeLeft.expiring ? "bold" : "normal"}
                  marginY={1}
                >
                  {`Expires in ${timeLeft.formattedTime}`}
                </Text>
              </>
            ) : (
              <Text fontSize={11} marginY={1}>
                {"Untouched wall"}
              </Text>
            )}
          </PopoverBody>
        </PopoverContent>
      )}
    </Popover>
  );
};
