import React from "react";
import { Box, Container, Flex } from "@chakra-ui/react";
import Header from "./Header";
import Footer from "./Footer";
import dynamic from "next/dynamic";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Flex direction="column" minH="100vh">
      <Header />
      <Box flex="1">
        <Container maxW="container.lg" py={6}>
          {children}
        </Container>
      </Box>
      <Footer />
    </Flex>
  );
};

export default dynamic(() => Promise.resolve(Layout), { ssr: false });
