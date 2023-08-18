import { Box, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import NetworkSelect from "../NetworkSelect";
import "./wallet.css";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

export const HEADER_HEIGHT = 80;

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

// TODO: Figure out how to make IconButton padding for GitHub button the same
// as the color switcher button.
export default function Header() {
  var headerMiddle = null;

  headerMiddle = (
    <Text textAlign="center" letterSpacing={5} fontSize={18}>
      {getRandomFaceEmoji().repeat(3)}
    </Text>
  );

  let walletConnectComponent = <WalletSelector />;

  return (
    <Box
      paddingX={8}
      height={HEADER_HEIGHT}
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Flex alignItems="center" gap="2">
        <Flex alignItems="center" flex="1">
          <Text
            fontSize={14}
            fontWeight="normal"
            color="#666666"
            marginRight={1}
          >
            Welcome to
          </Text>
          <Link to="/">
            <Text fontSize={14} fontWeight="bold" color="#666666">
              Graffio
            </Text>
          </Link>
          <Text
            fontSize={14}
            fontWeight="normal"
            color="#666666"
            marginRight={1}
          >
            . It’s Thursday, August 19, 2023 and 71º in Palo Alto, CA.
          </Text>
          <Text marginLeft={2}>{headerMiddle}</Text>
        </Flex>
        <Flex justifyContent="flex-end" alignItems="center" gap="2" flex="1">
          {walletConnectComponent}
          <Box marginBottom={0.5}>
            <NetworkSelect />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
