import { Box, Text, Button, HStack, VStack, useToast } from "@chakra-ui/react";
import { hexToRgb } from "../../helpers";
import { draw } from "../../api/transactions";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getModuleId, useGlobalState } from "../../GlobalState";
import { useParams } from "react-router-dom";
import BottomComponentWrapper from "./BottomComponentWrapper";
import { useState } from "react";

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
      <Text>{`Beautiful artwork! This will cost ${paintPrice} PNT. Add it to the wall?`}</Text>
    </Box>
  );
}

export default function SubmitDrawButton({
  canvasAddress,
  squaresToDraw,
}: {
  canvasAddress: string;
  squaresToDraw: { x: number; y: number }[];
}) {
  const toast = useToast();
  const [state] = useGlobalState();
  const moduleId = getModuleId(state);
  const { connected, signAndSubmitTransaction } = useWallet();

  const [confirming, setConfirming] = useState(false);

  // TODO: @dport get paint price
  const dummyPaintPrice = 130;

  // TODO: @dport submit transaction for squaresToDraw instead of squareToDraw
  const submitDraw = async () => {
    const colorToSubmit = "#555555";

    try {
      const out = hexToRgb(colorToSubmit);
      if (out === null) {
        throw `Failed to parse color: ${colorToSubmit}`;
      }
      const { r, g, b } = out;
      // TODO: Temporary hack, squaresToDraw should have the color info attached
      // on a per pixel basis.
      const xs = squaresToDraw.map((square) => square.x);
      const ys = squaresToDraw.map((square) => square.y);
      const rs = new Array(squaresToDraw.length).fill(r);
      const gs = new Array(squaresToDraw.length).fill(g);
      const bs = new Array(squaresToDraw.length).fill(b);
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
      // TODO: close the confirmation modal
    }
  };

  const closeConfirmationModal = () => {
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
      <Button
        backgroundColor={PRIMARY_COLOR}
        color={SECONDARY_COLOR}
        display="flex"
        justifyContent="center"
        alignItems="center"
        width={BUTTON_WIDTH}
        fontSize={FONT_SIZE}
        onClick={openConfirmationModal}
      >
        Finish Drawing
      </Button>
    </BottomComponentWrapper>
  );
}
