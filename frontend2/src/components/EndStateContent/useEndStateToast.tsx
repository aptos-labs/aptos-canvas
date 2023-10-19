import { ReactNode, useEffect } from "react";
import { stack } from "styled-system/patterns";

import { isMintComplete } from "@/contexts/canvas";

import { removeToast, toast } from "../Toast";
import { ExportWalletButton } from "./ExportWalletButton";
import { ViewNftButton } from "./ViewNftButton";

const NOT_CONNECTED_TOAST_ID = "end-not-connected";
const GRAFFIO_WALLET_TOAST_ID = "end-graffio-wallet";
const OTHER_WALLET_TOAST_ID = "end-other-wallet";

export interface EndStateToastArgs {
  connected: boolean;
  isGraffioWallet: boolean;
}

export function useEndStateToast({ connected, isGraffioWallet }: EndStateToastArgs) {
  useEffect(() => {
    if (connected) return;
    toast({
      id: NOT_CONNECTED_TOAST_ID,
      variant: "info",
      duration: null,
      content: (
        <div className={stack({ gap: 0 })}>
          <span>Thanks for visiting Graffio!</span>
          <span>The canvas is now closed.</span>
        </div>
      ),
    });
    return () => {
      removeToast(NOT_CONNECTED_TOAST_ID);
    };
  }, [connected]);

  useEffect(() => {
    if (!isGraffioWallet) return;
    toast({
      id: GRAFFIO_WALLET_TOAST_ID,
      variant: "info",
      duration: null,
      content: isMintComplete ? (
        <EndToastWrapper
          heading="Thanks for participating in Graffio!"
          text="We have minted a commemorative NFT of this canvas for you. To take it with you, please export your Graffio wallet and import it to another Aptos wallet."
        >
          <ExportWalletButton />
        </EndToastWrapper>
      ) : (
        <EndToastWrapper
          heading="Thanks for participating in Graffio!"
          text="We are working on minting a commemorative NFT of this canvas for you. You’ll soon be able to take it with you. Check back in a bit!"
        >
          <ExportWalletButton disabled />
        </EndToastWrapper>
      ),
    });
    return () => {
      removeToast(GRAFFIO_WALLET_TOAST_ID);
    };
  }, [isGraffioWallet]);

  useEffect(() => {
    if (!connected || isGraffioWallet) return;
    toast({
      id: OTHER_WALLET_TOAST_ID,
      variant: "info",
      duration: null,
      content: isMintComplete ? (
        <EndToastWrapper
          heading="Thanks for participating in Graffio!"
          text="We have minted a commemorative NFT of this canvas for you and sent it to the wallet you previously connected."
        >
          <ViewNftButton />
        </EndToastWrapper>
      ) : (
        <EndToastWrapper
          heading="Thanks for participating in Graffio!"
          text="We are working on minting a commemorative NFT of this canvas for you. You’ll soon be able to take it with you. Check back in a bit!"
        >
          <ViewNftButton disabled />
        </EndToastWrapper>
      ),
    });
    return () => {
      removeToast(OTHER_WALLET_TOAST_ID);
    };
  }, [connected, isGraffioWallet]);
}

interface EndToastWrapperProps {
  heading: string;
  text: string;
  children: ReactNode;
}

function EndToastWrapper({ heading, text, children }: EndToastWrapperProps) {
  return (
    <div className={stack({ gap: 0 })}>
      <span>{heading}</span>
      <span>{text}</span>
      <div className={stack({ display: "none", md: { display: "flex" }, mt: 24, px: 0 })}>
        {children}
      </div>
    </div>
  );
}
