import { Text, VStack } from "@chakra-ui/react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useGetPntBalance } from "../../api/hooks/useGetPntBalance";

function PaintIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M19.228 18.732l1.768-1.768 1.767 1.768a2.5 2.5 0 11-3.535 0zM8.878 1.08l11.314 11.313a1 1 0 010 1.415l-8.485 8.485a1 1 0 01-1.414 0l-8.485-8.485a1 1 0 010-1.415l7.778-7.778-2.122-2.121L8.88 1.08zM11 6.03L3.929 13.1H18.07L11 6.03z" />
    </svg>
  );
}

// Don't try to use this without the wallet being connected.
export default function PaintInfo() {
  const { account } = useWallet();

  const enabled = !!account;

  const { data, isFetched } = useGetPntBalance(account?.address ?? "", {
    enabled,
  });

  // On chain, it costs 100 units to paint a pixel. PNT, the fungible asset, uses
  // two decimal places. As such, if the user has 1000 units on chain, we tell the
  // user that they have 10 PNT. We choose not to show them decimal places to
  // maintain the illusion that there is no such thing as fractional PNT.
  const pntAmount = Math.floor((data ?? 0) / 100);

  let pntString;

  if (!isFetched && enabled) {
    pntString = "...";
  } else {
    pntString = pntAmount.toLocaleString();
  }

  return (
    <VStack paddingY={2}>
      <PaintIcon />
      <Text fontSize={14} color="#555555" marginTop={1}>
        {pntString}
      </Text>
      <Text fontSize={12} color="#555555">
        PNT
      </Text>
    </VStack>
  );
}
