import { Box, Text, Button, HStack, VStack, useToast } from "@chakra-ui/react";
import { hexToRgb } from "../../helpers";
import { draw } from "../../api/transactions";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getModuleId, useGlobalState } from "../../GlobalState";
import { useParams } from "react-router-dom";
import BottomComponentWrapper from "./BottomComponentWrapper";
import { useState } from "react";
import { DrawPixelIntent } from "./DrawingCanvas";
import { useDrawMode } from "../../context/DrawModeContext";

// TODO: move to colors.ts
const BG_COLOR_LIGHT = "#ffffff";
const PRIMARY_COLOR = "#4339F2";
const SECONDARY_COLOR = "#ffffff";

const BUTTON_WIDTH = 150;
const FONT_SIZE = 13;

function ConfirmationModal({ paintPrice }: { paintPrice: number }) {
  return (
    <Box
      borderRadius={8}
      boxShadow={"0px 0px 4px rgba(0, 0, 0, 0.5)"}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      padding={4}
      fontSize={FONT_SIZE}
    >
      <Text>{`Beautiful artwork! Add it to the wall?`}</Text>
    </Box>
  );
  //<Text>{`Beautiful artwork! This will cost ${paintPrice} PNT. Add it to the wall?`}</Text>
}

export default function SubmitDrawButton({
  canvasAddress,
  squaresToDraw,
  setSquaresToDraw,
  onClearCanvas,
}: {
  canvasAddress: string;
  squaresToDraw: DrawPixelIntent[];
  setSquaresToDraw: (squares: DrawPixelIntent[]) => void;
  onClearCanvas: () => void;
}) {
  const toast = useToast();
  const [state] = useGlobalState();
  const moduleId = getModuleId(state);
  const { signAndSubmitTransaction } = useWallet();

  const [confirming, setConfirming] = useState(false);

  // TODO: @dport get paint price
  const dummyPaintPrice = 130;

  // TODO: @dport submit transaction for squaresToDraw instead of squareToDraw
  const submitDraw = async () => {
    try {
      const xs = squaresToDraw.map((square) => square.x);
      const ys = squaresToDraw.map((square) => square.y);
      const rs = squaresToDraw.map((square) => square.color.r);
      const gs = squaresToDraw.map((square) => square.color.g);
      const bs = squaresToDraw.map((square) => square.color.b);
      await draw(
        signAndSubmitTransaction,
        moduleId,
        state.network_info.node_api_url,
        canvasAddress,
        xs,
        ys,
        rs,
        gs,
        bs,
      );
      toast({
        title: "Success!",
        description: "Successfully drew pixels!!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: "Failure",
        description: `Failed to draw pixel: ${e}`,
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setConfirming(false);
    }
  };

  const closeConfirmationModal = () => {
    setSquaresToDraw([]);
    setConfirming(false);
  };

  const openConfirmationModal = () => {
    setConfirming(true);
  };

  return confirming ? (
    <BottomComponentWrapper>
      <VStack spacing={4}>
        <ConfirmationModal paintPrice={dummyPaintPrice} />
        <HStack spacing={2}>
          <Button
            backgroundColor={SECONDARY_COLOR}
            color={PRIMARY_COLOR}
            borderColor={PRIMARY_COLOR}
            borderWidth="1px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            width={BUTTON_WIDTH}
            fontSize={FONT_SIZE}
            onClick={closeConfirmationModal}
          >
            No, Start Over
          </Button>
          <Button
            backgroundColor={PRIMARY_COLOR}
            color={SECONDARY_COLOR}
            display="flex"
            justifyContent="center"
            alignItems="center"
            width={BUTTON_WIDTH}
            fontSize={FONT_SIZE}
            onClick={submitDraw}
          >
            Yes, Add it!
          </Button>
        </HStack>
      </VStack>
    </BottomComponentWrapper>
  ) : (
    <BottomComponentWrapper>
      <HStack spacing={2}>
        <Button
          backgroundColor={SECONDARY_COLOR}
          color={PRIMARY_COLOR}
          borderColor={PRIMARY_COLOR}
          borderWidth="1px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width={BUTTON_WIDTH}
          fontSize={FONT_SIZE}
          onClick={onClearCanvas}
        >
          Clear
        </Button>
        <Button
          backgroundColor={PRIMARY_COLOR}
          color={SECONDARY_COLOR}
          display="flex"
          justifyContent="center"
          alignItems="center"
          width={BUTTON_WIDTH}
          fontSize={FONT_SIZE}
          isDisabled={squaresToDraw.length === 0}
          onClick={openConfirmationModal}
        >
          Finish Drawing
        </Button>
      </HStack>
    </BottomComponentWrapper>
  );
}
