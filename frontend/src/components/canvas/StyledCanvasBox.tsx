import React from "react";
import { Box } from "@chakra-ui/react";
import { HEADER_HEIGHT } from "../header/Header";

export const StyledCanvasBox = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Box
      display="flex"
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
      height={`calc(100vh - ${HEADER_HEIGHT}px)`}
    >
      {children}
    </Box>
  );
};
