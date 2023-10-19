import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { IdentityConnectWallet } from "@identity-connect/wallet-adapter-plugin";
import { useMemo, useState } from "react";
import { css } from "styled-system/css";

import { isServer } from "@/utils/isServer";
import { parseError } from "@/utils/parseError";

import { Button } from "../Button";
import { toast } from "../Toast";

export interface ExportWalletButtonProps {
  disabled?: boolean;
}

export function ExportWalletButton({ disabled }: ExportWalletButtonProps) {
  const { wallets } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const icWallet = useMemo(() => {
    if (isServer()) return undefined;
    return wallets.find((w) => w instanceof IdentityConnectWallet) as
      | IdentityConnectWallet
      | undefined;
  }, [wallets]);

  return (
    <Button
      disabled={disabled}
      loading={isLoading}
      onClick={async () => {
        if (disabled) return;
        setIsLoading(true);
        try {
          await icWallet?.offboardDappWallet();
        } catch (e) {
          toast({
            id: "offboard-failure",
            variant: "error",
            content: `Wallet Error: ${parseError(e)}`,
          });
        }
        setIsLoading(false);
      }}
      className={css({ w: "100%" })}
    >
      Export Graffio Wallet{disabled ? " (Coming Soon)" : ""}
    </Button>
  );
}
