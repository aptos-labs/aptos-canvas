import {
  isRedirectable,
  useWallet,
  Wallet,
  WalletReadyState,
} from "@aptos-labs/wallet-adapter-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { css } from "styled-system/css";
import { flex, stack } from "styled-system/patterns";

import { Accordion } from "../Accordion";
import { Button } from "../Button";
import { ModalContent, openModal } from "../Modal";

export function openConnectWalletModal() {
  openModal({
    id: "connect-wallet-modal",
    content: ({ hide }) => <ConnectWalletModal hide={hide} />,
  });
}

function ConnectWalletModal({ hide }: { hide: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { connect, wallets } = useWallet();

  const { defaultWallets, moreWallets } = partitionWallets(wallets);

  const getConnect = (wallet: Wallet) => () => {
    connect(wallet.name);
    hide();
  };

  return (
    <ModalContent className={stack({ maxW: "md", gap: 24 })}>
      <h1 className={css({ textStyle: "heading.xl", textAlign: "center" })}>Connect Wallet</h1>
      <div className={stack({ gap: 16 })}>
        {defaultWallets.map((wallet) => {
          return (
            <WalletConnectButton key={wallet.name} wallet={wallet} connect={getConnect(wallet)} />
          );
        })}
        <Accordion trigger="More Options" isExpanded={isExpanded} setIsExpanded={setIsExpanded}>
          <div className={stack({ gap: 16 })}>
            {moreWallets.map((wallet) => {
              return (
                <WalletConnectButton
                  key={wallet.name}
                  wallet={wallet}
                  connect={getConnect(wallet)}
                />
              );
            })}
          </div>
        </Accordion>
      </div>
    </ModalContent>
  );
}

function partitionWallets(wallets: ReadonlyArray<Wallet>) {
  const defaultWallets: Array<Wallet> = [];
  const moreWallets: Array<Wallet> = [];

  for (const wallet of wallets) {
    if (isDefaultWallet(wallet)) defaultWallets.push(wallet);
    else moreWallets.push(wallet);
  }

  return { defaultWallets, moreWallets };
}

function isDefaultWallet(wallet: Wallet) {
  return (
    wallet.readyState === WalletReadyState.Installed ||
    wallet.readyState === WalletReadyState.Loadable
  );
}

interface WalletConnectButtonProps {
  wallet: Wallet;
  connect: () => void;
}

function WalletConnectButton({ wallet, connect }: WalletConnectButtonProps) {
  const isWalletReady =
    wallet.readyState === WalletReadyState.Installed ||
    wallet.readyState === WalletReadyState.Loadable;
  const mobileSupport = wallet.deeplinkProvider;

  if (!isWalletReady && isRedirectable()) {
    if (!mobileSupport) return null;
    return (
      <div
        className={flex({
          align: "center",
          justify: "space-between",
          px: 16,
          py: 12,
          gap: 16,
          bg: "interactive.secondary.hovered",
          rounded: "lg",
        })}
      >
        <div className={flex({ align: "center", gap: 16 })}>
          <Image src={wallet.icon} alt={`${wallet.name} icon`} height={24} width={24} />
          <div className={css({ textStyle: "body.md.medium" })}>{wallet.name}</div>
        </div>
        <Button size="xs" onClick={connect}>
          Connect
        </Button>
      </div>
    );
  } else {
    const isLoadable =
      wallet.readyState === WalletReadyState.Installed ||
      wallet.readyState === WalletReadyState.Loadable;

    return (
      <div
        className={flex({
          align: "center",
          justify: "space-between",
          px: 16,
          py: 12,
          gap: 16,
          bg: "interactive.secondary.hovered",
          rounded: "lg",
        })}
      >
        <div className={flex({ align: "center", gap: 16 })}>
          <Image src={wallet.icon} alt={`${wallet.name} icon`} height={24} width={24} />
          <div className={css({ textStyle: "body.md.medium" })}>{wallet.name}</div>
        </div>
        {isLoadable ? (
          <Button size="xs" onClick={connect}>
            Connect
          </Button>
        ) : (
          <Link
            href={wallet.url}
            target="_blank"
            rel="noopener noreferrer"
            className={css({
              textStyle: "body.md.medium",
              px: 16,
              lineHeight: "32px",
              color: "interactive.primary",
            })}
          >
            Install
          </Link>
        )}
      </div>
    );
  }
}
