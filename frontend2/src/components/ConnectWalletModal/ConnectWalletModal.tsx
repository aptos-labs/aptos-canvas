import {
  isRedirectable,
  useWallet,
  Wallet,
  WalletReadyState,
} from "@aptos-labs/wallet-adapter-react";
import Image from "next/image";
import Link from "next/link";
import { css } from "styled-system/css";
import { flex, stack } from "styled-system/patterns";

import { Button } from "../Button";
import { ModalContent, openModal } from "../Modal";

export function openConnectWalletModal() {
  openModal({
    id: "connect-wallet-modal",
    content: ({ hide }) => <ConnectWalletModal hide={hide} />,
  });
}

function ConnectWalletModal({ hide }: { hide: () => void }) {
  const { connect, wallets } = useWallet();

  return (
    <ModalContent className={stack({ maxW: "md", gap: 24 })}>
      <h1 className={css({ textStyle: "heading.xl", textAlign: "center" })}>Connect Wallet</h1>
      <div className={stack({ gap: 16 })}>
        {wallets.map((wallet) => {
          const connectWallet = () => {
            connect(wallet.name);
            hide();
          };
          return <WalletConnectButton key={wallet.name} wallet={wallet} connect={connectWallet} />;
        })}
      </div>
    </ModalContent>
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
    if (mobileSupport) {
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
      return (
        <div
          className={flex({
            align: "center",
            justify: "space-between",
            px: 16,
            py: 12,
            gap: 16,
            bg: "interactive.secondary.disabled",
            rounded: "lg",
          })}
        >
          <div className={flex({ align: "center", gap: 16 })}>
            <Image src={wallet.icon} alt={`${wallet.name} icon`} height={24} width={24} />
            <div className={css({ textStyle: "body.md.medium" })}>{wallet.name}</div>
          </div>
        </div>
      );
    }
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
