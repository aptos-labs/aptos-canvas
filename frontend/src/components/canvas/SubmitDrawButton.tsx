import { Button, useToast } from "@chakra-ui/react";
import { hexToRgb } from "./helpers";
import { drawOne } from "../../api/transactions";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { getModuleId, useGlobalState } from "../../GlobalState";
import { useParams } from "react-router-dom";

export default function SubmitDrawButton({
  squaresToDraw,
}: {
  squaresToDraw: { x: number; y: number }[];
}) {
  console.log("squaresToDraw", squaresToDraw);
  const toast = useToast();
  const [state] = useGlobalState();
  const moduleId = getModuleId(state);
  const address = useParams().address!;

  const { connected, signAndSubmitTransaction } = useWallet();
  // TODO: submit transaction for squaresToDraw instead of squareToDraw
  const submitDraw = async () => {
    const colorToSubmit = "#555555";
    try {
      const out = hexToRgb(colorToSubmit);
      if (out === null) {
        throw `Failed to parse color: ${colorToSubmit}`;
      }
      const { r, g, b } = out;
      await drawOne(
        signAndSubmitTransaction,
        moduleId,
        state.network_info.node_api_url,
        address,
        squaresToDraw[0].x,
        squaresToDraw[0].y,
        r,
        g,
        b,
      );
      toast({
        title: "Success!",
        description: "Successfully drew pixel!!",
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
      // setColorToSubmit(MARGIN_COLOR);
      // On failure, reset the color of the square.
      // resetSquare(squareToDraw.x, squareToDraw.y);
    } finally {
      // TODO: close the confirmation modal
    }
  };

  return (
    <div style={{ position: "absolute", top: 20, left: 20 }}>
      <Button
        backgroundColor="#4339F2"
        color="white"
        display="flex"
        justifyContent="center"
        alignItems="center"
        onClick={submitDraw}
      >
        Finish Drawing
      </Button>
    </div>
  );
}
