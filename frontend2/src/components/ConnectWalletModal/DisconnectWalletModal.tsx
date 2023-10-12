"use client";

import { emitCanvasCommand, useCanvasState } from "@/contexts/canvas";

import { DeleteModalContent, openModal } from "../Modal";

export function openDisconnectWalletModal(props: Omit<DisconnectWalletModalProps, "hide">) {
  openModal({
    id: "disconnect-wallet-modal",
    content: ({ hide }) => <DisconnectWalletModal hide={hide} {...props} />,
  });
}

interface DisconnectWalletModalProps {
  hide: () => void;
  disconnect: () => void;
}

function DisconnectWalletModal(props: DisconnectWalletModalProps) {
  return (
    <DeleteModalContent
      heading="Disconnect Wallet"
      content="Are you sure you want to disconnect your wallet?"
      deleteLabel="Disconnect"
      onConfirm={() => {
        props.disconnect();
        useCanvasState.setState({ isViewOnly: true });
        emitCanvasCommand("clearChangedPixels");
        props.hide();
      }}
      hide={props.hide}
    />
  );
}
