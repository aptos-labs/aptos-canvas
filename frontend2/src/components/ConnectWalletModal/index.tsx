"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect } from "react";
import { css } from "styled-system/css";

import { useCanvasState } from "@/contexts/canvas";
import { truncateAddress } from "@/utils/wallet";

import { removeToast, toast } from "../Toast";
import { openConnectWalletModal } from "./ConnectWalletModal";
import { openDisconnectWalletModal } from "./DisconnectWalletModal";

const TOAST_ID = "connect-wallet";

export function ConnectWalletButton() {
  const isCanvasInitialized = useCanvasState((s) => s.isInitialized);
  const { disconnect, account, connected } = useWallet();

  useEffect(() => {
    if (!isCanvasInitialized) return;

    if (!connected) {
      toast({
        id: TOAST_ID,
        variant: "info",
        content: "Connect a wallet to draw on the canvas!",
        duration: null,
      });
    } else {
      removeToast(TOAST_ID);
    }
  }, [connected, isCanvasInitialized]);

  return connected ? (
    <button
      className={buttonStyles}
      onClick={() => {
        openDisconnectWalletModal({ disconnect });
      }}
    >
      {account?.ansName || truncateAddress(account?.address) || "Unknown"}
    </button>
  ) : (
    <button className={buttonStyles} onClick={openConnectWalletModal}>
      Connect a Wallet
    </button>
  );
}

const buttonStyles = css({
  cursor: "pointer",
  textStyle: "body.md.regular",
  color: "interactive.primary",
  _hover: { color: "interactive.primary.hovered" },
  _active: { color: "interactive.primary.pressed" },
});
