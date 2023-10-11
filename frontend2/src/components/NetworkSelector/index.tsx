"use client";

import { NetworkName } from "@aptos-labs/wallet-adapter-react";
import { css } from "styled-system/css";

import { useAptosNetworkState } from "@/contexts/wallet";
import { capitalizeFirstLetter } from "@/utils/string";

export function NetworkSelector() {
  const { network, setNetwork } = useAptosNetworkState();

  return (
    <select
      className={select}
      value={network}
      onChange={(e) => {
        const network = e.currentTarget.value as NetworkName;
        if (network !== NetworkName.Mainnet && network !== NetworkName.Testnet) {
          console.error(`Unexpected network ${network}`);
          return;
        }
        setNetwork(network);
      }}
    >
      {Object.values(NetworkName)
        .filter((networkName) => networkName !== NetworkName.Devnet)
        .map((networkName) => (
          <option key={networkName} value={networkName}>
            {capitalizeFirstLetter(networkName)}
          </option>
        ))}
    </select>
  );
}

const select = css({
  textStyle: "body.md.regular",
  color: "text.secondary",
  bg: "transparent",
  cursor: "pointer",
});
