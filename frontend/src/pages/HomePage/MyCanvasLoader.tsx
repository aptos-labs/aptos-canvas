import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Box, Center, Text } from "@chakra-ui/react";
import { getGqlUrl, getModuleId, useGlobalState } from "../../GlobalState";
import { NetworkMismatchPage } from "../../components/NetworkMismatchPage";
import { useGetAccountResources } from "../../api/hooks/useGetAccountResources";
import { Token, Canvas } from "../../canvas/generated/types";
import { MyCanvas } from "../../components/canvas/MyCanvas";
import { getPixelAttribution } from "../../api";

export const MyCanvasLoader = ({ address }: { address: string }) => {
  const { network } = useWallet();
  const [state, _] = useGlobalState();
  const moduleId = getModuleId(state);

  const { data, error, isLoading } = useGetAccountResources(address);

  // Don't show the main content if the wallet and site networks mismatch.
  if (
    network &&
    !network.name.toLowerCase().startsWith(state.network_name.toLowerCase())
  ) {
    return (
      <NetworkMismatchPage
        walletNetworkName={network.name.toLowerCase()}
        siteNetworkName={state.network_name}
      />
    );
  }

  if (isLoading) {
    return (
      <Center p={3} height="100%" flex="1" overflow="auto">
        <Text>{`Loading data for canvas at ${address}`}</Text>
      </Center>
    );
  }

  if (error != null) {
    return (
      <Center p={3} height="100%" flex="1" overflow="auto">
        <Text>{`Error loading data for canvas at ${address}: ${JSON.stringify(
          error,
        )}`}</Text>
      </Center>
    );
  }

  const canvasResource = data!.find(
    (resource) => resource.type === `${moduleId}::Canvas`,
  );

  const tokenResource = data!.find(
    (resource) => resource.type === "0x4::token::Token",
  );

  if (canvasResource == null) {
    return (
      <Center p={3} height="100%" flex="1" overflow="auto">
        <Text>{`Could not find a canvas at ${address}`}</Text>
      </Center>
    );
  }

  const canvasData: Canvas = canvasResource.data as any;
  const tokenData: Token = tokenResource!.data as any;

  return (
    <Box>
      <MyCanvas
        canvasAddress={address}
        canvasData={canvasData}
        tokenData={tokenData}
      />
    </Box>
  );
};
