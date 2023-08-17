import { Box, Flex, Heading, IconButton, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import NetworkSelect from "../NetworkSelect";
import { ColorModeSwitcher } from "../ColorModeSwitcher";

export const HEADER_HEIGHT = 100;

export const ConnectWalletComponent = () => {
  // Wallet icon component.
  return <WalletSelector />;
};

// TODO: Figure out how to make IconButton padding for GitHub button the same
// as the color switcher button.
export default function Header() {
  var headerMiddle = null;

  function getRandomFaceEmoji(): string {
    const emojis = [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "🤠",
      "😊",
      "🥳",
      "🫨",
      "🤧",
      "😐",
      "😳",
    ];
    const randomIndex = Math.floor(Math.random() * emojis.length);
    return emojis[randomIndex];
  }

  headerMiddle = (
    <Text textAlign="center" letterSpacing={5} fontSize={18}>
      {getRandomFaceEmoji().repeat(3)}
    </Text>
  );

  let walletConnectComponent = <WalletSelector />;

  return (
    <Box
      paddingTop={5}
      paddingBottom={5}
      paddingLeft={8}
      paddingRight={8}
      h={HEADER_HEIGHT}
    >
      <Flex alignItems="center" gap="2">
        <Flex alignItems="center" gap="2" flex="1">
          <Box>
            <Link to="/">
              <Heading size="md">Aptos Canvas</Heading>
            </Link>
          </Box>
        </Flex>
        <Flex justifyContent="center" alignItems="center" gap="2" flex="1">
          {headerMiddle}
        </Flex>
        <Flex justifyContent="flex-end" alignItems="center" gap="2" flex="1">
          <a href="https://github.com/banool/aptos-canvas">
            <IconButton
              size="xs"
              fontSize="sm"
              variant="ghost"
              color="current"
              marginRight="3"
              icon={
                <svg
                  viewBox="0 0 16 16"
                  focusable="false"
                  className="chakra-icon css-ag1zpf"
                >
                  <path
                    fill="currentColor"
                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
                  ></path>
                </svg>
              }
              aria-label={`View source code on GitHub`}
            />
          </a>
          <NetworkSelect />
          <ColorModeSwitcher />
          {walletConnectComponent}
        </Flex>
      </Flex>
    </Box>
  );

  // Courtesy of https://stackoverflow.com/q/75175422/3846032.
  // // Blur the content if we're connecting a wallet.
  // let out;
  // if (isLoading) {
  //   out = (
  //     <Box
  //       filter="blur(4px) brightness(0.8)"
  //       pointerEvents="none"
  //       position="absolute"
  //       width="100%"
  //       height="100%"
  //     >
  //       {body}
  //     </Box>
  //   );
  // } else {
  //   out = body;
  // }

  // return out;
}
